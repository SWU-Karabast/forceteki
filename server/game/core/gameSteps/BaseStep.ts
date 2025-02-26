import type { Card } from '../card/Card';
import type Game from '../Game';
import type Player from '../Player';
import * as Contract from '../utils/Contract';
import type { IStep } from './IStep';
import type { IStatefulPromptResults } from './PromptInterfaces';

export abstract class BaseStep implements IStep {
    public constructor(public game: Game) {}

    /**
     * Resolve the pipeline step
     * @returns {boolean} True if step has finished resolving upon return, false if it has not (typically because new steps have been queued that need to be resolved first)
     */
    public abstract continue(): boolean;

    public onCardClicked(player: Player, card: Card): boolean {
        Contract.fail(`Attempting to trigger onCardClicked prompt command for player '${player.name}' and card '${card.internalName} but it is not supported by the current step'`);
    }

    public onMenuCommand(player: Player, arg: string, uuid: string, method: string): boolean {
        Contract.fail(`Attempting to trigger onMenuCommand prompt command for player '${player.name}' but it is not supported by the current step`);
    }

    public onStatefulPromptResults(player: Player, results: IStatefulPromptResults, uuid: string): boolean {
        Contract.fail(`Attempting to trigger onStatefulPromptResults prompt command for player '${player.name}' but it is not supported by the current step`);
    }

    public onPerCardMenuCommand(player: Player, arg: string, cardUuid: string, uuid: string, method: string): boolean {
        Contract.fail(`Attempting to trigger onPerCardMenuCommand prompt command for player '${player.name}' but it is not supported by the current step`);
    }

    public getDebugInfo(): string {
        return this.constructor.name;
    }
}
