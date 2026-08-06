import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName, RelativePlayer, WildcardCardType } from '../../../core/Constants';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class DomesticatedLothCat extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '0637436414',
            internalName: 'domesticated-lothcat',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: `Enemy units lose ${TextHelper.Ambush} and Support.`,
            targetController: RelativePlayer.Opponent,
            targetCardTypeFilter: WildcardCardType.Unit,
            ongoingEffect: [
                AbilityHelper.ongoingEffects.loseKeyword(KeywordName.Ambush),
                AbilityHelper.ongoingEffects.loseKeyword(KeywordName.Support)
            ]
        });
    }
}
