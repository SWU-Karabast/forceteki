import type Card = require('../card/Card');
import type Game = require('../Game');
import type Player = require('../Player');
import type { Step } from './Step';

export class BaseStep implements Step {
    constructor(public game: Game) {}

    public continue(): undefined | boolean {
        return undefined;
    }

    public onCardClicked(player: Player, card: Card): boolean {
        return false;
    }

    public onMenuCommand(player: Player, arg: string, uuid: string, method: string): boolean {
        return false;
    }

    public getDebugInfo(): string {
        return this.constructor.name;
    }
}
