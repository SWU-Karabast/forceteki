import type { IDamageModificationAbilityProps, IReplacementEffectAbilityProps, ITriggeredAbilityProps } from '../../../Interfaces';
import ReplacementEffectAbility from '../../ability/ReplacementEffectAbility';
import type TriggeredAbility from '../../ability/TriggeredAbility';
import type { Card, CardConstructor, ICardState } from '../Card';
import * as Contract from '../../utils/Contract';
import DamageModificationAbility from '../../ability/DamageModificationAbility';

export interface ITriggeredAbilityRegistrar<T extends Card> {
    addTriggeredAbility(properties: ITriggeredAbilityProps<T>): TriggeredAbility;
    addReplacementEffectAbility(properties: IReplacementEffectAbilityProps<T>): ReplacementEffectAbility;
    addDamageModificationAbility(properties: IDamageModificationAbilityProps<T>): DamageModificationAbility;
    addGainedTriggeredAbility(properties: ITriggeredAbilityProps<T>): string;
    addGainedReplacementEffectAbility(properties: IReplacementEffectAbilityProps<T>): string;
    addGainedDamageModificationAbility(properties: IDamageModificationAbilityProps<T>): string;
}

export interface ICardWithTriggeredAbilities<T extends Card> {
    addGainedTriggeredAbility(properties: ITriggeredAbilityProps<T>): string;
    addGainedReplacementEffectAbility(properties: IReplacementEffectAbilityProps<T>): string;
    addGainedDamageModificationAbility(properties: IDamageModificationAbilityProps<T>): string;
    getTriggeredAbilities(): TriggeredAbility[];
    removeGainedTriggeredAbility(removeAbilityUuid: string): void;
    removeGainedReplacementEffectAbility(removeAbilityUuid: string): void;
    removeGainedDamageModificationAbility(removeAbilityUuid: string): void;
    removePrintedTriggeredAbility(removeAbilityUuid: string): void;
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
            return this.triggeredAbilities as TriggeredAbility[];
        }

        public override canRegisterTriggeredAbilities(): this is ICardWithTriggeredAbilities<this> {
            return true;
        }

        private addTriggeredAbility(properties: ITriggeredAbilityProps<this>): TriggeredAbility {
            const ability = this.createTriggeredAbility({ ...properties, printedAbility: true });
            this.state.triggeredAbilities.push(ability.getRef());
            return ability;
        }

        protected override getAbilityRegistrar() {
            const registrar: ITriggeredAbilityRegistrar<this> = {
                addTriggeredAbility: (properties: ITriggeredAbilityProps<this>) => this.addTriggeredAbility(properties),
                addReplacementEffectAbility: (properties: IReplacementEffectAbilityProps<this>) => this.addReplacementEffectAbility(properties),
                addDamageModificationAbility: (properties: IDamageModificationAbilityProps<this>) => this.addDamageModificationAbility(properties),
                addGainedTriggeredAbility: (properties: ITriggeredAbilityProps<this>) => this.addGainedTriggeredAbility(properties),
                addGainedReplacementEffectAbility: (properties: IReplacementEffectAbilityProps<this>) => this.addGainedReplacementEffectAbility(properties),
                addGainedDamageModificationAbility: (properties: IDamageModificationAbilityProps<this>) => this.addGainedDamageModificationAbility(properties)
            };

            return {
                ...super.getAbilityRegistrar(),
                ...registrar
            };
        }

        private addReplacementEffectAbility(properties: IReplacementEffectAbilityProps<this>): ReplacementEffectAbility {
            const ability = this.createReplacementEffectAbility({ ...properties, printedAbility: true });

            // for initialization and tracking purposes, a ReplacementEffect is basically a Triggered ability
            this.state.triggeredAbilities.push(ability.getRef());

            return ability;
        }

        public createReplacementEffectAbility<TSource extends Card = this>(properties: IReplacementEffectAbilityProps<TSource>): ReplacementEffectAbility {
            return new ReplacementEffectAbility(this.game, this, Object.assign(this.buildGeneralAbilityProps('replacement'), properties));
        }

        private addDamageModificationAbility(properties: IDamageModificationAbilityProps<this>): DamageModificationAbility {
            const ability = this.createDamageModificationAbility({ ...properties, printedAbility: true });

            // for initialization and tracking purposes, a DamageModification is basically a Triggered ability
            this.state.triggeredAbilities.push(ability.getRef());

            return ability;
        }

        public createDamageModificationAbility<TSource extends Card = this>(properties: IDamageModificationAbilityProps<TSource>): DamageModificationAbility {
            return new DamageModificationAbility(this.game, this, Object.assign(this.buildGeneralAbilityProps('replacement'), properties));
        }

        // ******************************************** ABILITY STATE MANAGEMENT ********************************************
        /**
         * Adds a dynamically gained triggered ability to the card and immediately registers its triggers. Used for "gain ability" effects.
         *
         * @returns The uuid of the created triggered ability
         */
        public addGainedTriggeredAbility<TSource extends Card = this>(properties: ITriggeredAbilityProps<TSource>): string {
            const addedAbility = this.createTriggeredAbility(properties);
            this.state.triggeredAbilities.push(addedAbility.getRef());
            addedAbility.registerEvents();

            return addedAbility.uuid;
        }

        /**
         * Adds a dynamically gained triggered ability to the card and immediately registers its triggers. Used for "gain ability" effects.
         *
         * @returns The uuid of the created triggered ability
         */
        public addGainedReplacementEffectAbility<TSource extends Card = this>(properties: IReplacementEffectAbilityProps<TSource>): string {
            const addedAbility = this.createReplacementEffectAbility(properties);
            this.state.triggeredAbilities.push(addedAbility.getRef());
            addedAbility.registerEvents();

            return addedAbility.uuid;
        }

        /**
         * Adds a dynamically gained damage modification ability to the card and immediately registers its triggers. Used for "gain ability" effects.
         *
         * @returns The uuid of the created triggered ability
         */
        public addGainedDamageModificationAbility<TSource extends Card = this>(properties: IDamageModificationAbilityProps<TSource>): string {
            const addedAbility = this.createDamageModificationAbility({ ...properties });
            this.state.triggeredAbilities.push(addedAbility.getRef());
            addedAbility.registerEvents();

            return addedAbility.uuid;
        }

        /** Removes a dynamically gained triggered ability and unregisters its effects */
        public removeGainedTriggeredAbility(removeAbilityUuid: string): void {
            this.removeTriggeredAbility(removeAbilityUuid, false);
        }

        public removeGainedReplacementEffectAbility(removeAbilityUuid: string): void {
            this.removeGainedTriggeredAbility(removeAbilityUuid);
        }

        public removeGainedDamageModificationAbility(removeAbilityUuid: string): void {
            this.removeGainedTriggeredAbility(removeAbilityUuid);
        }

        public removePrintedTriggeredAbility(removeAbilityUuid: string): void {
            this.removeTriggeredAbility(removeAbilityUuid, true);
        }

        public removeTriggeredAbility(removeAbilityUuid: string, printedAbility: boolean): void {
            let abilityToRemove: TriggeredAbility = null;
            const remainingAbilities: TriggeredAbility[] = [];

            for (const triggeredAbility of this.triggeredAbilities) {
                if (triggeredAbility.uuid === removeAbilityUuid && triggeredAbility.printedAbility === printedAbility) {
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

            this.state.triggeredAbilities = remainingAbilities.map((x) => x.getRef());
            abilityToRemove.unregisterEvents();
        }
    };
}
