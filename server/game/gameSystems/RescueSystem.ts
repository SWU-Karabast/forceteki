import type { AbilityContext } from '../core/ability/AbilityContext';
import type { Card } from '../core/card/Card';
import { GameStateChangeRequired, WildcardCardType, EventName } from '../core/Constants';
import { type ICardTargetSystemProperties, CardTargetSystem } from '../core/gameSystem/CardTargetSystem';
import { PutIntoPlaySystem } from './PutIntoPlaySystem';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IRescueProperties extends ICardTargetSystemProperties {}

/**
 * Used for rescuing a captured unit. Generates a contingent event that puts it back into play.
 */
export class RescueSystem<TContext extends AbilityContext = AbilityContext, TProperties extends IRescueProperties = IRescueProperties> extends CardTargetSystem<TContext, TProperties> {
    public override readonly name = 'rescue';
    public override readonly eventName = EventName.OnRescue;
    public override readonly effectDescription = 'rescue {0}';
    protected override readonly targetTypeFilter = [WildcardCardType.NonLeaderUnit];

    // Nothing to do in the event handler, the PutIntoPlaySystem event does the work
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    public eventHandler(event): void {}

    public override canAffectInternal(card: Card, context: TContext, _additionalProperties: Partial<TProperties> = {}, mustChangeGameState = GameStateChangeRequired.None): boolean {
        if (!card.isUnit() || !card.isCaptured()) {
            return false;
        }

        return super.canAffectInternal(card, context);
    }

    protected override updateEvent(event, card: Card, context: TContext, additionalProperties): void {
        super.updateEvent(event, card, context, additionalProperties);

        // add contingent event for putting the rescued unit back into play
        event.setContingentEventsGenerator((event) => [new PutIntoPlaySystem({ target: card, controller: card.owner }).generateEvent(event.context)]);
    }
}
