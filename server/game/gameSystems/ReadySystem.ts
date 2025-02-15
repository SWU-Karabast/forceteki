import type { AbilityContext } from '../core/ability/AbilityContext';
import type { ICardWithExhaustProperty } from '../core/card/baseClasses/PlayableOrDeployableCard';
import type { Card } from '../core/card/Card';
import { AbilityRestriction, EventName, GameStateChangeRequired } from '../core/Constants';
import type { IExhaustOrReadyProperties } from './ExhaustOrReadySystem';
import { ExhaustOrReadySystem } from './ExhaustOrReadySystem';

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
        if ((isCost || mustChangeGameState !== GameStateChangeRequired.None) && !(card as ICardWithExhaustProperty).exhausted) {
            return false;
        }

        if (card.hasRestriction(AbilityRestriction.Ready)) {
            return false;
        }

        return true;
    }
}
