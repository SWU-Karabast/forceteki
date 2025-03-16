import type { IConstantAbilityProps } from '../../../Interfaces';
import { WildcardZoneName } from '../../Constants';
import type { IConstantAbility } from '../../ongoingEffect/IConstantAbility';
import type { CardConstructor } from '../Card';
import * as Contract from '../../utils/Contract';

export interface ICardWithConstantAbilities {
    addGainedConstantAbility(properties: IConstantAbilityProps): string;
    removeGainedConstantAbility(removeAbilityUuid: string): void;
}

/** Mixin function that adds the ability to register constant abilities to a base card class. */
export function WithConstantAbilities<TBaseClass extends CardConstructor>(BaseClass: TBaseClass) {
    return class WithConstantAbilities extends BaseClass {
        protected addConstantAbility(properties: IConstantAbilityProps<this>): IConstantAbility {
            const ability = this.createConstantAbility(properties);
            // This check is necessary to make sure on-play cost-reduction effects are registered
            if (ability.sourceZoneFilter === WildcardZoneName.Any) {
                ability.registeredEffects = this.addEffectToEngine(ability);
            }
            this.constantAbilities.push(ability);
            return ability;
        }

        public override canRegisterConstantAbilities(): this is ICardWithConstantAbilities {
            return true;
        }

        // ******************************************** ABILITY STATE MANAGEMENT ********************************************
        /**
             * Adds a dynamically gained constant ability to the card and immediately registers its triggers. Used for "gain ability" effects.
             *
             * @returns The uuid of the created triggered ability
             */
        public addGainedConstantAbility(properties: IConstantAbilityProps): string {
            const addedAbility = this.createConstantAbility(properties);
            this.constantAbilities.push(addedAbility);
            addedAbility.registeredEffects = this.addEffectToEngine(addedAbility);

            return addedAbility.uuid;
        }

        /** Removes a dynamically gained constant ability and unregisters its effects */
        public removeGainedConstantAbility(removeAbilityUuid: string): void {
            let abilityToRemove: IConstantAbility = null;
            const remainingAbilities: IConstantAbility[] = [];

            for (const constantAbility of this.constantAbilities) {
                if (constantAbility.uuid === removeAbilityUuid) {
                    if (abilityToRemove) {
                        Contract.fail(`Expected to find one instance of gained ability '${abilityToRemove.abilityIdentifier}' on card ${this.internalName} to remove but instead found multiple`);
                    }

                    abilityToRemove = constantAbility;
                } else {
                    remainingAbilities.push(constantAbility);
                }
            }

            if (abilityToRemove == null) {
                Contract.fail(`Did not find any instance of target gained ability to remove on card ${this.internalName}`);
            }

            this.constantAbilities = remainingAbilities;

            this.removeEffectFromEngine(abilityToRemove.registeredEffects);
            abilityToRemove.registeredEffects = [];
        }
    };
}
