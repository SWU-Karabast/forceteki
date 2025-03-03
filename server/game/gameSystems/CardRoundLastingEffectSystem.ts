import type { AbilityContext } from '../core/ability/AbilityContext';
import { GameSystem } from '../core/gameSystem/GameSystem';
import type { ICardLastingEffectProperties } from './CardLastingEffectSystem';
import { CardLastingEffectSystem } from './CardLastingEffectSystem';
import { Duration, EventName } from '../core/Constants';

export type ICardRoundLastingEffectProperties = Omit<ICardLastingEffectProperties, 'duration'>;

/**
 * Helper subclass of {@link CardLastingEffectSystem} that specifically creates lasting effects targeting cards
 * for the rest of the current round.
 */
export class CardRoundLastingEffectSystem<TContext extends AbilityContext = AbilityContext> extends CardLastingEffectSystem<TContext> {
    public override readonly name = 'applyCardRoundLastingEffect';
    public override readonly eventName = EventName.OnEffectApplied;
    public override readonly effectDescription = 'apply an effect to {0} for the round';
    protected override readonly defaultProperties: ICardLastingEffectProperties = {
        duration: null,
        effect: [],
        ability: null
    };

    // constructor needs to do some extra work to ensure that the passed props object ends up as valid for the parent class
    public constructor(propertiesOrPropertyFactory: ICardRoundLastingEffectProperties | ((context?: AbilityContext) => ICardRoundLastingEffectProperties)) {
        const propertyWithDurationType = GameSystem.appendToPropertiesOrPropertyFactory<ICardLastingEffectProperties, 'duration'>(propertiesOrPropertyFactory, { duration: Duration.UntilEndOfRound });
        super(propertyWithDurationType);
    }
}