import type Card from '../card/Card';
import type Game from '../Game';
import type Player from '../Player';
import type { IStep } from './IStep';

export abstract class BaseStep implements IStep {
    // UP NEXT: add naming for steps, pipelines, etc. to make debugging easier. maybe source reference in debug mode
    // maybe names only in debug mode too?
    constructor(public game: Game) {}

    abstract continue(): boolean;

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
