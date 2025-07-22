import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { TargetMode, WildcardCardType } from '../../../core/Constants';

export default class IG2000AssassinsAggressor extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '3722493191',
            internalName: 'ig2000#assassins-aggressor',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Deal 1 damage to each of up to 3 units',
            targetResolver: {
                mode: TargetMode.UpTo,
                canChooseNoCards: true,
                numCards: 3,
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 1 })
            }
        });
    }
}