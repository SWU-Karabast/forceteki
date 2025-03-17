import type { IActionAbilityProps } from '../../../Interfaces';
import type { ActionAbility } from '../../ability/ActionAbility';
import type { CardConstructor, ICardState } from '../Card';
import * as Contract from '../../utils/Contract';

export interface ICardWithActionAbilities {
    addGainedActionAbility(properties: IActionAbilityProps): string;
    removeGainedActionAbility(removeAbilityUuid: string): void;
}

/** Mixin function that adds the ability to register action abilities to a base card class. */
export function WithActionAbilities<TBaseClass extends CardConstructor<TState>, TState extends ICardState>(BaseClass: TBaseClass) {
    return class WithActionAbilities extends BaseClass {
        protected addActionAbility(properties: IActionAbilityProps<this>): ActionAbility {
            const ability = this.createActionAbility(properties);
            this.actionAbilities.push(ability);
            return ability;
        }

        public override canRegisterActionAbilities(): this is ICardWithActionAbilities {
            return true;
        }

        // ******************************************** ABILITY STATE MANAGEMENT ********************************************
        /**
             * Adds a dynamically gained action ability to the card. Used for "gain ability" effects.
             *
             * Duplicates of the same gained action from duplicates of the same source card can be added,
             * but only one will be presented to the user as an available action.
             *
             * @returns The uuid of the created action ability
        */
        public addGainedActionAbility(properties: IActionAbilityProps): string {
            const addedAbility = this.createActionAbility(properties);
            this.actionAbilities.push(addedAbility);

            return addedAbility.uuid;
        }

        /** Removes a dynamically gained action ability */
        public removeGainedActionAbility(removeAbilityUuid: string): void {
            const updatedAbilityList = this.actionAbilities.filter((ability) => ability.uuid !== removeAbilityUuid);
            Contract.assertEqual(updatedAbilityList.length, this.actionAbilities.length - 1, `Expected to find one instance of gained action ability to remove but instead found ${this.actionAbilities.length - updatedAbilityList.length}`);

            this.actionAbilities = updatedAbilityList;
        }
    };
}
