import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { WildcardCardType } from '../../../core/Constants';

export default class CreditorsClaim extends UpgradeCard {
    protected override getImplementationId () {
        return {
            id: 'creditors-claim-id',
            internalName: 'creditors-claim',
        };
    }

    public override setupCardAbilities (registrar: IUpgradeAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addGainWhenDefeatedAbilityTargetingAttached({
            title: 'Defeat a unit with 3 or less remaining HP',
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                cardCondition: (card) => card.isUnit() && card.remainingHp <= 3,
                immediateEffect: abilityHelper.immediateEffects.defeat()
            }
        });
    }
}
