import type { Duration } from '../Constants';
import type { IConstantAbilityProps } from '../../Interfaces';
import type { OngoingEffect } from './OngoingEffect';

export interface IConstantAbility extends IConstantAbilityProps {
    duration: Duration;
    registeredEffects?: OngoingEffect[];
}
