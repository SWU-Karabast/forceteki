import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { IAbilityHelper } from '../../../AbilityHelper';
import { KeywordName } from '../../../core/Constants';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class SolCompassionateGuardian extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'sol#compassionate-guardian-id',
            internalName: 'sol#compassionate-guardian',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addOnAttackAbility({
            title: `This unit gains ${TextHelper.Sentinel} for this phase`,
            immediateEffect: abilityHelper.immediateEffects.forThisPhaseCardEffect({
                effect: abilityHelper.ongoingEffects.gainKeyword(KeywordName.Sentinel)
            })
        });
    }
}