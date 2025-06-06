import { NonLeaderUnitCard } from '../../../../../server/game/core/card/NonLeaderUnitCard';
import AbilityHelper from '../../../AbilityHelper';
import { RelativePlayer, Trait, WildcardCardType } from '../../../core/Constants';

export default class AsajjVentressHardenYourHeart extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '5227991792',
            internalName: 'asajj-ventress#harden-your-heart',
        };
    }

    public override setupCardAbilities() {
        this.addTriggeredAbility({
            title: 'Give another friendly Force unit +2/+0 for this phase',
            when: {
                whenPlayed: true,
                onAttack: true,
            },
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                controller: RelativePlayer.Self,
                cardCondition: (card, context) => card.hasSomeTrait(Trait.Force) && card !== context.source,
                immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                    effect: AbilityHelper.ongoingEffects.modifyStats({ power: 2, hp: 0 }),
                })
            }
        });
    }
}