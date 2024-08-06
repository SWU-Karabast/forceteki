import { EffectNames, EventNames } from '../../Constants';
import { parseGameMode } from '../../GameMode';
import type Game from '../../game';
import ActionWindow from '../actionwindow';

export class DynastyActionWindow extends ActionWindow {
    constructor(game: Game) {
        super(game, 'Play cards from provinces', 'dynasty');
    }

    activePrompt() {
        return {
            menuTitle: 'Click pass when done',
            buttons: super.activePrompt().buttons,
            promptTitle: this.title
        };
    }

    pass() {
        this.currentPlayer.passDynasty();

        if (this.#opponentPassed()) {
            this.#handleSimplePass();
            return this.complete();
        }

        if (parseGameMode(this.game.gameMode).dynastyPhasePassingFate) {
            this.#handlePassingFate();
        } else {
            this.#handleSimplePass();
        }

        this.nextPlayer();
    }

    nextPlayer() {
        this.#checkPhaseRestart();

        const otherPlayer = this.currentPlayer.opponent;
        if (otherPlayer && !otherPlayer.passedDynasty) {
            this.currentPlayer = otherPlayer;
        }
    }

    #opponentPassed(): boolean {
        return this.currentPlayer.opponent?.passedDynasty ?? true;
    }

    #handlePassingFate(): void {
        this.game.addMessage('{0} is the first to pass, and gains 1 fate', this.currentPlayer);
        this.game.raiseEvent(
            EventNames.OnPassDuringDynasty,
            { player: this.currentPlayer, firstToPass: true },
            (event: any) => event.player.modifyFate(1)
        );
    }

    #handleSimplePass(): void {
        this.game.addMessage('{0} passes', this.currentPlayer);
        this.game.raiseEvent(EventNames.OnPassDuringDynasty, { player: this.currentPlayer, firstToPass: false });
    }

    #checkPhaseRestart() {
        if (
            this.currentPlayer.anyEffect(EffectNames.RestartDynastyPhase) ||
            this.currentPlayer.opponent?.anyEffect?.(EffectNames.RestartDynastyPhase)
        ) {
            const effectSource = this.currentPlayer.mostRecentEffect(EffectNames.RestartDynastyPhase);
            this.game.addMessage('The dynasty phase is ended due to the effects of {0}', effectSource);
            this.complete();
        }
    }
}
