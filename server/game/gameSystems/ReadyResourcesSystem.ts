import { AbilityContext } from '../core/ability/AbilityContext';
import { EventName, GameStateChangeRequired } from '../core/Constants';
import Player from '../core/Player.js';
import { IPlayerTargetSystemProperties, PlayerTargetSystem } from '../core/gameSystem/PlayerTargetSystem.js';


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
        return amount === 1 ? ['ready a resource', []] : ['ready {0} resources', [amount]];
    }

    public override canAffect(player: Player, context: TContext, additionalProperties: any = {}, mustChangeGameState = GameStateChangeRequired.None): boolean {
        const { isCost, amount } = this.generatePropertiesFromContext(context);

        // if this is a cost or an "if you do" condition, must ready all required resources
        if ((isCost || mustChangeGameState === GameStateChangeRequired.MustFullyResolve) && player.countExhaustedResources() < amount) {
            return false;
        }

        // if this is for the effect of an ability, just need to have some effect
        if (mustChangeGameState === GameStateChangeRequired.MustFullyOrPartiallyResolve && player.countExhaustedResources() === 0) {
            return false;
        }

        return super.canAffect(player, context, additionalProperties, mustChangeGameState);
    }

    public override defaultTargets(context: TContext): Player[] {
        return [context.player];
    }

    protected override addPropertiesToEvent(event, player: Player, context: TContext, additionalProperties): void {
        const { amount } = this.generatePropertiesFromContext(context, additionalProperties);
        super.addPropertiesToEvent(event, player, context, additionalProperties);
        event.amount = amount;
    }
}
