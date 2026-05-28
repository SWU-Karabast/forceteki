import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName } from '../../../core/Constants';

export default class GozantiAssaultCarrier extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '8244257655',
            internalName: 'gozanti-assault-carrier',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addOnAttackAbility({
            title: 'This unit gains Sentinel for this phase',
            immediateEffect: abilityHelper.immediateEffects.forThisPhaseCardEffect({
                effect: abilityHelper.ongoingEffects.gainKeyword(KeywordName.Sentinel),
            }),
        });
    }
}
