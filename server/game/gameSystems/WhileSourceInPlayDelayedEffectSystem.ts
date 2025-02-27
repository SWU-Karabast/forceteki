import type { AbilityContext } from '../core/ability/AbilityContext';
import type { Card } from '../core/card/Card';
import { Duration } from '../core/Constants';
import { GameSystem } from '../core/gameSystem/GameSystem';
import * as Contract from '../core/utils/Contract';
import type { IDelayedEffectProperties } from './DelayedEffectSystem';
import { DelayedEffectSystem } from './DelayedEffectSystem';

export type IWhenSourceLeavesPlayDelayedEffectProperties = Omit<IDelayedEffectProperties, 'duration' | 'when' | 'target'>;

/**
 * Subclass of the {@link DelayedEffectSystem} specifically for creating delayed effects that happen when the source leaves play
 */
export class WhenSourceLeavesPlayDelayedEffectSystem<TContext extends AbilityContext = AbilityContext> extends DelayedEffectSystem<TContext> {
    // constructor needs to do some extra work to ensure that the passed props object ends up as valid for the parent class
    public constructor(propertiesOrPropertyFactory: IWhenSourceLeavesPlayDelayedEffectProperties | ((context?: AbilityContext) => IWhenSourceLeavesPlayDelayedEffectProperties)) {
        const propsWithWhen = GameSystem.appendToPropertiesOrPropertyFactory<IDelayedEffectProperties, 'when' | 'duration'>(
            propertiesOrPropertyFactory,
            {
                when: { onCardLeavesPlay: (event, context) => event.card === context.source },
                duration: Duration.WhileSourceInPlay
            }
        );
        super(propsWithWhen);
    }

    public override eventHandler(event: any, additionalProperties: any): void {
        const delayedEffectSource = event.sourceCard as Card;

        const effectProperties = event.effectProperties;

        Contract.assertTrue(effectProperties.duration === Duration.WhileSourceInPlay);
        Contract.assertTrue(delayedEffectSource.canBeInPlay());

        // if the source card has already left play, trigger the effects immediately
        if (!delayedEffectSource.isInPlay()) {
            event.context.game.addSubwindowEvents(
                event.immediateEffect.generateEvent(event.context, additionalProperties)
            );
            return;
        }

        delayedEffectSource.whileSourceInPlay(() => effectProperties);
    }

    protected override checkDuration(duration: Duration) {
        Contract.assertTrue(duration === Duration.WhileSourceInPlay || duration == null, `Expected duration to be WhileSourceInPlay or null, instead found ${duration}`);
    }

    protected override getDelayedEffectSource(context: TContext, additionalProperties?: any) {
        Contract.assertTrue(context.source.canBeInPlay());

        return context.source;
    }
}