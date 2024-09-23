import { v1 as uuid } from 'uuid';
import type Player from '../../Player';
import { BaseStep } from '../BaseStep';
import * as Contract from '../../utils/Contract';

interface ActivePrompt {
    buttons: { text: string; arg?: string; command?: string }[];
    menuTitle: string;
    promptTitle?: string;

    controls?: { type: string; source: any; targets: any }[];
    selectCard?: boolean;
    selectOrder?: unknown;
    selectRing?: boolean;
}

export abstract class UiPrompt extends BaseStep {
    public completed = false;
    public uuid = uuid();

    public abstract activePrompt(player: Player): ActivePrompt;

    public abstract menuCommand(player: Player, arg: string, method: string): boolean;

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
        if (!this.activeCondition(player) || uuid !== this.uuid) {
            return false;
        }

        return this.menuCommand(player, arg, method);
    }

    public waitingPrompt() {
        return { menuTitle: 'Waiting for opponent' };
    }

    public setPrompt(): void {
        for (const player of this.game.getPlayers()) {
            if (this.activeCondition(player)) {
                player.setPrompt(this.addDefaultCommandToButtons(this.activePrompt(player)));
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

    private addDefaultCommandToButtons(original?: ActivePrompt) {
        Contract.assertNotNullLike(original);

        const newPrompt = { ...original };
        if (newPrompt.buttons) {
            for (const button of newPrompt.buttons) {
                button.command = button.command || 'menuButton';
                (button as any).uuid = this.uuid;
            }
        }

        if (newPrompt.controls) {
            for (const controls of newPrompt.controls) {
                (controls as any).uuid = this.uuid;
            }
        }
        return newPrompt;
    }

    private clearPrompts(): void {
        for (const player of this.game.getPlayers()) {
            player.cancelPrompt();
        }
    }
}
