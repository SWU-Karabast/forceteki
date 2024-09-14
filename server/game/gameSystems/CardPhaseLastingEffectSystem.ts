import { AbilityContext } from '../core/ability/AbilityContext';
import { Card } from '../core/card/Card';
import { Duration, EffectName, EventName, Location, WildcardLocation } from '../core/Constants';
import { CardLastingEffectSystem, ICardLastingEffectProperties } from './CardLastingEffectSystem';

export type ICardPhaseLastingEffectProperties = Omit<ICardLastingEffectProperties, 'duration'>;

/**
 * Helper subclass of {@link CardLastingEffectSystem} that specifically creates lasting effects targeting cards
 * for the rest of the current phase.
 */
export class CardPhaseLastingEffectSystem extends CardLastingEffectSystem {
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
        let propertyWithDurationType: ICardLastingEffectProperties | ((context?: AbilityContext) => ICardLastingEffectProperties);

        if (typeof propertiesOrPropertyFactory === 'function') {
            propertyWithDurationType = (context?: AbilityContext) => Object.assign(propertiesOrPropertyFactory(context), { duration: Duration.UntilEndOfPhase });
        } else {
            propertyWithDurationType = Object.assign(propertiesOrPropertyFactory, { duration: Duration.UntilEndOfPhase });
        }

        super(propertyWithDurationType);
    }
}
