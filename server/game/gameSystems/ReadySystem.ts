import { AbilityContext } from '../core/ability/AbilityContext';
import type { Card } from '../core/card/Card';
import { AbilityRestriction, CardType, EventName, WildcardCardType } from '../core/Constants';
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

    public override canAffect(card: Card, context: TContext): boolean {
        if (!super.canAffect(card, context)) {
            return false;
        }

        const { isCost } = this.generatePropertiesFromContext(context);

        // if readying is a cost, then the card must not be currently readied
        // otherwise readying is a legal effect, even if the target is currently readied
        if (isCost && !(card as CardWithExhaustProperty).exhausted) {
            return false;
        }

        if (card.hasRestriction(AbilityRestriction.Ready)) {
            return false;
        }

        return true;
    }
}
