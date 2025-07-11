import type { IActionAbilityProps } from '../../../Interfaces';
import type PreEnterPlayAbility from '../../ability/PreEnterPlayAbility';
import { type IPlayableOrDeployableCardState, type PlayableOrDeployableCardConstructor } from '../baseClasses/PlayableOrDeployableCard';
import type { Card } from '../Card';
import * as Contract from '../../utils/Contract';

export interface IPreEnterPlayAbilityRegistrar<T extends Card> {
    addPreEnterPlayAbility(properties: IActionAbilityProps<T>): PreEnterPlayAbility;
}

export interface ICardWithPreEnterPlayAbilities {
    getPreEnterPlayAbilities(): PreEnterPlayAbility[];
    getPrintedPreEnterPlayAbilities(): PreEnterPlayAbility[];
    removePrintedPreEnterPlayAbility(removeAbilityUuid: string): void;
}

/** Mixin function that adds the ability to register pre-enter play abilities to a base card class. */
export function WithPreEnterPlayAbilities<TBaseClass extends PlayableOrDeployableCardConstructor<TState>, TState extends IPlayableOrDeployableCardState>(BaseClass: TBaseClass) {
    return class WithPreEnterPlayAbilities extends BaseClass {
        public getPreEnterPlayAbilities(): PreEnterPlayAbility[] {
            return this.preEnterPlayAbilities;
        }

        public getPrintedPreEnterPlayAbilities(): PreEnterPlayAbility[] {
            return this.preEnterPlayAbilities.filter((ability) => ability.printedAbility);
        }

        protected addPreEnterPlayAbility(properties: IActionAbilityProps<this>): PreEnterPlayAbility {
            const ability = this.createPreEnterPlayAbility({ ...properties, printedAbility: true });
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

        public removePrintedPreEnterPlayAbility(removeAbilityUuid: string): void {
            this.removePreEnterPlayAbility(removeAbilityUuid, true);
        }

        private removePreEnterPlayAbility(removeAbilityUuid: string, printedAbility: boolean): void {
            const updatedAbilityList = this.preEnterPlayAbilities.filter((ability) => !(ability.uuid === removeAbilityUuid && ability.printedAbility === printedAbility));
            Contract.assertEqual(updatedAbilityList.length, this.actionAbilities.length - 1, `Expected to find one instance of pre enter play ability to remove but instead found ${this.actionAbilities.length - updatedAbilityList.length}`);

            this.preEnterPlayAbilities = updatedAbilityList;
        }
    };
}
