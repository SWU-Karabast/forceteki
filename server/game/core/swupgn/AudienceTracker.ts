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
import { seatIn } from './projectCards';
import type { SwuPgnWriterState } from './SwuPgnWriterState';

const publicZones: ReadonlySet<string> = new Set(ZONES.filter((zone) => zone.opponentSees === 'public').map((zone) => zone.name));

/**
 * Who knows each card's identity (SPEC §10.2), and which deck cards are temporary entities (W-24).
 *
 * The seats a reveal, look or search widens a card to are kept in the writer state per card key, so they roll back
 * with the game, and a card that re-enters a deck (a new generation) starts unknown again (W-22).
 */
export class AudienceTracker {
    /**
     * Deck cards someone saw since the last `endLooks()`, each with its card key when seen. Not rollback state:
     * the writer ends the looks after every flush, so this is empty at every decision point a snapshot is taken at.
     */
    private readonly viewed = new Map<Card, string>();
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
        this.listen(EventName.OnLookMoveDeckCardsTopOrBottom, (event: ILookMoveDeckCardsViewed) => this.show(event.cards, [this.seatOf(event.player)]));
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

    /** The deck cards someone saw since the last `endLooks()` that are still the same cards in a deck. */
    public viewedDeckCards(): readonly Card[] {
        const cards: Card[] = [];
        for (const [card, key] of this.viewed) {
            if (this.isStillViewed(card, key)) {
                cards.push(card);
            }
        }
        return cards;
    }

    /**
     * The looks are over: each viewed card still in a deck goes back unseen, so it stops being an entity
     * and forgets who saw it (W-24); it comes back as a new entity (W-22). A card that left the deck keeps both.
     */
    public endLooks(): void {
        for (const [card, key] of this.viewed) {
            if (card.zoneName === ZoneName.Deck || this.state.cardKey(card) !== key) {
                this.state.retire(key);
            }
        }
        this.viewed.clear();
    }

    private listen<TEvent>(eventName: EventName, handler: (event: TEvent) => void): void {
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
                this.viewed.set(card, key);
            }
        }
    }

    private isStillViewed(card: Card, key: string): boolean {
        return card.zoneName === ZoneName.Deck && this.state.cardKey(card) === key;
    }

    private seatOf(player: Player): Seat {
        const seat = seatIn(this.game, player);
        Contract.assertNotNullLike(seat, `SWU-PGN: player ${player?.name} has no seat`);
        return seat;
    }
}
