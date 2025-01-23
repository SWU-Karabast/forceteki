import type { AbilityContext } from '../core/ability/AbilityContext';
import { Duration, EventName } from '../core/Constants';
import { GameSystem } from '../core/gameSystem/GameSystem';
import type { IPlayerLastingEffectProperties } from './PlayerLastingEffectSystem';
import { PlayerLastingEffectSystem } from './PlayerLastingEffectSystem';

export type IPlayerPhaseLastingEffectProperties = Omit<IPlayerLastingEffectProperties, 'duration'>;

/**
 * Helper subclass of {@link PlayerLastingEffectSystem} that specifically creates lasting effects targeting players
 * for the rest of the current phase.
 */
export class PlayerPhaseLastingEffectSystem<TContext extends AbilityContext = AbilityContext> extends PlayerLastingEffectSystem<TContext> {
    public override readonly name = 'applyPlayerPhaseLastingEffect';
    public override readonly eventName = EventName.OnEffectApplied;
    public override readonly effectDescription = 'apply an effect to {0} for the phase';
    protected override readonly defaultProperties: IPlayerLastingEffectProperties = {
        targetPlayer: null,
        duration: null,
        effect: [],
        ability: null
    };

    // constructor needs to do some extra work to ensure that the passed props object ends up as valid for the parent class
    public constructor(propertiesOrPropertyFactory: IPlayerPhaseLastingEffectProperties | ((context?: AbilityContext) => IPlayerPhaseLastingEffectProperties)) {
        const propertyWithDurationType = GameSystem.appendToPropertiesOrPropertyFactory<IPlayerLastingEffectProperties, 'duration'>(propertiesOrPropertyFactory, { duration: Duration.UntilEndOfPhase });
        super(propertyWithDurationType);
    }
}
