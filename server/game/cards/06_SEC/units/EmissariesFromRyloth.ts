import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { WildcardCardType } from '../../../core/Constants';

export default class EmissariesFromRyloth extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '1918275190',
            internalName: 'emissaries-from-ryloth',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Give a unit –3/–0 for this phase',
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: abilityHelper.immediateEffects.forThisPhaseCardEffect({
                    effect: abilityHelper.ongoingEffects.modifyStats({ power: -3, hp: 0 })
                })
            }
        });
    }
}
