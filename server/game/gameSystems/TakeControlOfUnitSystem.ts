import type { AbilityContext } from '../core/ability/AbilityContext';
import type { Card } from '../core/card/Card';
import { GameStateChangeRequired, WildcardCardType, EventName } from '../core/Constants';
import { type ICardTargetSystemProperties, CardTargetSystem } from '../core/gameSystem/CardTargetSystem';
import type Player from '../core/Player';

export interface ITakeControlOfUnitProperties extends ICardTargetSystemProperties {
    newController: Player;
}

/**
 * Used for taking control of a unit in the arena
 */
export class TakeControlOfUnitSystem<TContext extends AbilityContext = AbilityContext> extends CardTargetSystem<TContext, ITakeControlOfUnitProperties> {
    public override readonly name = 'takeControl';
    public override readonly eventName = EventName.OnTakeControl;
    protected override readonly targetTypeFilter = [WildcardCardType.NonLeaderUnit];

    public eventHandler(event): void {
        event.card.takeControl(event.newController);
    }

    public override canAffect(card: Card, context: TContext, _additionalProperties: any = {}, mustChangeGameState = GameStateChangeRequired.None): boolean {
        if (!card.canBeInPlay() || !card.isInPlay()) {
            return false;
        }

        const { newController } = this.generatePropertiesFromContext(context);
        if (mustChangeGameState !== GameStateChangeRequired.None && newController === card.controller) {
            return false;
        }

        return super.canAffect(card, context);
    }

    public override getEffectMessage(context: TContext): [string, any[]] {
        const { newController, target } = this.generatePropertiesFromContext(context);
        return ['{0} takes control of {1}', [newController, target]];
    }

    public override addPropertiesToEvent(event: any, card: Card, context: TContext, additionalProperties?: any): void {
        super.addPropertiesToEvent(event, card, context, additionalProperties);
        event.newController = this.generatePropertiesFromContext(context).newController;
    }
}
