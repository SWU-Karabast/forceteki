import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { CardType, KeywordName, RelativePlayer } from '../../../core/Constants';

export default class NabooRoyalStarshipFitForAQueen extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '2919204327',
            internalName: 'naboo-royal-starship#fit-for-a-queen',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: 'Each friendly leader unit gains Raid 2 and Overwhelm',
            targetController: RelativePlayer.Self,
            targetCardTypeFilter: CardType.LeaderUnit,
            ongoingEffect: [
                abilityHelper.ongoingEffects.gainKeyword({ keyword: KeywordName.Raid, amount: 2 }),
                abilityHelper.ongoingEffects.gainKeyword(KeywordName.Overwhelm),
            ]
        });
    }
}
