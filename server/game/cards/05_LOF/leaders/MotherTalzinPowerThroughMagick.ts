import AbilityHelper from '../../../AbilityHelper';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { WildcardCardType } from '../../../core/Constants';

export default class MotherTalzinPowerThroughMagick extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '2520636620',
            internalName: 'mother-talzin#power-through-magick',
        };
    }

    protected override setupLeaderSideAbilities(card: this) {
        card.addActionAbility({
            title: 'Give a unit -1/-1 for this phase',
            cost: [
                AbilityHelper.costs.exhaustSelf(),
                AbilityHelper.costs.useTheForce()
            ],
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                    effect: AbilityHelper.ongoingEffects.modifyStats({ power: -1, hp: -1 }),
                })
            }
        });
    }

    protected override setupLeaderUnitSideAbilities(card: this) {
        card.addOnAttackAbility({
            title: 'Give a unit -1/-1 for this phase',
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                    effect: AbilityHelper.ongoingEffects.modifyStats({ power: -1, hp: -1 }),
                })
            }
        });
    }
}