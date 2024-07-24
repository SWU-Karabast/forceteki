import type BaseCard = require('../card/basecard');
import type Game = require('../game');
import type Player = require('../player');
import type { Step } from './Step';

export class BaseStep implements Step {
    constructor(public game: Game) {}

    public continue(): undefined | boolean {
        return undefined;
    }

    public onCardClicked(player: Player, card: BaseCard): boolean {
        return false;
    }

    public onMenuCommand(player: Player, arg: string, uuid: string, method: string): boolean {
        return false;
    }

    public getDebugInfo(): string {
        return this.constructor.name;
    }
}
