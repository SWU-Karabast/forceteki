import type { AbilityContext } from '../AbilityContext';
import { EventNames } from '../Constants';
import type Player from '../player';
import { PlayerAction, type PlayerActionProperties } from './PlayerAction';

export interface GainFateProperties extends PlayerActionProperties {
    amount?: number;
}

export class GainFateAction extends PlayerAction<GainFateProperties> {
    defaultProperties: GainFateProperties = { amount: 1 };

    name = 'gainFate';
    eventName = EventNames.OnModifyFate;

    defaultTargets(context: AbilityContext): Player[] {
        return [context.player];
    }

    getEffectMessage(context: AbilityContext): [string, any[]] {
        let properties = this.getProperties(context);
        return ['gain {0} fate', [properties.amount]];
    }

    canAffect(player: Player, context: AbilityContext, additionalProperties = {}): boolean {
        let properties = this.getProperties(context, additionalProperties);
        return properties.amount > 0 && super.canAffect(player, context);
    }

    addPropertiesToEvent(event, player: Player, context: AbilityContext, additionalProperties): void {
        let { amount } = this.getProperties(context, additionalProperties);
        super.addPropertiesToEvent(event, player, context, additionalProperties);
        event.amount = amount;
    }

    eventHandler(event): void {
        event.player.modifyFate(event.amount);
    }
}