import type { AbilityContext } from '../core/ability/AbilityContext';
import { EventName, GameStateChangeRequired } from '../core/Constants';
import type { Player } from '../core/Player.js';
import type { IPlayerTargetSystemProperties } from '../core/gameSystem/PlayerTargetSystem.js';
import { PlayerTargetSystem } from '../core/gameSystem/PlayerTargetSystem.js';
import * as ChatHelpers from '../core/chat/ChatHelpers.js';

export interface IReadyResourcesSystemProperties extends IPlayerTargetSystemProperties {
    amount: number;
}

export class ReadyResourcesSystem<TContext extends AbilityContext = AbilityContext, TProperties extends IReadyResourcesSystemProperties = IReadyResourcesSystemProperties> extends PlayerTargetSystem<TContext, TProperties> {
    public override readonly name = 'readyResources';
    public override readonly eventName = EventName.OnReadyResources;

    public override eventHandler(event): void {
        event.player.readyResources(event.amount);
    }

    public override getEffectMessage(context: TContext): [string, any[]] {
        const { amount } = this.generatePropertiesFromContext(context);
        return ['ready {0}', [ChatHelpers.pluralize(amount, 'a resource', 'resources')]];
    }

    public override canAffectInternal(player: Player, context: TContext, additionalProperties: Partial<TProperties> = {}, mustChangeGameState = GameStateChangeRequired.None): boolean {
        const { isCost, amount } = this.generatePropertiesFromContext(context);

        // if this is a cost or an "if you do" condition, must ready all required resources
        if ((isCost || mustChangeGameState === GameStateChangeRequired.MustFullyResolve) && player.exhaustedResourceCount < amount) {
            return false;
        }

        // if this is for the effect of an ability, just need to have some effect
        if (mustChangeGameState === GameStateChangeRequired.MustFullyOrPartiallyResolve && player.exhaustedResourceCount === 0) {
            return false;
        }

        return super.canAffectInternal(player, context, additionalProperties, mustChangeGameState);
    }

    public override defaultTargets(context: TContext): Player[] {
        return [context.player];
    }

    protected override addPropertiesToEvent(event, player: Player, context: TContext, additionalProperties: Partial<TProperties>): void {
        const { amount } = this.generatePropertiesFromContext(context, additionalProperties);
        super.addPropertiesToEvent(event, player, context, additionalProperties);
        event.amount = amount;
    }
}
