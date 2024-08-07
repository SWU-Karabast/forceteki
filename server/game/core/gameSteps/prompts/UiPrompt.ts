import { v1 as uuid } from 'uuid';
import type Player from '../../Player';
import { BaseStep } from '../BaseStep';
import Contract from '../../utils/Contract';

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

    abstract activePrompt(player: Player): ActivePrompt;

    abstract menuCommand(player: Player, arg: string, method: string): boolean;

    isComplete(): boolean {
        return this.completed;
    }

    complete(): void {
        this.completed = true;
    }

    setPrompt(): void {
        for (const player of this.game.getPlayers()) {
            if (this.activeCondition(player)) {
                player.setPrompt(this.#addDefaultCommandToButtons(this.activePrompt(player)));
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

    #addDefaultCommandToButtons(original?: ActivePrompt) {
        if (!Contract.assertNotNullLike(original)) {
            return null;
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

    public override continue(): boolean {
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

    public override onMenuCommand(player: Player, arg: string, uuid: string, method: string): boolean {
        if (!this.activeCondition(player) || uuid !== this.uuid) {
            return false;
        }

        return this.menuCommand(player, arg, method);
    }
}
