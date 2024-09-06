import { AbilityContext } from '../core/ability/AbilityContext';
import type { Card } from '../core/card/Card';
import { CardType, CardTypeFilter, EventName, Location, WildcardCardType } from '../core/Constants';
import * as EnumHelpers from '../core/utils/EnumHelpers';
import { type ICardTargetSystemProperties, CardTargetSystem } from '../core/gameSystem/CardTargetSystem';
import { CardWithExhaustProperty } from '../core/card/CardTypes';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IExhaustOrReadyProperties extends ICardTargetSystemProperties {}

export abstract class ExhaustOrReadySystem<TProperties extends IExhaustOrReadyProperties = IExhaustOrReadyProperties> extends CardTargetSystem<TProperties> {
    protected override readonly targetTypeFilter = [WildcardCardType.Unit, CardType.Event, WildcardCardType.Upgrade, CardType.Leader];

    public override canAffect(card: Card, context: AbilityContext): boolean {
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

        return super.canAffect(card, context);
    }
}
