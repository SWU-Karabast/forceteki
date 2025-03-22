import type { IReplacementEffectAbilityProps, ITriggeredAbilityProps } from '../../../Interfaces';
import ReplacementEffectAbility from '../../ability/ReplacementEffectAbility';
import type TriggeredAbility from '../../ability/TriggeredAbility';
import type { Card, CardConstructor, ICardState } from '../Card';
import * as Contract from '../../utils/Contract';

export interface ICardWithTriggeredAbilities {
    getTriggeredAbilities(): TriggeredAbility[];
    addGainedTriggeredAbility(properties: ITriggeredAbilityProps): string;
    addGainedReplacementEffectAbility(properties: IReplacementEffectAbilityProps): string;
    removeGainedTriggeredAbility(removeAbilityUuid: string): void;
    removeGainedReplacementEffectAbility(removeAbilityUuid: string): void;
}

/** Mixin function that adds the ability to register triggered abilities to a base card class. */
export function WithTriggeredAbilities<TBaseClass extends CardConstructor<TState>, TState extends ICardState>(BaseClass: TBaseClass) {
    return class WithTriggeredAbilities extends BaseClass {
        /**
         * `SWU 7.6.1`: Triggered abilities have bold text indicating their triggering condition, starting with the word
         * “When” or “On”, followed by a colon and an effect. Examples of triggered abilities are “When Played,”
         * “When Defeated,” and “On Attack” abilities
         */
        public getTriggeredAbilities(): TriggeredAbility[] {
            return this.triggeredAbilities;
        }

        public override canRegisterTriggeredAbilities(): this is ICardWithTriggeredAbilities {
            return true;
        }

        protected addTriggeredAbility(properties: ITriggeredAbilityProps<this>): TriggeredAbility {
            const ability = this.createTriggeredAbility(properties);
            this.triggeredAbilities.push(ability);
            return ability;
        }

        protected addReplacementEffectAbility(properties: IReplacementEffectAbilityProps<this>): ReplacementEffectAbility {
            const ability = this.createReplacementEffectAbility(properties);

            // for initialization and tracking purposes, a ReplacementEffect is basically a Triggered ability
            this.triggeredAbilities.push(ability);

            return ability;
        }

        public createReplacementEffectAbility<TSource extends Card = this>(properties: IReplacementEffectAbilityProps<TSource>): ReplacementEffectAbility {
            return new ReplacementEffectAbility(this.game, this, Object.assign(this.buildGeneralAbilityProps('replacement'), properties));
        }

        // ******************************************** ABILITY STATE MANAGEMENT ********************************************
        /**
             * Adds a dynamically gained triggered ability to the card and immediately registers its triggers. Used for "gain ability" effects.
             *
             * @returns The uuid of the created triggered ability
             */
        public addGainedTriggeredAbility(properties: ITriggeredAbilityProps): string {
            const addedAbility = this.createTriggeredAbility(properties);
            this.triggeredAbilities.push(addedAbility);
            addedAbility.registerEvents();

            return addedAbility.uuid;
        }

        /**
             * Adds a dynamically gained triggered ability to the card and immediately registers its triggers. Used for "gain ability" effects.
             *
             * @returns The uuid of the created triggered ability
             */
        public addGainedReplacementEffectAbility(properties: IReplacementEffectAbilityProps): string {
            const addedAbility = this.createReplacementEffectAbility(properties);
            this.triggeredAbilities.push(addedAbility);
            addedAbility.registerEvents();

            return addedAbility.uuid;
        }

        /** Removes a dynamically gained triggered ability and unregisters its effects */
        public removeGainedTriggeredAbility(removeAbilityUuid: string): void {
            let abilityToRemove: TriggeredAbility = null;
            const remainingAbilities: TriggeredAbility[] = [];

            for (const triggeredAbility of this.triggeredAbilities) {
                if (triggeredAbility.uuid === removeAbilityUuid) {
                    if (abilityToRemove) {
                        Contract.fail(`Expected to find one instance of gained ability '${abilityToRemove.abilityIdentifier}' on card ${this.internalName} to remove but instead found multiple`);
                    }

                    abilityToRemove = triggeredAbility;
                } else {
                    remainingAbilities.push(triggeredAbility);
                }
            }

            if (abilityToRemove == null) {
                Contract.fail(`Did not find any instance of target gained ability to remove on card ${this.internalName}`);
            }

            this.triggeredAbilities = remainingAbilities;
            abilityToRemove.unregisterEvents();
        }

        public removeGainedReplacementEffectAbility(removeAbilityUuid: string): void {
            this.removeGainedTriggeredAbility(removeAbilityUuid);
        }
    };
}
