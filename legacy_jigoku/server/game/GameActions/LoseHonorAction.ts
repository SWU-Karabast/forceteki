import type { AbilityContext } from '../AbilityContext';
import { EventNames } from '../Constants';
import type Player from '../player';
import { PlayerAction, type PlayerActionProperties } from './PlayerAction';

export interface LoseHonorProperties extends PlayerActionProperties {
    amount?: number;
    dueToUnopposed?: boolean;
}

export class LoseHonorAction extends PlayerAction {
    defaultProperties: LoseHonorProperties = { amount: 1, dueToUnopposed: false };

    name = 'loseHonor';
    eventName = EventNames.OnModifyHonor;
    constructor(propertyFactory: LoseHonorProperties | ((context: AbilityContext) => LoseHonorProperties)) {
        super(propertyFactory);
    }

    getCostMessage(context: AbilityContext): [string, any[]] {
        let properties: LoseHonorProperties = this.getProperties(context);
        return ['losing {1} honor', [properties.amount]];
    }

    getEffectMessage(context: AbilityContext): [string, any[]] {
        let properties: LoseHonorProperties = this.getProperties(context);
        return ['make {0} lose ' + properties.amount + ' honor', [properties.target]];
    }

    canAffect(player: Player, context: AbilityContext, additionalProperties = {}): boolean {
        let properties: LoseHonorProperties = this.getProperties(context, additionalProperties);
        return properties.amount === 0 ? false : super.canAffect(player, context);
    }

    addPropertiesToEvent(event, player: Player, context: AbilityContext, additionalProperties): void {
        let { amount, dueToUnopposed } = this.getProperties(context, additionalProperties) as LoseHonorProperties;
        super.addPropertiesToEvent(event, player, context, additionalProperties);
        event.amount = -amount;
        event.dueToUnopposed = dueToUnopposed;
    }

    eventHandler(event): void {
        if (event.player) {
            event.player.modifyHonor(event.amount);
        }
    }
}
