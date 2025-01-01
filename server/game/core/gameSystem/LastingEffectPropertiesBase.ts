import type { AbilityContext } from '../ability/AbilityContext';
import type PlayerOrCardAbility from '../ability/PlayerOrCardAbility';
import type { Duration } from '../Constants';
import type { WhenType } from '../../Interfaces';
import { type IGameSystemProperties } from './GameSystem';

export interface ILastingEffectPropertiesBase extends IGameSystemProperties {
    duration: Duration;
    condition?: (context: AbilityContext) => boolean;
    until?: WhenType;
    effect?: any;
    ability?: PlayerOrCardAbility;
}
