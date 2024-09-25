import { AbilityContext } from '../core/ability/AbilityContext';
import { IPlayerTargetSystemProperties, PlayerTargetSystem } from '../core/gameSystem/PlayerTargetSystem';
import Player from '../core/Player';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IShuffleDeckProperties extends IPlayerTargetSystemProperties {}

export class ShuffleDeckSystem<TContext extends AbilityContext = AbilityContext> extends PlayerTargetSystem<TContext, IShuffleDeckProperties> {
    public override readonly name = 'shuffle';
    public override readonly effectDescription = 'shuffle deck';

    public override defaultTargets(context: TContext): Player[] {
        return [context.player];
    }

    public eventHandler(event): void {
        event.context.player.shuffleDeck();
    }
}