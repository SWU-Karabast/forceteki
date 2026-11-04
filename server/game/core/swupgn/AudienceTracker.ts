import type { Audience, Seat } from '@swupgn/format';
import { ZONES } from '@swupgn/format';
import type { Card } from '../card/Card';
import { EventName, ZoneName } from '../Constants';
import type { Game } from '../Game';
import type { Player } from '../Player';
import { Contract } from '../utils/Contract';
import { logger } from '../../../logger';
import type { AspectsDisclosedEvent } from '../../gameSystems/DiscloseAspectsSystem';
import type { LookAtEvent } from '../../gameSystems/LookAtSystem';
import type { ILookMoveDeckCardsViewed } from '../../gameSystems/LookMoveDeckCardsTopOrBottomSystem';
import type { SearchDeckEvent } from '../../gameSystems/SearchDeckSystem';
import type { ViewCardEvent } from '../../gameSystems/ViewCardSystem';
import { seatIn, swuPgnZoneOf } from './projectCards';
import { SwuPgnEvents } from './SwuPgnEvents';
import type { ISwuPgnLook, SwuPgnWriterState } from './SwuPgnWriterState';

/** Selects the looks that end (true) at a flush. */
export type LookFilter = (look: ISwuPgnLook) => boolean;

const publicZones: ReadonlySet<string> = new Set(ZONES.filter((zone) => zone.opponentSees === 'public').map((zone) => zone.name));

/**
 * Who knows each card's identity (SPEC §10.2), and which deck cards are temporary entities (W-24).
 *
 * The seats a reveal, look or search widens a card to, and the looks in progress, are kept in the writer state per
 * card key, so they roll back with the game, and a card that re-enters a deck (a new generation) starts unknown again (W-22).
 */
export class AudienceTracker {
    private _errors = 0;

    public constructor(
        private readonly game: Game,
        private readonly state: SwuPgnWriterState
    ) {}

    /** Handler failures caught so far. A failure here never reaches the game. */
    public get errors(): number {
        return this._errors;
    }

    public register(): void {
        // a reveal shows the cards to every player (the prompted player only acknowledges the display)
        this.listen(EventName.OnCardRevealed, (event: ViewCardEvent) => this.show(event.cards, 'all'));
        this.listen(EventName.OnLookAtCard, (event: LookAtEvent) => this.show(event.cards, [this.seatOf(event.viewer)]));
        this.listen(EventName.OnDeckSearch, (event: SearchDeckEvent) =>
            this.show(event.viewedCards, [this.seatOf(event.searchProperties.choosingPlayer ?? event.player)])
        );
        this.listen(SwuPgnEvents.DeckCardsViewed, (event: ILookMoveDeckCardsViewed) => this.show(event.cards, [this.seatOf(event.player)]));
        // the disclose event carries the cards revealed from hand; its RevealSystem also emits OnCardRevealed for them
        this.listen(EventName.OnAspectsDisclosed, (event: AspectsDisclosedEvent) => this.show(event.disclosedCards ?? [], 'all'));
    }

    /**
     * The `to` of the card's entity in `zone`:
     * - a public zone gives `'all'`, and the card stays known to all wherever it goes next (SPEC §10.2),
     * - a deck gives the seats that saw it,
     * - a hand or the resource row gives the owner and every seat it was shown to.
     *
     * A list holding both seats is `'all'`.
     */
    public audienceFor(card: Card, zone: string): Audience {
        const key = this.state.cardKey(card);
        if (publicZones.has(zone)) {
            if (this.state.audienceOf(key).length < 2) {
                this.state.widen(key, 'all');
            }
            return 'all';
        }

        const seats = new Set<Seat>(this.state.audienceOf(key));
        if (zone !== 'deck') {
            seats.add(this.seatOf(card.owner));
        }
        return seats.size === 2 ? 'all' : [...seats];
    }

    /**
     * A card entered an engine zone. Entering a public zone makes it known to all at that moment (SPEC §10.2),
     * even when it leaves again before the next projection.
     */
    public onCardEnteredZone(card: Card, zoneName: ZoneName): void {
        const zone = swuPgnZoneOf(zoneName);
        if (zone !== null && publicZones.has(zone)) {
            const key = this.state.cardKey(card);
            if (this.state.audienceOf(key).length < 2) {
                this.state.widen(key, 'all');
            }
        }
    }

    /** Forgets the failures counted, for a writer that restarts its baseline (its state reset clears the looks). */
    public reset(): void {
        this._errors = 0;
    }

    /**
     * The deck cards in a look that are still the same cards in a deck: the temporary deck entities.
     * A look `ending` selects is left out, since it ends with the board being projected.
     */
    public viewedDeckCards(ending: LookFilter | null = null): readonly Card[] {
        const cards: Card[] = [];
        if (!this.state.hasLooks()) {
            return cards;
        }
        for (const card of this.game.allCards) {
            if (card.zoneName !== ZoneName.Deck) {
                continue;
            }
            const key = this.state.cardKey(card);
            const look = this.state.lookAt(key);
            // a rollback can restore a state in which the key was never widened: such a card is no temporary entity
            if (look !== undefined && this.state.audienceOf(key).length > 0 && !(ending?.(look) ?? false)) {
                cards.push(card);
            }
        }
        return cards;
    }

    /**
     * Ends the looks `ending` selects (all by default). A viewed card still in a deck goes back unseen, so it stops
     * being an entity and forgets who saw it (W-24); it comes back as a new entity (W-22). A card that left the deck
     * keeps both.
     */
    public endLooks(ending: LookFilter = () => true): void {
        if (!this.state.hasLooks()) {
            return;
        }
        const keys = this.state.lookKeys();
        const current = new Map<string, Card>();
        for (const card of this.game.allCards) {
            const key = this.state.cardKey(card);
            if (keys.includes(key)) {
                current.set(key, card);
            }
        }
        for (const key of keys) {
            const look = this.state.lookAt(key);
            if (look === undefined || !ending(look)) {
                continue;
            }
            const card = current.get(key);
            if (card !== undefined && card.zoneName !== ZoneName.Deck) {
                this.state.endLook(key);
            } else {
                // still in a deck, or back in one as a new generation
                this.state.retire(key);
            }
        }
    }

    private listen<TEvent>(eventName: string, handler: (event: TEvent) => void): void {
        this.game.on(eventName, (event: TEvent) => {
            try {
                handler(event);
            } catch (error) {
                this._errors++;
                if (this._errors <= 5) {
                    logger.error(`SWU-PGN: audience tracking failed on ${eventName}`, { error, lobbyId: this.game.lobbyId });
                }
            }
        });
    }

    private show(cards: readonly Card[], seats: Seat[] | 'all'): void {
        for (const card of cards) {
            const key = this.state.cardKey(card);
            this.state.widen(key, seats);
            if (card.zoneName === ZoneName.Deck) {
                this.state.addLook(key, seats);
            }
        }
    }

    private seatOf(player: Player): Seat {
        const seat = seatIn(this.game, player);
        Contract.assertNotNullLike(seat, `SWU-PGN: player ${player?.name} has no seat`);
        return seat;
    }
}
