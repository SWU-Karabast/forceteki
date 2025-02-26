import type { IActionAbilityProps } from '../../../Interfaces';
import type { ActionAbility } from '../../ability/ActionAbility';
import type { CardConstructor } from '../Card';

/** Mixin function that adds the ability to register action abilities to a base card class. */
export function WithActionAbilities<TBaseClass extends CardConstructor>(BaseClass: TBaseClass) {
    return class WithActionAbilities extends BaseClass {
        protected addActionAbility(properties: IActionAbilityProps<this>): ActionAbility {
            const ability = this.createActionAbility(properties);
            this.actionAbilities.push(ability);
            return ability;
        }
    };
}
