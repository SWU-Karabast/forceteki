import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class JuniorSenator extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: 'junior-senator-id',
            internalName: 'junior-senator'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Return an upgrade that costs 3 or less to its owner\'s hand.',
            optional: true,
            targetResolver: {
                cardCondition: (card) => card.isUpgrade() && card.cost <= 3,
                immediateEffect: AbilityHelper.immediateEffects.returnToHand()
            }
        });
    }
}