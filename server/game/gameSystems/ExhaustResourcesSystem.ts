import type { AbilityContext } from '../core/ability/AbilityContext';
import { EventName, GameStateChangeRequired } from '../core/Constants';
import type { IPlayerTargetSystemProperties } from '../core/gameSystem/PlayerTargetSystem';
import { PlayerTargetSystem } from '../core/gameSystem/PlayerTargetSystem';
import type { Player } from '../core/Player';
import * as Helpers from '../core/utils/Helpers';
import * as ChatHelpers from '../core/chat/ChatHelpers';

export interface IExhaustResourcesProperties extends IPlayerTargetSystemProperties {
    amount: number;
}

export class ExhaustResourcesSystem<TContext extends AbilityContext = AbilityContext> extends PlayerTargetSystem<TContext, IExhaustResourcesProperties> {
    public override readonly name = 'exhaustResources';
    public override readonly eventName = EventName.OnExhaustResources;

    public override eventHandler(event): void {
        event.player.exhaustResources(event.amount);
    }

    public override getEffectMessage(context: TContext): [string, any[]] {
        const properties = this.generatePropertiesFromContext(context);

        if (Helpers.asArray(properties.target).length === 1 && Helpers.asArray(properties.target)[0] === context.player) {
            return ['exhaust {0}', [ChatHelpers.pluralize(properties.amount, '1 resource', 'resources')]];
        }

        return ['make {0} exhaust {1}', [this.getTargetMessage(properties.target, context), ChatHelpers.pluralize(properties.amount, '1 resource', 'resources')]];
    }

    public override canAffectInternal(player: Player, context: TContext, additionalProperties: Partial<IExhaustResourcesProperties> = {}, mustChangeGameState = GameStateChangeRequired.None): boolean {
        const { isCost, amount } = this.generatePropertiesFromContext(context, additionalProperties);

        if (amount === 0) {
            return false;
        }

        if ((isCost || mustChangeGameState === GameStateChangeRequired.MustFullyResolve) && player.readyResourceCount < amount) {
            return false;
        }

        if (mustChangeGameState === GameStateChangeRequired.MustFullyOrPartiallyResolve && player.readyResourceCount === 0) {
            return false;
        }

        return super.canAffectInternal(player, context, additionalProperties, mustChangeGameState);
    }

    protected override addPropertiesToEvent(event, player: Player, context: TContext, additionalProperties: Partial<IExhaustResourcesProperties>): void {
        const { amount } = this.generatePropertiesFromContext(context, additionalProperties);
        super.addPropertiesToEvent(event, player, context, additionalProperties);
        event.amount = amount;
    }
}
