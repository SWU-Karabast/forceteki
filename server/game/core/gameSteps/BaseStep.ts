import type { Card } from '../card/Card';
import type Game from '../Game';
import type Player from '../Player';
import type { IStep } from './IStep';
import { IStatefulPromptResults } from './StatefulPromptInterfaces';

export abstract class BaseStep implements IStep {
    public constructor(public game: Game) {}

    /**
     * Resolve the pipeline step
     * @returns {boolean} True if step has finished resolving upon return, false if it has not (typically because new steps have been queued that need to be resolved first)
     */
    public abstract continue(): boolean;

    public onCardClicked(player: Player, card: Card): boolean {
        return false;
    }

    public onMenuCommand(player: Player, arg: string, uuid: string, method: string): boolean {
        return false;
    }

    public onStatefulPromptResults(player: Player, results: IStatefulPromptResults): boolean {
        return false;
    }

    public getDebugInfo(): string {
        return this.constructor.name;
    }
}
