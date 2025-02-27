import type { ZoneName } from '../../Constants';
import { CardType } from '../../Constants';
import * as Contract from '../../utils/Contract';
import type Player from '../../Player';
import type { PlayableOrDeployableCardConstructor } from '../baseClasses/PlayableOrDeployableCard';
import { PlayableOrDeployableCard, type ICardWithExhaustProperty } from '../baseClasses/PlayableOrDeployableCard';

export const LeaderPropertiesCard = WithLeaderProperties(PlayableOrDeployableCard);

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ILeaderCard extends ICardWithExhaustProperty {}

/**
 * Mixin function that adds the standard properties for a unit (leader or non-leader) to a base class.
 * Specifically it gains:
 * - hp, damage, and power (from the corresponding mixins {@link WithPrintedHp}, {@link WithDamage}, and {@link WithPrintedPower})
 * - the ability for hp and power to be modified by effects
 * - the {@link InitiateAttackAction} ability so that the card can attack
 * - the ability to have attached upgrades
 */
export function WithLeaderProperties<TBaseClass extends PlayableOrDeployableCardConstructor>(BaseClass: TBaseClass) {
    return class AsLeader extends BaseClass implements ILeaderCard {
        // see Card constructor for list of expected args
        public constructor(...args: any[]) {
            super(...args);
            Contract.assertEqual(this.printedType, CardType.Leader);

            this.setupLeaderSideAbilities(this);
        }

        public override isLeader(): this is ILeaderCard {
            return true;
        }

        /**
         * Create card abilities for the leader (non-unit) side by calling subsequent methods with appropriate properties
         */
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        protected setupLeaderSideAbilities(sourceCard: this) { }

        // TODO TYPE REFACTOR: separate out the Leader types from the playable types
        public override getPlayCardActions() {
            return [];
        }

        // TODO TYPE REFACTOR: leaders shouldn't have the takeControl method
        public override takeControl(newController: Player, _moveTo?: ZoneName.SpaceArena | ZoneName.GroundArena | ZoneName.Resource) {
            Contract.fail(`Attempting to take control of leader ${this.internalName} for player ${newController.name}, which is illegal`);
        }
    };
}
