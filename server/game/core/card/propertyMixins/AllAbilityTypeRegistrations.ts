import type { PlayableOrDeployableCardConstructor } from '../baseClasses/PlayableOrDeployableCard';
import { WithActionAbilities } from './ActionAbilityRegistration';
import { WithConstantAbilities } from './ConstantAbilityRegistration';
import { WithPreEnterPlayAbilities } from './PreEnterPlayAbilityRegistration';
import { WithTriggeredAbilities } from './TriggeredAbilityRegistration';

/** Mixin function that adds the ability to register action abilities to a base card class. */
export function WithAllAbilityTypes<TBaseClass extends PlayableOrDeployableCardConstructor>(BaseClass: TBaseClass) {
    return WithPreEnterPlayAbilities(WithConstantAbilities(WithTriggeredAbilities(WithActionAbilities(BaseClass))));
}
