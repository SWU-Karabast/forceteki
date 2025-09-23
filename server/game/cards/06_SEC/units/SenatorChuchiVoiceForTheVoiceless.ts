import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName, RelativePlayer, Trait, WildcardCardType } from '../../../core/Constants';

export default class SenatorChuchiVoiceForTheVoiceless extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: 'senator-chuchi#voice-for-the-voiceless-id',
            internalName: 'senator-chuchi#voice-for-the-voiceless',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addOnAttackAbility({
            title: 'Give another friendly Official unit Restore 2 for this phase',
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                controller: RelativePlayer.Self,
                cardCondition: (card, context) => card !== context.source && card.hasSomeTrait(Trait.Official),
                immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                    effect: AbilityHelper.ongoingEffects.gainKeyword({ keyword: KeywordName.Restore, amount: 2 })
                })
            }
        });
    }
}