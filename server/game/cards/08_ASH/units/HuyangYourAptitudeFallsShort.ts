import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { WildcardCardType } from '../../../core/Constants';

export default class HuyangYourAptitudeFallsShort extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'huyang#your-aptitude-falls-short-id',
            internalName: 'huyang#your-aptitude-falls-short',
        };
    }

    public override setupCardAbilities (registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addOnAttackAbility({
            title: 'Give an upgraded unit -4/-0 for this phase',
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                cardCondition: (card) => card.isUnit() && card.isUpgraded(),
                immediateEffect: abilityHelper.immediateEffects.forThisPhaseCardEffect({
                    effect: abilityHelper.ongoingEffects.modifyStats({ power: -4, hp: 0 })
                })
            }
        });
    }
}