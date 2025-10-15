import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName, RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class CaptainRexIntoTheFirefight extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'captain-rex#into-the-firefight-id',
            internalName: 'captain-rex#into-the-firefight',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Give this unit Sentinel for this phase',
            optional: false,
            immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                effect: AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Sentinel)
            }),
            then: ({
                title: 'Give an enemy unit Sentinel for this phase',
                targetResolver: {
                    cardTypeFilter: WildcardCardType.Unit,
                    controller: RelativePlayer.Opponent,
                    immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                        effect: AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Sentinel)
                    })
                }
            })
        });
        registrar.addOnAttackCompletedAbility({
            title: 'Give this unit Sentinel for this phase',
            optional: false,
            immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                effect: AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Sentinel)
            }),
            then: ({
                title: 'Give an enemy unit Sentinel for this phase',
                targetResolver: {
                    cardTypeFilter: WildcardCardType.Unit,
                    controller: RelativePlayer.Opponent,
                    immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                        effect: AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Sentinel)
                    })
                }
            })
        });
    }
}