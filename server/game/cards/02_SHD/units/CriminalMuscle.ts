import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { WildcardCardType } from '../../../core/Constants';

export default class CriminalMuscle extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '6475868209',
            internalName: 'criminal-muscle'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Return a non-unique upgrade to its owner\'s hand.',
            optional: true,
            targetResolver: {
                cardCondition: (card) => !card.unique,
                cardTypeFilter: WildcardCardType.Upgrade,
                immediateEffect: AbilityHelper.immediateEffects.returnToHand()
            }
        });
    }
}
