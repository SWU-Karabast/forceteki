import type { AbilityContext } from '../core/ability/AbilityContext';
import { EventName, GameStateChangeRequired } from '../core/Constants';
import type { Player } from '../core/Player.js';
import type { IPlayerTargetSystemProperties } from '../core/gameSystem/PlayerTargetSystem.js';
import { PlayerTargetSystem } from '../core/gameSystem/PlayerTargetSystem.js';
import { ChatHelpers } from '../core/chat/ChatHelpers.js';

export interface IReadyResourcesSystemProperties extends IPlayerTargetSystemProperties {
    amount: number;
}

export class ReadyResourcesSystem<TContext extends AbilityContext = AbilityContext, TProperties extends IReadyResourcesSystemProperties = IReadyResourcesSystemProperties> extends PlayerTargetSystem<TContext, TProperties> {
    public override readonly name = 'readyResources';
    public override readonly eventName = EventName.OnReadyResources;

    protected override eventHandlerInternal(event): void {
        event.player.readyResources(event.amount);
    }

    protected override getEffectMessageInternal(context: TContext, properties: TProperties): [string, any[]] {
        const { amount } = properties;
        return ['ready {0}', [ChatHelpers.pluralize(amount, 'a resource', 'resources')]];
    }

    protected override canAffectInternal(player: Player, context: TContext, properties: TProperties, mustChangeGameState = GameStateChangeRequired.None): boolean {
        const { isCost, amount } = properties;

        // if this is a cost or an "if you do" condition, must ready all required resources
        if ((isCost || mustChangeGameState === GameStateChangeRequired.MustFullyResolve) && player.exhaustedResourceCount < amount) {
            return false;
        }

        // if this is for the effect of an ability, just need to have some effect
        if (mustChangeGameState === GameStateChangeRequired.MustFullyOrPartiallyResolve && player.exhaustedResourceCount === 0) {
            return false;
        }

        return super.canAffectInternal(player, context, properties, mustChangeGameState);
    }

    public override defaultTargets(context: TContext): Player[] {
        return [context.player];
    }

    protected override addPropertiesToEvent(event, player: Player, context: TContext, properties: TProperties): void {
        const { amount } = properties;
        super.addPropertiesToEvent(event, player, context, properties);
        event.amount = amount;
    }
}
