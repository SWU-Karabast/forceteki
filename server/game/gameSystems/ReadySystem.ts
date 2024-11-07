import { AbilityContext } from '../core/ability/AbilityContext';
import type { Card } from '../core/card/Card';
import { AbilityRestriction, CardType, EventName, GameStateChangeRequired, WildcardCardType } from '../core/Constants';
import { CardWithExhaustProperty } from '../core/card/CardTypes';
import { ExhaustOrReadySystem, IExhaustOrReadyProperties } from './ExhaustOrReadySystem';

export interface IReadySystemProperties extends IExhaustOrReadyProperties {
    isRegroupPhaseReadyStep?: boolean;
}

export class ReadySystem<TContext extends AbilityContext = AbilityContext> extends ExhaustOrReadySystem<TContext, IReadySystemProperties> {
    public override readonly name = 'ready';
    public override readonly eventName = EventName.OnCardReadied;
    public override readonly costDescription = 'readying {0}';
    public override readonly effectDescription = 'ready {0}';
    protected override readonly defaultProperties: IReadySystemProperties = {
        isRegroupPhaseReadyStep: false
    };

    public eventHandler(event): void {
        event.card.ready();
    }

    public override canAffect(card: Card, context: TContext, additionalProperties: any = {}, mustChangeGameState = GameStateChangeRequired.None): boolean {
        if (!super.canAffect(card, context)) {
            return false;
        }

        const { isCost } = this.generatePropertiesFromContext(context);

        // can safely cast here b/c the type was checked in super.canAffect
        if ((isCost || mustChangeGameState !== GameStateChangeRequired.None) && !(card as CardWithExhaustProperty).exhausted) {
            return false;
        }

        if (card.hasRestriction(AbilityRestriction.Ready)) {
            return false;
        }

        return true;
    }
}
