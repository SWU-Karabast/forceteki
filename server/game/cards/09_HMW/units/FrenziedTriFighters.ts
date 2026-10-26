import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { WildcardCardType } from '../../../core/Constants';

export default class FrenziedTriFighters extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '1633962913',
            internalName: 'frenzied-trifighters'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Defeat an upgrade that costs 3 or less',
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Upgrade,
                cardCondition: (card) => card.hasCost() && card.cost <= 3,
                immediateEffect: abilityHelper.immediateEffects.defeat()
            }
        });
    }
}
