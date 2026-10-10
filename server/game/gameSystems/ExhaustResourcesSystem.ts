import type { AbilityContext } from '../core/ability/AbilityContext';
import { EventName, GameStateChangeRequired } from '../core/Constants';
import type { IPlayerTargetSystemProperties } from '../core/gameSystem/PlayerTargetSystem';
import { PlayerTargetSystem } from '../core/gameSystem/PlayerTargetSystem';
import type { Player } from '../core/Player';
import { Helpers } from '../core/utils/Helpers';
import { ChatHelpers } from '../core/chat/ChatHelpers';
import { TextHelper } from '../core/utils/TextHelper';

export interface IExhaustResourcesProperties extends IPlayerTargetSystemProperties {
    amount: number;
}

export class ExhaustResourcesSystem<TContext extends AbilityContext = AbilityContext> extends PlayerTargetSystem<TContext, IExhaustResourcesProperties> {
    public override readonly name = 'exhaustResources';
    public override readonly eventName = EventName.OnExhaustResources;

    protected override eventHandlerInternal(event): void {
        event.player.exhaustResources(event.amount);
    }

    protected override getEffectMessageInternal(context: TContext, properties: IExhaustResourcesProperties): [string, any[]] {
        const verb = properties.isCost ? 'pay' : 'exhaust';
        const resourceString = properties.isCost
            ? TextHelper.resource(properties.amount)
            : ChatHelpers.pluralize(properties.amount, '1 resource', 'resources');

        if (Helpers.asArray(properties.target).length === 1 && Helpers.asArray(properties.target)[0] === context.player) {
            return [`${verb} {0}`, [resourceString]];
        }

        return [`make {0} ${verb} {1}`, [this.getTargetMessage(properties.target, context), resourceString]];
    }

    protected override canAffectInternal(player: Player, context: TContext, properties: IExhaustResourcesProperties, mustChangeGameState = GameStateChangeRequired.None): boolean {
        const { isCost, amount } = properties;

        if (amount === 0) {
            return false;
        }

        if ((isCost || mustChangeGameState === GameStateChangeRequired.MustFullyResolve) && player.readyResourceCount < amount) {
            return false;
        }

        if (mustChangeGameState === GameStateChangeRequired.MustFullyOrPartiallyResolve && player.readyResourceCount === 0) {
            return false;
        }

        return super.canAffectInternal(player, context, properties, mustChangeGameState);
    }

    protected override addPropertiesToEvent(event, player: Player, context: TContext, properties: IExhaustResourcesProperties): void {
        const { amount } = properties;
        super.addPropertiesToEvent(event, player, context, properties);
        event.amount = amount;
    }
}
