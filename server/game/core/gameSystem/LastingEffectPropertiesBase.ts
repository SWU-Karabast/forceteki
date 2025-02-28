import type { WhenType } from '../../Interfaces';
import type { AbilityContext } from '../ability/AbilityContext';
import type PlayerOrCardAbility from '../ability/PlayerOrCardAbility';
import type { Duration } from '../Constants';
import { type IGameSystemProperties } from './GameSystem';

interface ILastingEffectPropertiesAnyDuration extends IGameSystemProperties {
    duration: Duration;
    ability?: PlayerOrCardAbility;
    condition?: (context: AbilityContext) => boolean;
    effect?: any;
}

interface ILastingEffectPropertiesSetDuration extends ILastingEffectPropertiesAnyDuration {
    duration:
      Duration.Persistent |
      Duration.UntilEndOfAttack |
      Duration.UntilEndOfPhase |
      Duration.UntilEndOfRound |
      Duration.WhileSourceInPlay;
}

interface ILastingEffectPropertiesCustomDuration extends ILastingEffectPropertiesAnyDuration {
    duration: Duration.Custom;
    until: WhenType;
}

export type ILastingEffectPropertiesBase = ILastingEffectPropertiesSetDuration | ILastingEffectPropertiesCustomDuration;
