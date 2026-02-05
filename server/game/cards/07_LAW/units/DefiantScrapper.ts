import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { WildcardCardType } from '../../../core/Constants';

export default class DefiantScrapper extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'defiant-scrapper-id',
            internalName: 'defiant-scrapper',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Defeat an enemy Credit token',
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Token,
                cardCondition: (card) => card.isCreditToken() && card.controller !== this.controller,
                immediateEffect: AbilityHelper.immediateEffects.defeat(),
            }
        });
    }
}