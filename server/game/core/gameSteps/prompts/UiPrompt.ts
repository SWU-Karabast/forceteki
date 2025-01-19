import { v1 as uuid } from 'uuid';
import type Player from '../../Player';
import { BaseStep } from '../BaseStep';
import * as Contract from '../../utils/Contract';
import type { IPlayerPromptStateProperties } from '../../PlayerPromptState';
import * as Helpers from '../../utils/Helpers';
import type { IButton } from '../PromptInterfaces';

export abstract class UiPrompt extends BaseStep {
    public completed = false;
    public uuid = uuid();

    public abstract activePrompt(player: Player): IPlayerPromptStateProperties;

    public abstract menuCommand(player: Player, arg: string, uuid: string): boolean;

    public override continue(): boolean {
        const completed = this.isComplete();

        if (completed) {
            this.clearPrompts();
        } else {
            this.setPrompt();
        }

        return completed;
    }

    public isComplete(): boolean {
        return this.completed;
    }

    public complete(): void {
        this.completed = true;
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
                player.setPrompt(this.addButtonDefaultsToPrompt(this.activePrompt(player)));
                player.startClock();
            } else {
                player.setPrompt(this.waitingPrompt());
                player.resetClock();
            }
        }
    }

    protected activeCondition(player: Player): boolean {
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
