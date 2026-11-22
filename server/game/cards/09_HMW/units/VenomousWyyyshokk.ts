import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { IAbilityHelper } from '../../../AbilityHelper';
import { WildcardCardType } from '../../../core/Constants';

export default class VenomousWyyyshokk extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '5121155857',
            internalName: 'venomous-wyyyshokk',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenDefeatedAbility({
            title: 'Give a Weakness token to a damaged unit',
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                cardCondition: (card) => card.isUnit() && card.damage !== 0,
                immediateEffect: abilityHelper.immediateEffects.giveWeakness()
            }
        });
    }
}