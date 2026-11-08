import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { IAbilityHelper } from '../../../AbilityHelper';
import { KeywordName, RelativePlayer, WildcardCardType } from '../../../core/Constants';
import { TextHelper } from '../../../core/utils/TextHelper';

// Each friendly unit with Sentinel gets +1/+1.

export default class GrandMoffTarkinCrackingDownOnLothal extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '0001065356',
            internalName: 'grand-moff-tarkin#cracking-down-on-lothal',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: `Each friendly unit with ${TextHelper.Sentinel} gets +1/+1`,
            targetController: RelativePlayer.Self,
            targetCardTypeFilter: WildcardCardType.Unit,
            matchTarget: (card) => card.hasSomeKeyword(KeywordName.Sentinel),
            ongoingEffect: abilityHelper.ongoingEffects.modifyStats({ power: 1, hp: 1 })
        });
    }
}
