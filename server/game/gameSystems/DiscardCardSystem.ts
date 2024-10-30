import type { AbilityContext } from '../core/ability/AbilityContext';
import { Card } from '../core/card/Card';
import { EventName, Location } from '../core/Constants';
import { GameEvent } from '../core/event/GameEvent';
import { CardTargetSystem, ICardTargetSystemProperties } from '../core/gameSystem/CardTargetSystem';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IDiscardProperties extends ICardTargetSystemProperties {}

export class DiscardCardSystem<TContext extends AbilityContext = AbilityContext> extends CardTargetSystem<TContext, IDiscardProperties> {
    public override readonly name = 'discardCard';
    public override readonly eventName = EventName.OnCardsDiscarded;

    public override canAffect(card: Card | Card[], context: TContext, additionalProperties: Record<string, any> = {}): boolean {
        /* TODO A bug currently leads to this sometimes being an array. Once the bug is fixed, we can expect this to
        accept only 1 card, so we should change this to match */
        const cards = Array.isArray(card) ? card : [card];

        return cards.every((c) => c.location !== Location.Discard && super.canAffect(c, context, additionalProperties));
    }

    public override getEffectMessage(context: TContext): [string, any[]] {
        const properties = this.generatePropertiesFromContext(context);
        return [
            'discard {0}',
            [properties.target]
        ];
    }

    public override queueGenerateEventGameSteps(events: GameEvent[], context: TContext, additionalProperties: Record<string, any> = {}): void {
        const { target } = this.generatePropertiesFromContext(context, additionalProperties);
        const unfilteredCards = Array.isArray(target) ? target : [target];
        const cards = unfilteredCards.filter((card) => this.canAffect(card, context));
        if (cards.length === 0) {
            return;
        }
        const event = this.createEvent(null, context, additionalProperties);
        this.updateEvent(event, target, context, additionalProperties);
        events.push(event);
    }

    public eventHandler(event): void {
        event.card.forEach((card) => {
            card.controller.moveCard(card, Location.Discard);
        });
    }
}
