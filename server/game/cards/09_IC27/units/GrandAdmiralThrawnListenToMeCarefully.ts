import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { IAbilityHelper } from '../../../AbilityHelper';
import { TextHelper } from '../../../core/utils/TextHelper';
import { KeywordName, RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class GrandAdmiralThrawnListenToMeCarefully extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'grand-admiral-thrawn#listen-to-me-carefully-id',
            internalName: 'grand-admiral-thrawn#listen-to-me-carefully',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: `Give an Experience token to a friendly unit. It gains ${TextHelper.keyword(KeywordName.Sentinel)} for this phase`,
            when: {
                whenPlayed: true,
                onAttack: true,
                whenDefeated: true,
            },
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                controller: RelativePlayer.Self,
                immediateEffect: abilityHelper.immediateEffects.simultaneous([
                    abilityHelper.immediateEffects.giveExperience(),
                    abilityHelper.immediateEffects.forThisPhaseCardEffect({
                        effect: abilityHelper.ongoingEffects.gainKeyword(KeywordName.Sentinel)
                    })
                ])
            }
        });
    }
}