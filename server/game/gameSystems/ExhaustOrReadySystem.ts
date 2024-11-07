import { AbilityContext } from '../core/ability/AbilityContext';
import type { Card } from '../core/card/Card';
import { CardType, CardTypeFilter, EventName, GameStateChangeRequired, Location, WildcardCardType } from '../core/Constants';
import * as EnumHelpers from '../core/utils/EnumHelpers';
import { type ICardTargetSystemProperties, CardTargetSystem } from '../core/gameSystem/CardTargetSystem';
import { CardWithExhaustProperty } from '../core/card/CardTypes';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IExhaustOrReadyProperties extends ICardTargetSystemProperties {}

export abstract class ExhaustOrReadySystem<TContext extends AbilityContext = AbilityContext, TProperties extends IExhaustOrReadyProperties = IExhaustOrReadyProperties> extends CardTargetSystem<TContext, TProperties> {
    protected override readonly targetTypeFilter = [WildcardCardType.Unit, CardType.Event, WildcardCardType.Upgrade, CardType.Leader];

    public override canAffect(card: Card, context: TContext, additionalProperties: any = {}, mustChangeGameState = GameStateChangeRequired.None): boolean {
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
