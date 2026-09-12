import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { WildcardCardType } from '../../../core/Constants';

export default class ScorchImperialCommando extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'scorch#imperial-commando-id',
            internalName: 'scorch#imperial-commando',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addOnAttackAbility({
            title: 'Deal 1 damage to an upgraded unit',
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                cardCondition: (card) => card.isUnit() && card.isUpgraded(),
                immediateEffect: abilityHelper.immediateEffects.damage({ amount: 1 })
            }
        });
    }
}