import type { AbilityContext } from '../AbilityContext';
import { EventNames } from '../Constants';
import type Player from '../player';
import { PlayerAction, type PlayerActionProperties } from './PlayerAction';

export interface DrawProperties extends PlayerActionProperties {
    amount?: number;
}

export class DrawAction extends PlayerAction<DrawProperties> {
    name = 'draw';
    eventName = EventNames.OnCardsDrawn;

    defaultProperties: DrawProperties = {
        amount: 1
    };

    getEffectMessage(context: AbilityContext): [string, any[]] {
        let properties = this.getProperties(context);
        return ['draw ' + properties.amount + (properties.amount > 1 ? ' cards' : ' card'), []];
    }

    canAffect(player: Player, context: AbilityContext, additionalProperties = {}): boolean {
        let properties = this.getProperties(context, additionalProperties);
        return properties.amount !== 0 && super.canAffect(player, context);
    }

    defaultTargets(context: AbilityContext): Player[] {
        return [context.player];
    }

    addPropertiesToEvent(event, player: Player, context: AbilityContext, additionalProperties): void {
        let { amount } = this.getProperties(context, additionalProperties);
        super.addPropertiesToEvent(event, player, context, additionalProperties);
        event.amount = amount;
    }

    eventHandler(event): void {
        event.player.drawCardsToHand(event.amount);
    }
}