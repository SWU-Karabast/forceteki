import type { IActionAbilityProps } from '../../../Interfaces';
import type PreEnterPlayAbility from '../../ability/PreEnterPlayAbility';
import type { CardConstructor, ICardState } from '../Card';

export interface ICardWithPreEnterPlayAbilities {
    getPreEnterPlayAbilities(): PreEnterPlayAbility[];
}

/** Mixin function that adds the ability to register pre-enter play abilities to a base card class. */
export function WithPreEnterPlayAbilities<TBaseClass extends CardConstructor<TState>, TState extends ICardState>(BaseClass: TBaseClass) {
    return class WithPreEnterPlayAbilities extends BaseClass {
        public getPreEnterPlayAbilities(): PreEnterPlayAbility[] {
            return this.preEnterPlayAbilities;
        }

        protected addPreEnterPlayAbility(properties: IActionAbilityProps<this>): PreEnterPlayAbility {
            const ability = this.createPreEnterPlayAbility(properties);
            this.preEnterPlayAbilities.push(ability);
            return ability;
        }

        public override canRegisterPreEnterPlayAbilities(): this is ICardWithPreEnterPlayAbilities {
            return true;
        }
    };
}
