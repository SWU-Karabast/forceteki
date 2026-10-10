import type { IGameSystemInput } from '../core/gameSystem/GameSystem';
import type { AbilityContext } from '../core/ability/AbilityContext';
import type { Card } from '../core/card/Card';
import { GameStateChangeRequired, WildcardCardType, EventName, EffectName, EntryType } from '../core/Constants';
import { type ICardTargetSystemProperties, CardTargetSystem } from '../core/gameSystem/CardTargetSystem';
import type { GameSystem } from '../core/gameSystem/GameSystem';
import { PutIntoPlaySystem } from './PutIntoPlaySystem';

export interface IRescueProperties extends ICardTargetSystemProperties {

    /** Effect(s) resolved as the rescued unit enters play. See {@link IPutIntoPlayProperties.enterPlayEffect}. */
    enterPlayEffect?: GameSystem | GameSystem[];
}

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
    protected override eventHandlerInternal(): void {}

    protected override canAffectInternal(card: Card, context: TContext, properties: TProperties): boolean {
        if (!card.isUnit() || !card.isCaptured()) {
            return false;
        }

        return super.canAffectInternal(card, context, properties, GameStateChangeRequired.None);
    }

    protected override updateEvent(event, card: Card, context: TContext, properties: TProperties, additionalProperties: Partial<IGameSystemInput<TProperties>> = {}): void {
        super.updateEvent(event, card, context, properties, additionalProperties);

        const { enterPlayEffect } = properties;

        // add contingent event for putting the rescued unit back into play
        event.setContingentEventsGenerator((event) => [
            new PutIntoPlaySystem({
                target: card,
                controller: card.owner,
                entersReady: card.owner.hasOngoingEffect(EffectName.RescuedUnitsEnterPlayReady),
                entryType: EntryType.Rescued,
                enterPlayEffect,
            }).generateEvent(event.context)
        ]);
    }
}
