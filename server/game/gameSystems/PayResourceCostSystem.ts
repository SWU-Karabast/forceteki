import { AbilityContext } from '../core/ability/AbilityContext';
import { EventName } from '../core/Constants';
import { IPlayerTargetSystemProperties, PlayerTargetSystem } from '../core/gameSystem/PlayerTargetSystem';
import Player from '../core/Player';

export interface IPayResourceCostProperties extends IPlayerTargetSystemProperties {
    amount: number;
}

export class PayResourceCostSystem<TContext extends AbilityContext = AbilityContext> extends PlayerTargetSystem<TContext, IPayResourceCostProperties> {
    public override readonly name = 'payResourceCost';
    public override readonly eventName = EventName.onExhaustResources;

    public override eventHandler(event): void {
        event.player.exhaustResources(event.amount);
    }

    public override getEffectMessage(context: TContext): [string, any[]] {
        const properties = this.generatePropertiesFromContext(context);

        if (properties.amount === 1) {
            return ['make {0} pay 1 resource', []];
        }

        return ['make {0} pay {1} resources', [properties.target, properties.amount]];
    }

    public override getCostMessage(context: TContext): [string, any[]] {
        const properties = this.generatePropertiesFromContext(context);

        if (properties.amount === 1) {
            return ['spending 1 resource', []];
        }

        return ['spending {1} resources', [properties.amount]];
    }

    public override canAffect(player: Player, context: TContext, additionalProperties = {}): boolean {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);
        return properties.amount > 0 && player.countSpendableResources() > 0 && super.canAffect(player, context, additionalProperties) && player.countSpendableResources() >= properties.amount;
    }

    protected override addPropertiesToEvent(event, player: Player, context: TContext, additionalProperties): void {
        const { amount } = this.generatePropertiesFromContext(context, additionalProperties);
        super.addPropertiesToEvent(event, player, context, additionalProperties);
        event.amount = amount;
    }
}
