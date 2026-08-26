import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName, TargetMode, WildcardCardType } from '../../../core/Constants';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class TeekaYoureInLuck extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'teeka#youre-in-luck-id',
            internalName: 'teeka#youre-in-luck',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: `Give a unit ${TextHelper.Sentinel} for this phase or a unit loses ${TextHelper.Sentinel} for this phase`,
            targetResolver: {
                mode: TargetMode.Select,
                choices: {
                    [`Give a unit ${TextHelper.Sentinel} for this phase`]: AbilityHelper.immediateEffects.selectCard({
                        cardTypeFilter: WildcardCardType.Unit,
                        immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                            effect: AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Sentinel)
                        })
                    }),
                    [`A unit loses ${TextHelper.Sentinel} for this phase`]: AbilityHelper.immediateEffects.selectCard({
                        cardTypeFilter: WildcardCardType.Unit,
                        immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                            effect: AbilityHelper.ongoingEffects.loseKeyword(KeywordName.Sentinel)
                        })
                    }),
                }
            }
        });
    }
}