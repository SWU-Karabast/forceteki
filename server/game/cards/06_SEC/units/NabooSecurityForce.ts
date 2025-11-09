import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Aspect, KeywordName, RelativePlayer, WildcardCardType } from '../../../core/Constants';
import * as EnumHelpers from '../../../core/utils/EnumHelpers';

export default class NabooSecurityForce extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '1002827363',
            internalName: 'naboo-security-force',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        const aspects = [Aspect.Command];
        registrar.addTriggeredAbility({
            title: `Disclose ${EnumHelpers.aspectString(aspects)} to give a friendly unit Sentinel for this phase`,
            when: {
                whenPlayed: true,
                whenDefeated: true,
            },
            immediateEffect: abilityHelper.immediateEffects.disclose({ aspects }),
            ifYouDo: {
                title: 'Give a friendly unit Sentinel for this phase',
                targetResolver: {
                    controller: RelativePlayer.Self,
                    cardTypeFilter: WildcardCardType.Unit,
                    immediateEffect: abilityHelper.immediateEffects.forThisPhaseCardEffect({
                        effect: abilityHelper.ongoingEffects.gainKeyword(KeywordName.Sentinel)
                    })
                }
            }
        });
    }
}
