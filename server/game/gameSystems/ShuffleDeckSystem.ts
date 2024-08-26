import { AbilityContext } from '../core/ability/AbilityContext';
import { IPlayerTargetSystemProperties, PlayerTargetSystem } from '../core/gameSystem/PlayerTargetSystem';
import Player from '../core/Player';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IShuffleDeckProperties extends IPlayerTargetSystemProperties {}

export class ShuffleDeckSystem extends PlayerTargetSystem<IShuffleDeckProperties> {
    public override readonly name = 'refill';
    public override readonly effectDescription = 'refill its province faceup';

    public override defaultTargets(context: AbilityContext): Player[] {
        return [context.player];
    }

    public eventHandler(event): void {
        event.player.shuffleDeck();
    }
}