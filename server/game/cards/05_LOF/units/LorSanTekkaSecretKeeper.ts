import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { WildcardCardType } from '../../../core/Constants';

export default class LorSanTekkaSecretKeeper extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '9910098295',
            internalName: 'lor-san-tekka#secret-keeper',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenDefeatedAbility({
            title: 'You may give an Experience token to a unique unit',
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                cardCondition: (card) => card.unique,
                immediateEffect: AbilityHelper.immediateEffects.giveExperience()
            }
        });
    }
}