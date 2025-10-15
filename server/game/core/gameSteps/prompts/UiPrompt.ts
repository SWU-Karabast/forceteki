import { v1 as uuid } from 'uuid';
import type { Player } from '../../Player';
import { BaseStep } from '../BaseStep';
import * as Contract from '../../utils/Contract';
import type { IPlayerPromptStateProperties } from '../../PlayerPromptState';
import * as Helpers from '../../utils/Helpers';
import type { IButton } from '../PromptInterfaces';
import type Game from '../../Game';
import type { AllPlayerPrompt } from './AllPlayerPrompt';

export abstract class UiPrompt extends BaseStep {
    public readonly uuid = uuid();

    private previousPrompt?: UiPrompt;
    private completed = false;
    private firstContinue = true;

    // indicates that the player just became active for this prompt
    // this is passed to the FE for the sake of being able to inform the player by e.g. making a sound
    private playerIsNewlyActive = new Map<Player, boolean>();

    public constructor(game: Game) {
        super(game);

        this.clearPrompts();
    }

    public abstract menuCommand(player: Player, arg: string, uuid: string): boolean;

    public abstract activePromptInternal(player: Player): IPlayerPromptStateProperties;

    public activePrompt(player: Player): IPlayerPromptStateProperties {
        return {
            playerIsNewlyActive: this.playerIsNewlyActive.get(player) || false,
            ...this.activePromptInternal(player)
        };
    }

    public override continue(): boolean {
        if (this.firstContinue) {
            this.previousPrompt = this.game.getCurrentOpenPrompt();
            this.game.setCurrentOpenPrompt(this);

            for (const player of this.game.getPlayers()) {
                this.playerIsNewlyActive.set(player, !player.activeForPreviousPrompt);
            }
        } else {
            for (const player of this.game.getPlayers()) {
                this.playerIsNewlyActive.set(player, false);
            }
        }

        const completed = this.isComplete();

        if (completed) {
            this.clearPrompts();
        } else {
            this.setPrompt();
        }

        this.firstContinue = false;

        return completed;
    }

    public isComplete(): boolean {
        return this.completed;
    }

    public complete(): void {
        this.completed = true;
        this.game.setCurrentOpenPrompt(this.previousPrompt);
    }

    public override onMenuCommand(player: Player, arg: string, uuid: string, method: string): boolean {
        this.checkPlayerAndUuid(player, uuid);
        return this.menuCommand(player, arg, uuid);
    }

    public waitingPrompt() {
        return { menuTitle: 'Waiting for opponent' };
    }

    public setPrompt(): void {
        for (const player of this.game.getPlayers()) {
            if (this.activeCondition(player)) {
                if (this.game.actionPhaseActivePlayer && this.game.actionPhaseActivePlayer !== player && this.isOpponentRevealNewInfoPrompt()) {
                    this.game.snapshotManager.setRequiresConfirmationToRollbackSingleAction(this.game.actionPhaseActivePlayer.id);
                }

                player.activeForPreviousPrompt = true;
                player.setPrompt(this.addButtonDefaultsToPrompt(this.activePrompt(player)));

                if (this.firstContinue) {
                    this.startActionTimer(player);
                }
            } else {
                player.activeForPreviousPrompt = false;
                player.setPrompt(this.waitingPrompt());
                player.actionTimer.stop();
            }
        }

        this.highlightSelectableCards();
    }

    public isAllPlayerPrompt(): this is AllPlayerPrompt {
        return false;
    }

    protected isOpponentRevealNewInfoPrompt(): boolean {
        return true;
    }

    protected startActionTimer(player: Player) {
        player.actionTimer.start();
    }

    protected highlightSelectableCards() {
        for (const player of this.game.getPlayers()) {
            player.setSelectableCards([]);
        }
    }

    public activeCondition(player: Player): boolean {
        return true;
    }

    /** Not used for card clicks since either player can always click on cards */
    protected checkPlayerAndUuid(player: Player, uuid: string) {
        Contract.assertTrue(this.activeCondition(player), `Player ${player.name} is not active for this prompt`);
        Contract.assertEqual(uuid, this.uuid);
    }

    private addButtonDefaultsToPrompt(original?: IPlayerPromptStateProperties) {
        Contract.assertNotNullLike(original);

        const newPrompt = { ...original };

        this.addDefaultsToButtons(newPrompt.buttons);
        this.addDefaultsToButtons(newPrompt.perCardButtons);

        return newPrompt;
    }

    private addDefaultsToButtons(buttons?: IButton[]) {
        for (const button of Helpers.asArray(buttons)) {
            button.command = button.command || 'menuButton';
            (button as any).uuid = this.uuid;
        }
    }

    private clearPrompts(): void {
        for (const player of this.game.getPlayers()) {
            player.cancelPrompt();
        }
    }
}
