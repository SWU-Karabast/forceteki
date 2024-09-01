import { IActionAbilityProps, IConstantAbilityProps, ITriggeredAbilityProps } from '../../../Interfaces';
import { AbilityType } from '../../Constants';
import { InPlayCardConstructor } from '../baseClasses/InPlayCard';
import { IAbilityInitializer } from '../Card';

/** Mixin function that creates a version of the base class that is a Token. */
export function WithLeaderAbilitySetup<TBaseClass extends InPlayCardConstructor>(BaseClass: TBaseClass) {
    return class WithLeaderAbilitySetup extends BaseClass {
        protected leaderUnitSideAbilityInitializers: IAbilityInitializer[] = [];
        protected leaderSideAbilityInitializers: IAbilityInitializer[] = [];

        private leaderSideAddMode: boolean;

        // see Card constructor for list of expected args
        public constructor(...args: any[]) {
            super(...args);

            this.leaderSideAddMode = false;
            this.setupLeaderUnitAbilities();

            this.leaderSideAddMode = true;
            this.setupLeaderAbilities();
        }

        // protected override addActionAbility(properties: IActionAbilityProps<this>) {
        //     const initializerList = this.leaderSideAddMode ? this.leaderSideAbilityInitializers : this.leaderUnitSideAbilityInitializers;

        //     initializerList.push({
        //         abilityType: AbilityType.Action,
        //         initialize: () => this._actionAbilities.push(this.createActionAbility(properties))
        //     });
        // }

        // protected override addConstantAbility(properties: IConstantAbilityProps<this>): void {
        //     const initializerList = this.leaderSideAddMode ? this.leaderSideAbilityInitializers : this.leaderUnitSideAbilityInitializers;

        //     initializerList.push({
        //         abilityType: AbilityType.Constant,
        //         initialize: () => this._constantAbilities.push(this.createConstantAbility(properties))
        //     });
        // }

        // protected override addTriggeredAbility(properties: ITriggeredAbilityProps): void {
        //     const initializerList = this.leaderSideAddMode ? this.leaderSideAbilityInitializers : this.leaderUnitSideAbilityInitializers;

        //     initializerList.push({
        //         abilityType: AbilityType.Triggered,
        //         initialize: () => this._triggeredAbilities.push(this.createTriggeredAbility(properties))
        //     });
        // }

        // private addToInitializerListForActiveSide() {}

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
