import type { IActionAbilityProps } from '../../../Interfaces';
import type PreEnterPlayAbility from '../../ability/PreEnterPlayAbility';
import { type IPlayableOrDeployableCardState, type PlayableOrDeployableCardConstructor } from '../baseClasses/PlayableOrDeployableCard';
import type { Card } from '../Card';

export interface IPreEnterPlayAbilityRegistrar<T extends Card> {
    addPreEnterPlayAbility(properties: IActionAbilityProps<T>): PreEnterPlayAbility;
}

export interface ICardWithPreEnterPlayAbilities {
    getPreEnterPlayAbilities(): PreEnterPlayAbility[];
}

/** Mixin function that adds the ability to register pre-enter play abilities to a base card class. */
export function WithPreEnterPlayAbilities<TBaseClass extends PlayableOrDeployableCardConstructor<TState>, TState extends IPlayableOrDeployableCardState>(BaseClass: TBaseClass) {
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

        protected override getAbilityRegistrar() {
            const registrar: IPreEnterPlayAbilityRegistrar<this> = {
                addPreEnterPlayAbility: (properties) => this.addPreEnterPlayAbility(properties),
            };

            return {
                ...super.getAbilityRegistrar(),
                ...registrar
            };
        }
    };
}
