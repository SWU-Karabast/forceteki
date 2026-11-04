import type { Attrs, Board, Entity, Seat } from '@swupgn/format';
import type { Game } from '../Game';
import type { Player } from '../Player';
import { PhaseName } from '../Constants';
import type { AudienceTracker } from './AudienceTracker';
import type { SwuPgnWriterState } from './SwuPgnWriterState';
import { projectCards, projectedCardId, seatIn } from './projectCards';
import { abilityUsesOf, projectEffects } from './projectEffects';

/**
 * Projects the live game into an SWU-PGN board: the full state after one decision.
 * Attributes that do not apply are omitted, never written as null (W-36).
 */
export class BoardProjector {
    public constructor(
        private readonly game: Game,
        private readonly state: SwuPgnWriterState,
        private readonly audiences: AudienceTracker | null
    ) {}

    public project(): Board {
        const entities: Board['entities'] = {
            g: this.projectGame(),
            p1: this.projectSeat(1),
            p2: this.projectSeat(2)
        };
        projectCards(this.game.allCards, this.state, (player) => this.seatOf(player), (card) => abilityUsesOf(card, this.game), entities);
        Object.assign(entities, projectEffects(this.game, this.state, (card) => projectedCardId(card, this.state, entities)));
        return { seq: null, entities };
    }

    private seatOf(player: Player | null): Seat | null {
        return seatIn(this.game, player);
    }

    private projectGame(): Entity {
        const game = this.game;
        const a: Attrs = {
            round: game.roundNumber,
            phase: game.currentPhase ?? PhaseName.Setup
        };

        const active = game.currentPhase === PhaseName.Action ? this.seatOf(game.actionPhaseActivePlayer) : null;
        if (active !== null) {
            a.active = active;
        }

        const initiative = this.seatOf(game.initiativePlayer);
        if (initiative !== null) {
            a.initiative = initiative;
        }
        a.initiativeTaken = game.isInitiativeClaimed;

        if (game.isEnded) {
            const winners = game.winnerNames.map((name) => this.seatOf(game.getPlayerByName(name)));
            a.result = winners.length === 1 && winners[0] !== null ? `p${winners[0]}` : 'draw';
        }
        return { a };
    }

    private projectSeat(seat: Seat): Entity {
        const player = this.game.getPlayers()[seat - 1];
        const a: Attrs = {};
        if (player) {
            a.deckCount = player.drawDeck.length;
            a.handCount = player.hand.length;
            if (player.creditTokenCount > 0) {
                a.credits = player.creditTokenCount;
            }
            if (player.hasTheForce) {
                a.force = true;
            }
        }
        return { a };
    }
}
