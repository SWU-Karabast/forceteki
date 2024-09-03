import { AbilityContext } from '../core/ability/AbilityContext';
import type { Card } from '../core/card/Card';
import { CardType, CardTypeFilter, EventName, Location, WildcardCardType } from '../core/Constants';
import * as EnumHelpers from '../core/utils/EnumHelpers';
import { type ICardTargetSystemProperties, CardTargetSystem } from '../core/gameSystem/CardTargetSystem';
import { PlayableOrDeployableCard } from '../core/card/baseClasses/PlayableOrDeployableCard';
import * as CardHelpers from '../core/card/CardHelpers';
import CardSelector from '../core/cardSelector/CardSelector';
import { CardWithExhaustProperty } from '../core/card/CardTypes';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IExhaustSystemProperties extends ICardTargetSystemProperties {}

export class ExhaustSystem extends CardTargetSystem<IExhaustSystemProperties> {
    public override readonly name = 'exhaust';
    public override readonly eventName = EventName.OnCardExhausted;
    public override readonly costDescription = 'exhausting {0}';
    public override readonly effectDescription = 'exhaust {0}';
    protected override readonly targetTypeFilter: CardTypeFilter[];

    public constructor(propertiesOrPropertyFactory: IExhaustSystemProperties | ((context?: AbilityContext) => IExhaustSystemProperties)) {
        super(propertiesOrPropertyFactory);

        // undeployed leaders are commonly exhausted as a cost but typically not as an ability target
        if (typeof propertiesOrPropertyFactory !== 'function') {
            if (propertiesOrPropertyFactory.isCost) {
                this.targetTypeFilter = [WildcardCardType.Unit, CardType.Leader, CardType.Event];
            } else {
                this.targetTypeFilter = [WildcardCardType.Unit, CardType.Event];
            }
        }
    }

    public eventHandler(event): void {
        event.card.exhaust();
    }

    public override canAffect(card: Card, context: AbilityContext): boolean {
        const properties = this.generatePropertiesFromContext(context);
        if (
            !EnumHelpers.isArena(card.location) &&
            card.location !== Location.Resource &&
            !(card.isLeader() && card.location === Location.Base)
        ) {
            return false;
        }

        if (!card.canBeExhausted()) {
            return false;
        }

        // if exhausting is a cost, then the card must not be already exhausted
        // otherwise exhausting is a legal effect, even if the target is already exhausted
        if (properties.isCost && (card as CardWithExhaustProperty).exhausted) {
            return false;
        }

        return super.canAffect(card, context);
    }
}
