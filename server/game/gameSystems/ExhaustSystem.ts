import { AbilityContext } from '../core/ability/AbilityContext';
import type { Card } from '../core/card/Card';
import { AbilityRestriction, CardType, CardTypeFilter, EventName, GameStateChangeRequired, WildcardCardType } from '../core/Constants';
import { CardWithExhaustProperty } from '../core/card/CardTypes';
import { ExhaustOrReadySystem, IExhaustOrReadyProperties } from './ExhaustOrReadySystem';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IExhaustSystemProperties extends IExhaustOrReadyProperties {}

export class ExhaustSystem<TContext extends AbilityContext = AbilityContext> extends ExhaustOrReadySystem<TContext, IExhaustSystemProperties> {
    public override readonly name = 'exhaust';
    public override readonly eventName = EventName.OnCardExhausted;
    public override readonly costDescription = 'exhausting {0}';
    public override readonly effectDescription = 'exhaust {0}';
    protected override readonly targetTypeFilter: CardTypeFilter[];

    public eventHandler(event): void {
        event.card.exhaust();
    }

    public override canAffect(card: Card, context: TContext, additionalProperties: any = {}, mustChangeGameState = GameStateChangeRequired.None): boolean {
        if (!super.canAffect(card, context, additionalProperties, mustChangeGameState)) {
            return false;
        }

        const { isCost } = this.generatePropertiesFromContext(context);

        // can safely cast here b/c the type was checked in super.canAffect
        if ((isCost || mustChangeGameState !== GameStateChangeRequired.None) && (card as CardWithExhaustProperty).exhausted) {
            return false;
        }

        if (card.hasRestriction(AbilityRestriction.Exhaust)) {
            return false;
        }

        return true;
    }
}
