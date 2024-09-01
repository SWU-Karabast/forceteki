import { ActionAbility } from '../../ability/ActionAbility';
import TriggeredAbility from '../../ability/TriggeredAbility';
import { AbilityType } from '../../Constants';
import { IConstantAbility } from '../../ongoingEffect/IConstantAbility';
import { InPlayCardConstructor } from '../baseClasses/InPlayCard';

interface IAbilitySet {
    actionAbilities: ActionAbility[];
    constantAbilities: IConstantAbility[];
    triggeredAbilities: TriggeredAbility[];
}

/** Mixin function that creates a version of the base class that is a Token. */
export function WithLeaderAbilitySetup<TBaseClass extends InPlayCardConstructor>(BaseClass: TBaseClass) {
    return class WithLeaderAbilitySetup extends BaseClass {
        private leaderSideAbilities: IAbilitySet;
        private leaderUnitSideAbilities: IAbilitySet;

        // see Card constructor for list of expected args
        public constructor(...args: any[]) {
            super(...args);

            this.setupLeaderUnitAbilities();
            this.leaderUnitSideAbilities = this.generateCurrentAbilitySet();

            // reset ability lists so they can be re-initialized with leader side abilities
            this.actionAbilities = [];
            this.constantAbilities = [];
            this.triggeredAbilities = [];

            this.setupLeaderAbilities();
            this.leaderSideAbilities = this.generateCurrentAbilitySet();

            // leave leader side abilities in place for game start
        }

        private generateCurrentAbilitySet(): IAbilitySet {
            return {
                actionAbilities: this.actionAbilities,
                constantAbilities: this.constantAbilities,
                triggeredAbilities: this.triggeredAbilities
            };
        }

        /**
         * Create card abilities for the leader unit side by calling subsequent methods with appropriate properties
         */
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        protected setupLeaderUnitAbilities() {
        }

        /**
         * Create card abilities for the leader (non-unit) side by calling subsequent methods with appropriate properties
         */
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        protected setupLeaderAbilities() {
        }
    };
}
