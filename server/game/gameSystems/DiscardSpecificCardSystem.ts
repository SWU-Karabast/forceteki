import type { AbilityContext } from '../core/ability/AbilityContext';
import { Card } from '../core/card/Card';
import { EventName, ZoneName } from '../core/Constants';
import { CardTargetSystem, ICardTargetSystemProperties } from '../core/gameSystem/CardTargetSystem';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IDiscardSpecificCardProperties extends ICardTargetSystemProperties {}

export class DiscardSpecificCardSystem<TContext extends AbilityContext = AbilityContext> extends CardTargetSystem<TContext, IDiscardSpecificCardProperties> {
    public override readonly name = 'discardSpecificCard';
    public override readonly eventName = EventName.OnCardDiscarded;

    public eventHandler(event): void {
        event.card.controller.moveCard(event.card, ZoneName.Discard);
    }

    public override canAffect(card: Card, context: TContext, additionalProperties: Record<string, any> = {}): boolean {
        return card.zoneName !== ZoneName.Discard && super.canAffect(card, context, additionalProperties);
    }

    public override getEffectMessage(context: TContext): [string, any[]] {
        const properties = this.generatePropertiesFromContext(context);
        return [
            'discard {0}',
            [properties.target]
        ];
    }

    protected override addPropertiesToEvent(event, card: Card, context: TContext, additionalProperties: Record<string, any> = {}): void {
        event.discardedFromZone = card.zoneName;
        super.addPropertiesToEvent(event, card, context, additionalProperties);
    }
}
