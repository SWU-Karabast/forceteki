import { AbilityContext } from '../core/ability/AbilityContext';
import { EventName } from '../core/Constants';
import { IPlayerTargetSystemProperties, PlayerTargetSystem } from '../core/gameSystem/PlayerTargetSystem';
import Player from '../core/Player';

export interface IPayResourceCostProperties extends IPlayerTargetSystemProperties {
    amount: number;
}

export class PayResourceCostSystem extends PlayerTargetSystem<IPayResourceCostProperties> {
    public override readonly name = 'payResourceCost';
    public override readonly eventName = EventName.OnSpendResources;

    public override eventHandler(event): void {
        event.player.exhaustResources(event.amount);
    }

    public override getEffectMessage(context: AbilityContext): [string, any[]] {
        const properties = this.generatePropertiesFromContext(context);

        if (properties.amount === 1) {
            return ['make {0} pay 1 resource', []];
        }

        return ['make {0} pay {1} resources', [properties.target, properties.amount]];
    }

    public override getCostMessage(context: AbilityContext): [string, any[]] {
        const properties = this.generatePropertiesFromContext(context);

        if (properties.amount === 1) {
            return ['spending 1 resource', []];
        }

        return ['spending {1} resources', [properties.amount]];
    }

    public override canAffect(player: Player, context: AbilityContext, additionalProperties = {}): boolean {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);
        return properties.amount > 0 && player.countSpendableResources() > 0 && super.canAffect(player, context, additionalProperties);
    }

    protected override addPropertiesToEvent(event, player: Player, context: AbilityContext, additionalProperties): void {
        const { amount } = this.generatePropertiesFromContext(context, additionalProperties);
        super.addPropertiesToEvent(event, player, context, additionalProperties);
        event.amount = amount;
    }
}
