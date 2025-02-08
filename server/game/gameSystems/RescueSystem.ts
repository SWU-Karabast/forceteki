import type { AbilityContext } from '../core/ability/AbilityContext';
import type { Card } from '../core/card/Card';
import { GameStateChangeRequired, WildcardCardType, EventName, RelativePlayer } from '../core/Constants';
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
    protected override readonly targetTypeFilter = [WildcardCardType.NonLeaderUnit];

    // Nothing to do in the event handler, the PutIntoPlaySystem event does the work
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    public eventHandler(event): void {}

    public override canAffect(card: Card, context: TContext, _additionalProperties: any = {}, mustChangeGameState = GameStateChangeRequired.None): boolean {
        if (!card.isUnit() || !card.isCaptured()) {
            return false;
        }

        return super.canAffect(card, context);
    }

    public override getEffectMessage(context: TContext): [string, any[]] {
        const { target } = this.generatePropertiesFromContext(context);
        return ['{0} is rescued', [target]];
    }

    protected override updateEvent(event, card: Card, context: TContext, additionalProperties): void {
        super.updateEvent(event, card, context, additionalProperties);

        // The card is being rescued, so it's controller should reset to the owner, but in relative terms to the player.  Null player is assumed to be self
        const newController = (event.player == null) ? RelativePlayer.Self : event.player === card.owner ? RelativePlayer.Self : RelativePlayer.Opponent;

        // add contingent event for putting the rescued unit back into play
        event.setContingentEventsGenerator((event) => [new PutIntoPlaySystem({ target: card, controller: newController }).generateEvent(event.context)]);
    }
}
