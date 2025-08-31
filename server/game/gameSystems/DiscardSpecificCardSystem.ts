import type { AbilityContext } from '../core/ability/AbilityContext';
import type { Card } from '../core/card/Card';
import { EventName, Stage, ZoneName } from '../core/Constants';
import type { ICardTargetSystemProperties } from '../core/gameSystem/CardTargetSystem';
import { CardTargetSystem } from '../core/gameSystem/CardTargetSystem';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IDiscardSpecificCardProperties extends ICardTargetSystemProperties {}

export class DiscardSpecificCardSystem<TContext extends AbilityContext = AbilityContext> extends CardTargetSystem<TContext, IDiscardSpecificCardProperties> {
    public override readonly name = 'discardSpecificCard';
    public override readonly eventName = EventName.OnCardDiscarded;

    public eventHandler(event): void {
        event.card.moveTo(ZoneName.Discard);

        if (event.context.stage !== Stage.Cost) {
            event.context.game.addMessage('{0} discards {1}', event.card.owner, this.getTargetMessage(event.card, event.context));
        }
    }

    public override canAffectInternal(card: Card, context: TContext, additionalProperties: Record<string, any> = {}): boolean {
        return card.zoneName !== ZoneName.Discard && super.canAffectInternal(card, context, additionalProperties);
    }

    public override getEffectMessage(context: TContext): [string, any[]] {
        const properties = this.generatePropertiesFromContext(context);
        return [
            'discard {0}',
            [this.getTargetMessage(properties.target, context)]
        ];
    }

    public override getCostMessage(context: TContext): [string, any[]] {
        const properties = this.generatePropertiesFromContext(context);
        return [
            'discarding {0}',
            [this.getTargetMessage(properties.target, context)]
        ];
    }

    protected override addPropertiesToEvent(event, card: Card, context: TContext, additionalProperties: Record<string, any> = {}): void {
        event.discardedFromZone = card.zoneName;
        super.addPropertiesToEvent(event, card, context, additionalProperties);
    }
}
