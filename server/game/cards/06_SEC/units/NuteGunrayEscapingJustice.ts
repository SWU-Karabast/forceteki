import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName, RelativePlayer, Trait, WildcardCardType } from '../../../core/Constants';

export default class NuteGunrayEscapingJustice extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '0296782712',
            internalName: 'nute-gunray#escaping-justice',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'You may give another friendly Official unit Sentinel for this phase',
            optional: true,
            when: {
                onAttack: true,
                whenPlayed: true,
            },
            targetResolver: {
                controller: RelativePlayer.Self,
                cardTypeFilter: WildcardCardType.Unit,
                cardCondition: (card, context) => card.hasSomeTrait(Trait.Official) && card !== context.source,
                immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                    effect: AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Sentinel)
                })
            }
        });
    }
}