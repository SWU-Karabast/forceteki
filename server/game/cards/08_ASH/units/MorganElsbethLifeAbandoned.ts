import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { WildcardCardType } from '../../../core/Constants';
import type { IAbilityHelper } from '../../../AbilityHelper';

export default class MorganElsbethLifeAbandoned extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '3100960073',
            internalName: 'morgan-elsbeth#life-abandoned',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenDefeatedAbility({
            title: 'Give a unit -2/-2 for this phase',
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: abilityHelper.immediateEffects.forThisPhaseCardEffect({
                    effect: abilityHelper.ongoingEffects.modifyStats({ power: -2, hp: -2 })
                })
            }
        });
    }
}
