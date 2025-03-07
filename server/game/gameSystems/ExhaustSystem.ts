import type { AbilityContext } from '../core/ability/AbilityContext';
import type { ICardWithExhaustProperty } from '../core/card/baseClasses/PlayableOrDeployableCard';
import type { Card } from '../core/card/Card';
import { AbilityRestriction, EventName, GameStateChangeRequired } from '../core/Constants';
import type { IExhaustOrReadyProperties } from './ExhaustOrReadySystem';
import { ExhaustOrReadySystem } from './ExhaustOrReadySystem';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IExhaustSystemProperties extends IExhaustOrReadyProperties {}

export class ExhaustSystem<TContext extends AbilityContext = AbilityContext> extends ExhaustOrReadySystem<TContext, IExhaustSystemProperties> {
    public override readonly name = 'exhaust';
    public override readonly eventName = EventName.OnCardExhausted;
    public override readonly costDescription = 'exhausting {0}';
    public override readonly effectDescription = 'exhaust {0}';

    public eventHandler(event): void {
        event.card.exhaust();
    }

    public override canAffect(card: Card, context: TContext, additionalProperties: any = {}, mustChangeGameState = GameStateChangeRequired.None): boolean {
        if (!super.canAffect(card, context, additionalProperties, mustChangeGameState)) {
            return false;
        }

        const { isCost } = this.generatePropertiesFromContext(context);

        // can safely cast here b/c the type was checked in super.canAffect
        if ((isCost || mustChangeGameState !== GameStateChangeRequired.None) && (card as ICardWithExhaustProperty).exhausted) {
            return false;
        }

        if (card.hasRestriction(AbilityRestriction.Exhaust)) {
            return false;
        }

        return true;
    }
}
