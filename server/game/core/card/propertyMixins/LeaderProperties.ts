import type { ZoneName } from '../../Constants';
import { CardType } from '../../Constants';
import * as Contract from '../../utils/Contract';
import type { Player } from '../../Player';
import type { IPlayableOrDeployableCardState, PlayableOrDeployableCardConstructor } from '../baseClasses/PlayableOrDeployableCard';
import { PlayableOrDeployableCard, type ICardWithExhaustProperty } from '../baseClasses/PlayableOrDeployableCard';
import type { ILeaderAbilityRegistrar } from '../AbilityRegistrationInterfaces';
import type { IAbilityHelper } from '../../../AbilityHelper';

export const LeaderPropertiesCard = WithLeaderProperties(PlayableOrDeployableCard);

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ILeaderCard extends ICardWithExhaustProperty {}

export interface ILeaderPropertiesCardState extends IPlayableOrDeployableCardState {
    deployed: boolean;
    onStartingSide: boolean;
}

/**
 * Mixin function that adds the standard properties for a unit (leader or non-leader) to a base class.
 * Specifically it gains:
 * - hp, damage, and power (from the corresponding mixins {@link WithPrintedHp}, {@link WithDamage}, and {@link WithPrintedPower})
 * - the ability for hp and power to be modified by effects
 * - the {@link InitiateAttackAction} ability so that the card can attack
 * - the ability to have attached upgrades
 */
export function WithLeaderProperties<TState extends IPlayableOrDeployableCardState, TBaseClass extends PlayableOrDeployableCardConstructor = PlayableOrDeployableCardConstructor>(BaseClass: TBaseClass) {
    return class AsLeader extends (BaseClass as typeof BaseClass & PlayableOrDeployableCardConstructor<TState & ILeaderPropertiesCardState>) implements ILeaderCard {
        // see Card constructor for list of expected args
        public constructor(...args: any[]) {
            super(...args);
            Contract.assertEqual(this.printedType, CardType.Leader);

            this.callSetupLeaderWithRegistrar();
        }

        public override isLeader(): this is ILeaderCard {
            return true;
        }

        protected callSetupLeaderWithRegistrar() {
            throw new Error('This method should be overridden in the subclass (such as LeaderUnitCard) to set up card abilities with the correct ability registrar type.');
        }

        /**
         * Create card abilities for the leader (non-unit) side by calling subsequent methods with appropriate properties
         */
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        protected setupLeaderSideAbilities(registrar: ILeaderAbilityRegistrar<ILeaderCard>, AbilityHelper: IAbilityHelper) { }

        // TODO TYPE REFACTOR: separate out the Leader types from the playable types
        public override getPlayCardActions() {
            return [];
        }

        // TODO TYPE REFACTOR: leaders shouldn't have the takeControl method
        public override takeControl(newController: Player, _moveTo?: ZoneName.SpaceArena | ZoneName.GroundArena | ZoneName.Resource): undefined {
            Contract.fail(`Attempting to take control of leader ${this.internalName} for player ${newController.name}, which is illegal`);
        }
    };
}
