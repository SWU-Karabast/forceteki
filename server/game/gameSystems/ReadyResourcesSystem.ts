import { AbilityContext } from '../core/ability/AbilityContext';
import type { Card } from '../core/card/Card';
import { CardType, Location, WildcardCardType } from '../core/Constants';
import Player from '../core/Player.js';
import * as EnumHelpers from '../core/utils/EnumHelpers';
import { IPlayerTargetSystemProperties, PlayerTargetSystem } from '../core/gameSystem/PlayerTargetSystem.js';


export interface IReadyResourcesSystemProperties extends IPlayerTargetSystemProperties {
    amount?: number
}

export class ReadyResourcesSystem<TContext extends AbilityContext = AbilityContext, TProperties extends IReadyResourcesSystemProperties = IReadyResourcesSystemProperties> extends PlayerTargetSystem<TContext, TProperties> {
    protected override defaultProperties: IReadyResourcesSystemProperties = {
        amount: 1
    };

    public override eventHandler(event): void {
        event.player.readyResources(event.amount);
    }

    public override getEffectMessage(context: TContext): [string, any[]] {
        const properties = this.generatePropertiesFromContext(context);
        const message = 'ready {0} resources';
        return [message, [properties.amount]];
    }

    public override canAffect(player: Player, context: TContext, additionalProperties = {}): boolean {
        return player.countExhaustedResources() > 0;
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
