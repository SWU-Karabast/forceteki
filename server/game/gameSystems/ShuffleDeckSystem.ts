import type { AbilityContext } from '../core/ability/AbilityContext';
import { EventName } from '../core/Constants';
import type { IPlayerTargetSystemProperties } from '../core/gameSystem/PlayerTargetSystem';
import { PlayerTargetSystem } from '../core/gameSystem/PlayerTargetSystem';
import type Player from '../core/Player';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IShuffleDeckProperties extends IPlayerTargetSystemProperties {}

export class ShuffleDeckSystem<TContext extends AbilityContext = AbilityContext> extends PlayerTargetSystem<TContext, IShuffleDeckProperties> {
    public override readonly name = 'shuffle';
    public override readonly effectDescription = 'shuffle deck';
    protected override readonly eventName = EventName.OnDeckShuffled;

    public override defaultTargets(context: TContext): Player[] {
        return [context.player];
    }

    public eventHandler(event): void {
        event.context.player.shuffleDeck();
    }
}