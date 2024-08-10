import type { AbilityContext } from '../core/ability/AbilityContext';
import type Card from '../core/card/Card';
import { CardType, EventName } from '../core/Constants';
import { isArena } from '../core/utils/EnumHelpers';
import { type ICardTargetSystemProperties, CardTargetSystem } from '../core/gameSystem/CardTargetSystem';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IExhaustSystemProperties extends ICardTargetSystemProperties {}

export class ExhaustSystem extends CardTargetSystem<IExhaustSystemProperties> {
    override name = 'exhaust';
    override eventName = EventName.OnCardExhausted;
    override costDescription = 'exhausting {0}';
    override effectDescription = 'exhaust {0}';
    override targetType = [CardType.Unit];

    override canAffect(card: Card, context: AbilityContext): boolean {
        const properties = this.generatePropertiesFromContext(context);
        if (!isArena(card.location)) {
            return false;
        }

        // if exhausting is a cost, then the card must not be already exhausted
        // otherwise exhausting is a legal effect, even if the target is already exhausted
        if (properties.isCost && card.exhausted) {
            return false;
        }

        return super.canAffect(card, context);
    }

    eventHandler(event): void {
        event.card.exhaust();
    }
}
