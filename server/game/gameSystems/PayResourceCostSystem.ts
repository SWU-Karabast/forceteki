import { AbilityContext } from '../core/ability/AbilityContext';
import { EventName, GameStateChangeRequired } from '../core/Constants';
import { IPlayerTargetSystemProperties, PlayerTargetSystem } from '../core/gameSystem/PlayerTargetSystem';
import Player from '../core/Player';

export interface IPayResourceCostProperties extends IPlayerTargetSystemProperties {
    amount: number;
}

// TODO: replace this with ExhaustResourcesSystem when we have it
export class PayResourceCostSystem<TContext extends AbilityContext = AbilityContext> extends PlayerTargetSystem<TContext, IPayResourceCostProperties> {
    public override readonly name = 'payResourceCost';
    public override readonly eventName = EventName.onExhaustResources;
    protected override defaultProperties: IPayResourceCostProperties = {
        amount: null,
        isCost: true
    };

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

    public override canAffect(player: Player, context: TContext, additionalProperties: any = {}, mustChangeGameState = GameStateChangeRequired.None): boolean {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);
        return properties.amount > 0 &&
          player.countSpendableResources() > 0 &&
          super.canAffect(player, context, additionalProperties, mustChangeGameState) &&
            player.countSpendableResources() >= properties.amount;
    }

    protected override addPropertiesToEvent(event, player: Player, context: TContext, additionalProperties): void {
        const { amount } = this.generatePropertiesFromContext(context, additionalProperties);
        super.addPropertiesToEvent(event, player, context, additionalProperties);
        event.amount = amount;
    }
}
