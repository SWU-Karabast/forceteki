import { AbilityContext } from '../core/ability/AbilityContext';
import { Card } from '../core/card/Card';
import { EventName, Location } from '../core/Constants';
import { IPlayerTargetSystemProperties, PlayerTargetSystem } from '../core/gameSystem/PlayerTargetSystem';
import Player from '../core/Player';

export interface IDrawProperties extends IPlayerTargetSystemProperties {
    amount?: number
}

export class DrawSystem extends PlayerTargetSystem<IDrawProperties> {
    public override readonly name = 'draw';
    public override readonly eventName = EventName.OnCardsDrawn;

    protected override defaultProperties: IDrawProperties = {
        amount: 1
    };

    public eventHandler(event): void {
        event.player.drawCardsToHand(event.amount);
    }

    public override getEffectMessage(context: AbilityContext): [string, any[]] {
        const properties = this.generatePropertiesFromContext(context);
        return ['draw ' + properties.amount + (properties.amount > 1 ? ' cards' : ' card'), []];
    }

    public override canAffect(player: Player, context: AbilityContext, additionalProperties = {}): boolean {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);
        return properties.amount !== 0 && super.canAffect(player, context);
    }

    public override defaultTargets(context: AbilityContext): Player[] {
        return [context.player];
    }

    public override addPropertiesToEvent(event, player: Player, context: AbilityContext, additionalProperties): void {
        const { amount } = this.generatePropertiesFromContext(context, additionalProperties);
        super.addPropertiesToEvent(event, player, context, additionalProperties);
        event.amount = amount;
    }
}