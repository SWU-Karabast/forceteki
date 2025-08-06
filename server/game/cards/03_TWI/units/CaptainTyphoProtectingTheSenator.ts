import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName, WildcardCardType } from '../../../core/Constants';

export default class CaptainTyphoProtectingTheSenator extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '3033790509',
            internalName: 'captain-typho#protecting-the-senator',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'Give a unit Sentinel for this phase',
            optional: false,
            when: {
                onAttack: true,
                whenPlayed: true,
            },
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                    effect: AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Sentinel)
                })
            }
        });
    }
}
