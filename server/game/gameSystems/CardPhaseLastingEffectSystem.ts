import type { IGameSystemInput } from '../core/gameSystem/GameSystem';
import type { AbilityContext } from '../core/ability/AbilityContext';
import { GameSystem } from '../core/gameSystem/GameSystem';
import type { ICardLastingEffectProperties } from './CardLastingEffectSystem';
import { CardLastingEffectSystem } from './CardLastingEffectSystem';
import { Duration, EventName } from '../core/Constants';

export type ICardPhaseLastingEffectProperties = Omit<ICardLastingEffectProperties, 'duration'>;

/**
 * Helper subclass of {@link CardLastingEffectSystem} that specifically creates lasting effects targeting cards
 * for the rest of the current phase.
 */
export class CardPhaseLastingEffectSystem<TContext extends AbilityContext = AbilityContext> extends CardLastingEffectSystem<TContext> {
    public override readonly name = 'applyCardPhaseLastingEffect';
    public override readonly eventName = EventName.OnEffectApplied;
    protected override readonly defaultProperties: IGameSystemInput<ICardLastingEffectProperties> = {
        duration: null,
        effect: [],
    };

    // constructor needs to do some extra work to ensure that the passed props object ends up as valid for the parent class
    public constructor(propertiesOrPropertyFactory: IGameSystemInput<ICardPhaseLastingEffectProperties> | ((context?: AbilityContext) => IGameSystemInput<ICardPhaseLastingEffectProperties>)) {
        const propertyWithDurationType = GameSystem.appendToPropertiesOrPropertyFactory<IGameSystemInput<ICardLastingEffectProperties>, 'duration'>(propertiesOrPropertyFactory, { duration: Duration.UntilEndOfPhase });
        super(propertyWithDurationType);
    }
}
