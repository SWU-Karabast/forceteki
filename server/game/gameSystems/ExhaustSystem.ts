import type { AbilityContext } from '../core/ability/AbilityContext';
import type { Card } from '../core/card/Card';
import { CardType, EventName } from '../core/Constants';
import { isArena } from '../core/utils/EnumHelpers';
import { type ICardTargetSystemProperties, CardTargetSystem } from '../core/gameSystem/CardTargetSystem';
import { PlayableOrDeployableCard } from '../core/card/baseClasses/PlayableOrDeployableCard';
import * as CardHelpers from '../core/card/CardHelpers';
import CardSelector from '../core/cardSelector/CardSelector';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IExhaustSystemProperties extends ICardTargetSystemProperties {}

export class ExhaustSystem extends CardTargetSystem<IExhaustSystemProperties> {
    public override readonly name = 'exhaust';
    public override readonly eventName = EventName.OnCardExhausted;
    public override readonly costDescription = 'exhausting {0}';
    public override readonly effectDescription = 'exhaust {0}';
    protected override readonly targetType = [CardType.Unit];

    public eventHandler(event): void {
        event.card.exhaust();
    }

    public override canAffect(card: Card, context: AbilityContext): boolean {
        const properties = this.generatePropertiesFromContext(context);
        if (!isArena(card.location)) {
            return false;
        }

        const concreteCard = CardHelpers.asCardWithExhaustPropertyOrNull(card);
        if (concreteCard === null) {
            return false;
        }

        // if exhausting is a cost, then the card must not be already exhausted
        // otherwise exhausting is a legal effect, even if the target is already exhausted
        if (properties.isCost && concreteCard.exhausted) {
            return false;
        }

        return super.canAffect(card, context);
    }
}
