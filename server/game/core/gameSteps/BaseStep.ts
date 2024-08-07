import type Card from '../card/Card';
import type Game from '../Game';
import type Player from '../Player';
import type { IStep } from './IStep';

export abstract class BaseStep implements IStep {
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
