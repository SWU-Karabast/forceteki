import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName, RelativePlayer, Trait, WildcardCardType } from '../../../core/Constants';

export default class WedgeAntillesStarOfTheRebellion extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '4339330745',
            internalName: 'wedge-antilles#star-of-the-rebellion',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: 'Each friendly Vehicle unit gets +1/+1 and gains Ambush.',
            targetController: RelativePlayer.Self,
            targetCardTypeFilter: WildcardCardType.Unit,
            matchTarget: (card) => card.hasSomeTrait(Trait.Vehicle),
            ongoingEffect: [
                AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Ambush),
                AbilityHelper.ongoingEffects.modifyStats({ power: 1, hp: 1 })
            ]
        });
    }
}
