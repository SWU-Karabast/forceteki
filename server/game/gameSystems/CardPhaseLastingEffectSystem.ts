import { AbilityContext } from '../core/ability/AbilityContext';
import { Card } from '../core/card/Card';
import { Duration, EffectName, EventName, ZoneName, WildcardZoneName } from '../core/Constants';
import { GameSystem } from '../core/gameSystem/GameSystem';
import { CardLastingEffectSystem, ICardLastingEffectProperties } from './CardLastingEffectSystem';

export type ICardPhaseLastingEffectProperties = Omit<ICardLastingEffectProperties, 'duration'>;

/**
 * Helper subclass of {@link CardLastingEffectSystem} that specifically creates lasting effects targeting cards
 * for the rest of the current phase.
 */
export class CardPhaseLastingEffectSystem<TContext extends AbilityContext = AbilityContext> extends CardLastingEffectSystem<TContext> {
    public override readonly name = 'applyCardPhaseLastingEffect';
    public override readonly eventName = EventName.OnEffectApplied;
    public override readonly effectDescription = 'apply an effect to {0} for the phase';
    protected override readonly defaultProperties: ICardLastingEffectProperties = {
        duration: null,
        effect: [],
        ability: null
    };

    // constructor needs to do some extra work to ensure that the passed props object ends up as valid for the parent class
    public constructor(propertiesOrPropertyFactory: ICardPhaseLastingEffectProperties | ((context?: AbilityContext) => ICardPhaseLastingEffectProperties)) {
        const propertyWithDurationType = GameSystem.appendToPropertiesOrPropertyFactory<ICardLastingEffectProperties, 'duration'>(propertiesOrPropertyFactory, { duration: Duration.UntilEndOfPhase });
        super(propertyWithDurationType);
    }
}
