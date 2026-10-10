import type { IGameSystemInput } from '../core/gameSystem/GameSystem';
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
    protected override readonly defaultProperties: IGameSystemInput<IReadySystemProperties> = {
        isRegroupPhaseReadyStep: false
    };

    protected override eventHandlerInternal(event): void {
        event.card.ready();
    }

    protected override canAffectInternal(card: Card, context: TContext, properties: IReadySystemProperties, mustChangeGameState = GameStateChangeRequired.None): boolean {
        if (!super.canAffectInternal(card, context, properties, GameStateChangeRequired.None)) {
            return false;
        }

        const { isCost } = properties;

        // can safely cast here b/c the type was checked in super.canAffectInternal
        if ((isCost || mustChangeGameState !== GameStateChangeRequired.None) && !(card as ICardWithExhaustProperty).exhausted) {
            return false;
        }

        if (card.hasRestriction(AbilityRestriction.Ready)) {
            return false;
        }

        return true;
    }
}
