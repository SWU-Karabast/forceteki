import { v1 as uuid } from 'uuid';
import type Player from '../../Player';
import { BaseStep } from '../BaseStep';

type ActivePrompt = {
    buttons: Array<{ text: string; arg?: string; command?: string }>;
    menuTitle: string;
    promptTitle?: string;

    controls?: Array<{ type: string; source: any; targets: any }>;
    selectCard?: boolean;
    selectOrder?: unknown;
    selectRing?: boolean;
};

export class UiPrompt extends BaseStep {
    public completed = false;
    public uuid = uuid();

    isComplete(): boolean {
        return this.completed;
    }

    complete(): void {
        this.completed = true;
    }

    setPrompt(): void {
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

    activeCondition(player: Player): boolean {
        return true;
    }

    activePrompt(player: Player): undefined | ActivePrompt {
        return undefined;
    }

    addDefaultCommandToButtons(original?: ActivePrompt) {
        if (!original) {
            return;
        }

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

    waitingPrompt() {
        return { menuTitle: 'Waiting for opponent' };
    }

    public continue(): boolean {
        const completed = this.isComplete();

        if (completed) {
            this.clearPrompts();
        } else {
            this.setPrompt();
        }

        return completed;
    }

    clearPrompts(): void {
        for (const player of this.game.getPlayers()) {
            player.cancelPrompt();
        }
    }

    public onMenuCommand(player: Player, arg: string, uuid: string, method: string): boolean {
        if (!this.activeCondition(player) || uuid !== this.uuid) {
            return false;
        }

        return this.menuCommand(player, arg, method);
    }

    menuCommand(player: Player, arg: string, method: string): boolean {
        return true;
    }
}
