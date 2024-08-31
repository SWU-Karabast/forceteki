import type { AbilityContext } from '../core/ability/AbilityContext';
import type { Card } from '../core/card/Card';
import { AbilityRestriction, CardType, EventName, Location, WildcardCardType } from '../core/Constants';
import * as EnumHelpers from '../core/utils/EnumHelpers';
import { type ICardTargetSystemProperties, CardTargetSystem } from '../core/gameSystem/CardTargetSystem';
import { CardWithExhaustProperty } from '../core/card/CardTypes';
import { IGameSystemProperties } from '../core/gameSystem/GameSystem';

export interface IReadySystemProperties extends ICardTargetSystemProperties {
    isRegroupPhaseReadyStep?: boolean;
}

export class ReadySystem extends CardTargetSystem<IReadySystemProperties> {
    public override readonly name = 'ready';
    public override readonly eventName = EventName.OnCardExhausted;
    public override readonly costDescription = 'readying {0}';
    public override readonly effectDescription = 'ready {0}';
    protected override readonly targetTypeFilter = [WildcardCardType.Unit, CardType.Leader, CardType.Event];
    protected override readonly defaultProperties: IReadySystemProperties = {
        isRegroupPhaseReadyStep: false
    };

    public eventHandler(event): void {
        event.card.ready();
    }

    public override canAffect(card: Card, context: AbilityContext): boolean {
        const properties = this.generatePropertiesFromContext(context);
        if (!EnumHelpers.isArena(card.location) && card.location !== Location.Resource) {
            return false;
        }

        if (!card.canBeExhausted() || card.hasRestriction(AbilityRestriction.Ready)) {
            return false;
        }

        // if readying is a cost, then the card must not be already readied
        // otherwise readying is a legal effect, even if the target is already readied
        if (properties.isCost && !(card as CardWithExhaustProperty).exhausted) {
            return false;
        }

        return super.canAffect(card, context);
    }
}
