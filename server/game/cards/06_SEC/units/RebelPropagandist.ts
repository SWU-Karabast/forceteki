import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName, RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class RebelPropagandist extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'rebel-propagandist-id',
            internalName: 'rebel-propagandist',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'Give another friendly unit +1/+0 and Saboteur for this phase',
            when: {
                whenPlayed: true,
                whenDefeated: true,
            },
            targetResolver: {
                controller: RelativePlayer.Self,
                cardTypeFilter: WildcardCardType.Unit,
                cardCondition: (card, context) => card !== context.source,
                immediateEffect: abilityHelper.immediateEffects.forThisPhaseCardEffect({
                    effect: [
                        abilityHelper.ongoingEffects.modifyStats({ power: 1, hp: 0 }),
                        abilityHelper.ongoingEffects.gainKeyword(KeywordName.Saboteur)
                    ]
                }),
            },
        });
    }
}
