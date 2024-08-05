import type { AbilityContext } from '../core/ability/AbilityContext';
import type Card from '../core/card/Card';
import { CardTypes, EventNames, isArena } from '../core/Constants';
import { type CardTargetSystemProperties, CardTargetSystem } from '../core/gameSystem/CardTargetSystem';

export interface ExhaustSystemProperties extends CardTargetSystemProperties {}

export class ExhaustSystem extends CardTargetSystem<ExhaustSystemProperties> {
    name = 'exhaust';
    eventName = EventNames.OnCardExhausted;
    cost = 'exhausting {0}';
    effect = 'exhaust {0}';
    targetType = [CardTypes.Unit];

    canAffect(card: Card, context: AbilityContext): boolean {
        if (!isArena(card.location) || card.exhausted) {
            return false;
        }
        return super.canAffect(card, context);
    }

    eventHandler(event): void {
        event.card.exhaust();
    }
}