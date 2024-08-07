import type { AbilityContext } from '../core/ability/AbilityContext';
import type Card from '../core/card/Card';
import { CardType, EventName, Location } from '../core/Constants';
import { type ICardTargetSystemProperties, CardTargetSystem } from '../core/gameSystem/CardTargetSystem';
import { isArena } from '../core/utils/EnumHelpers';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IDefeatCardProperties extends ICardTargetSystemProperties {}

export class DefeatCardSystem extends CardTargetSystem<IDefeatCardProperties> {
    override name = 'defeat';
    override eventName = EventName.OnCardDefeated;
    override costDescription = 'defeating {0}';
    override targetType = [CardType.Unit, CardType.Upgrade];

    public constructor(propertyFactory) {
        super(propertyFactory);
    }

    override getEffectMessage(context: AbilityContext): [string, any[]] {
        const properties = this.generatePropertiesFromContext(context);
        return ['defeat {0}', [properties.target]];
    }

    override canAffect(card: Card, context: AbilityContext): boolean {
        if (!isArena(card.location)) {
            return false;
        }
        return super.canAffect(card, context);
    }

    override updateEvent(event, card: Card, context: AbilityContext, additionalProperties): void {
        this.updateLeavesPlayEvent(event, card, context, additionalProperties);
    }

    override eventHandler(event, additionalProperties = {}): void {
        this.leavesPlayEventHandler(event, additionalProperties);
    }
}
