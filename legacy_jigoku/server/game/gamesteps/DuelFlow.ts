import type { AbilityContext } from '../AbilityContext';
import { EffectNames, EventNames } from '../Constants';
import type { Duel } from '../Duel';
import type Game from '../game';
import { BaseStepWithPipeline } from './BaseStepWithPipeline';
import { SimpleStep } from './SimpleStep';

/**
D. Duel Timing
D.1 Duel begins.
D.2 Establish challenger and challengee.
D.3 Duel honor bid.
D.4 Reveal honor dials.
D.5 Transfer honor.
D.6 Modify dueling skill.
D.7 Compare skill value and determine results.
D.8 Apply duel results.
D.9 Duel ends.
 */
export class DuelFlow extends BaseStepWithPipeline {
    constructor(
        game: Game,
        private duel: Duel,
        private resolutionHandler: (duel: Duel) => void,
        private costHandler?: (context: AbilityContext, prompt: any) => void
    ) {
        super(game);
        this.pipeline.initialise([
            new SimpleStep(this.game, () => this.#setCurrentDuel()),
            new SimpleStep(this.game, () => this.#startDuel()),
            new SimpleStep(this.game, () => this.#challenge()),
            new SimpleStep(this.game, () => this.#promptForHonorBid()),
            new SimpleStep(this.game, () => this.#modifyDuelingSkill()),
            new SimpleStep(this.game, () => this.#determineResults()),
            new SimpleStep(this.game, () => this.#announceResult()),
            new SimpleStep(this.game, () => this.#strike()),
            new SimpleStep(this.game, () => this.#applyDuelResults()),
            new SimpleStep(this.game, () => this.#cleanUpDuel()),
            new SimpleStep(this.game, () => this.game.checkGameState(true))
        ]);
    }

    #setCurrentDuel() {
        this.duel.previousDuel = this.game.currentDuel;
        this.game.currentDuel = this.duel;
        this.game.checkGameState(true);
    }

    #startDuel() {
        this.game.raiseEvent(EventNames.OnDuelStarted, { duel: this.duel });
    }

    #challenge() {
        this.game.raiseEvent(EventNames.OnDuelChallenge, { duel: this.duel });
    }

    #strike() {
        this.game.raiseEvent(EventNames.OnDuelStrike, { duel: this.duel });
    }

    #promptForHonorBid() {
        if (this.duel.challenger.mostRecentEffect(EffectNames.WinDuel) === this.duel) {
            return;
        }
        const prohibitedBids = {};
        for (const player of this.game.getPlayers()) {
            prohibitedBids[player.uuid] = Array.from(new Set(player.getEffects(EffectNames.CannotBidInDuels)));
        }
        this.game.promptForHonorBid(
            'Choose your bid for the duel\n' + this.duel.getTotalsForDisplay(),
            this.costHandler,
            prohibitedBids,
            this.duel
        );
    }

    #modifyDuelingSkill() {
        this.duel.modifyDuelingSkill();
    }

    #determineResults() {
        this.duel.determineResult();
    }

    #announceResult() {
        if (this.duel.challenger.mostRecentEffect(EffectNames.WinDuel) === this.duel) {
            this.game.addMessage('{0} wins the duel vs {1}', this.duel.challenger, this.duel.targets);
        } else {
            this.game.addMessage(this.duel.getTotalsForDisplay());
        }
        if (!this.duel.winner) {
            this.game.addMessage('The duel ends in a draw');
        }
        this.game.raiseEvent(EventNames.AfterDuel, {
            duel: this.duel,
            winner: this.duel.winner,
            loser: this.duel.loser,
            winningPlayer: this.duel.winningPlayer,
            losingPlayer: this.duel.losingPlayer
        });
    }

    #applyDuelResults() {
        this.game.raiseEvent(EventNames.OnDuelResolution, { duel: this.duel }, () => this.resolutionHandler(this.duel));
    }

    #cleanUpDuel() {
        this.game.currentDuel = this.duel.previousDuel;
        this.game.raiseEvent(EventNames.OnDuelFinished, { duel: this.duel });
        this.duel.cleanup();
    }
}
