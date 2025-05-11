import type { AbilityContext } from '../core/ability/AbilityContext';
import type { Card } from '../core/card/Card';
import { GameStateChangeRequired, WildcardCardType, EventName } from '../core/Constants';
import { type ICardTargetSystemProperties, CardTargetSystem } from '../core/gameSystem/CardTargetSystem';
import type { Player } from '../core/Player';

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

    public override canAffectInternal(card: Card, context: TContext, _additionalProperties: Partial<ITakeControlOfUnitProperties> = {}, mustChangeGameState = GameStateChangeRequired.None): boolean {
        if (!card.canBeInPlay() || !card.isInPlay()) {
            return false;
        }

        const { newController } = this.generatePropertiesFromContext(context);
        if (mustChangeGameState !== GameStateChangeRequired.None && newController === card.controller) {
            return false;
        }

        return super.canAffectInternal(card, context);
    }

    public override getEffectMessage(context: TContext): [string, any[]] {
        const { newController, target } = this.generatePropertiesFromContext(context);
        if (newController === context.player) {
            return ['take control of {0}', [target]];
        }
        return ['give control of {0} to {1}', [target, newController]];
    }

    public override addPropertiesToEvent(event: any, card: Card, context: TContext, additionalProperties?: Partial<ITakeControlOfUnitProperties>): void {
        super.addPropertiesToEvent(event, card, context, additionalProperties);
        event.newController = this.generatePropertiesFromContext(context).newController;
    }
}
