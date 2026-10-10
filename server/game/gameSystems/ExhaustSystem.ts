import type { AbilityContext } from '../core/ability/AbilityContext';
import type { ICardWithExhaustProperty } from '../core/card/baseClasses/PlayableOrDeployableCard';
import type { Card } from '../core/card/Card';
import { AbilityRestriction, EventName, GameStateChangeRequired } from '../core/Constants';
import type { IExhaustSource } from '../IDamageOrDefeatSource';
import { ExhaustSourceType } from '../IDamageOrDefeatSource';
import type { IExhaustOrReadyProperties } from './ExhaustOrReadySystem';
import { ExhaustOrReadySystem } from './ExhaustOrReadySystem';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IExhaustSystemProperties extends IExhaustOrReadyProperties {}

export class ExhaustSystem<TContext extends AbilityContext = AbilityContext> extends ExhaustOrReadySystem<TContext, IExhaustSystemProperties> {
    public override readonly name = 'exhaust';
    public override readonly eventName = EventName.OnCardExhausted;
    public override readonly costDescription = 'exhausting {0}';
    public override readonly effectDescription = 'exhaust {0}';

    protected override eventHandlerInternal(event): void {
        event.card.exhaust();
    }

    protected override canAffectInternal(card: Card, context: TContext, properties: IExhaustSystemProperties, mustChangeGameState = GameStateChangeRequired.None): boolean {
        if (!super.canAffectInternal(card, context, properties, mustChangeGameState)) {
            return false;
        }

        const { isCost } = properties;

        // can safely cast here b/c the type was checked in super.canAffectInternal
        if ((isCost || mustChangeGameState !== GameStateChangeRequired.None) && (card as ICardWithExhaustProperty).exhausted) {
            return false;
        }

        if (card.hasRestriction(AbilityRestriction.Exhaust)) {
            return false;
        }

        return true;
    }

    protected override addPropertiesToEvent(event, card: Card, context: TContext, properties: IExhaustSystemProperties) {
        super.addPropertiesToEvent(event, card, context, properties);

        const exhaustSource: IExhaustSource = {
            type: properties.isCost ? ExhaustSourceType.Cost : ExhaustSourceType.Ability,
            player: context.player
        };

        event.exhaustSource = exhaustSource;
    }
}
