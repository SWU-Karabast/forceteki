import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { WildcardCardType } from '../../../core/Constants';

export default class TrexlerArmoredMarauder extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '6339984693',
            internalName: 'trexler-armored-marauder',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Give a shield token to a unit that costs 3 or less',
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                cardCondition: (card) => card.isUnit() && card.cost <= 3,
                immediateEffect: AbilityHelper.immediateEffects.giveShield()
            }
        });
    }
}