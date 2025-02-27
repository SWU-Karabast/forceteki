import type { CardConstructor } from '../Card';
import { WithActionAbilities } from './ActionAbilityRegistration';
import { WithConstantAbilities } from './ConstantAbilityRegistration';
import { WithTriggeredAbilities } from './TriggeredAbilityRegistration';

/** Mixin function that adds the ability to register action abilities to a base card class. */
export function WithAllAbilityTypes<TBaseClass extends CardConstructor>(BaseClass: TBaseClass) {
    return WithConstantAbilities(WithTriggeredAbilities(WithActionAbilities(BaseClass)));
}
