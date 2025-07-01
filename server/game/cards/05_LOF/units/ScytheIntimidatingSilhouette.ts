import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, Trait, WildcardCardType } from '../../../core/Constants';

export default class ScytheIntimidatingSilhouette extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '8496493030',
            internalName: 'scythe#intimidating-silhouette',
        };
    }

    public override setupCardAbilities(card: this) {
        card.addOnAttackAbility({
            title: 'Give another friendly Inquisitor unit +2/+0 for this phase',
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                controller: RelativePlayer.Self,
                cardCondition: (card, context) => card !== context.source && card.hasSomeTrait(Trait.Inquisitor),
                immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                    effect: AbilityHelper.ongoingEffects.modifyStats({ power: 2, hp: 0 })
                }),
            }
        });
    }
}