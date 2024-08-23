import type { AbilityContext } from '../core/ability/AbilityContext';
import type { Card } from '../core/card/Card';
import { CardType, EventName, Location, WildcardCardType } from '../core/Constants';
import { type ICardTargetSystemProperties, CardTargetSystem } from '../core/gameSystem/CardTargetSystem';
import * as EnumHelpers from '../core/utils/EnumHelpers';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IDefeatCardProperties extends ICardTargetSystemProperties {}

export class DefeatCardSystem extends CardTargetSystem<IDefeatCardProperties> {
    public override readonly name = 'defeat';
    public override readonly eventName = EventName.OnCardDefeated;
    public override readonly costDescription = 'defeating {0}';
    protected override readonly targetTypeFilter = [WildcardCardType.Unit, CardType.Upgrade];

    public constructor(propertyFactory) {
        super(propertyFactory);
    }

    public eventHandler(event, additionalProperties = {}): void {
        this.leavesPlayEventHandler(event, additionalProperties);
    }

    public override getEffectMessage(context: AbilityContext): [string, any[]] {
        const properties = this.generatePropertiesFromContext(context);
        return ['defeat {0}', [properties.target]];
    }

    public override canAffect(card: Card, context: AbilityContext): boolean {
        if (!EnumHelpers.isArena(card.location)) {
            return false;
        }
        return super.canAffect(card, context);
    }

    protected override updateEvent(event, card: Card, context: AbilityContext, additionalProperties): void {
        this.addLeavesPlayPropertiesToEvent(event, card, context, additionalProperties);
    }
}
