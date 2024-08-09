import type { Duration } from '../Constants';
import type { IConstantAbilityProps } from '../../Interfaces';
import Effect from './Effect';

export interface IConstantAbility extends IConstantAbilityProps {
    duration: Duration;
    registeredEffects?: Effect[];
}
