import AbilityHelper from '../../../AbilityHelper';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { RelativePlayer, Trait } from '../../../core/Constants';

export default class GrandMoffTarkinOversectorGovernor extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '2912358777',
            internalName: 'grand-moff-tarkin#oversector-governor',
        };
    }

    protected override setupLeaderSideAbilities(card: this) {
        card.addActionAbility({
            title: 'Give an experience token to an Imperial unit',
            cost: [AbilityHelper.costs.abilityActivationResourceCost(1), AbilityHelper.costs.exhaustSelf()],
            targetResolver: {
                controller: RelativePlayer.Self,
                cardCondition: (card) => card.hasSomeTrait(Trait.Imperial),
                immediateEffect: AbilityHelper.immediateEffects.giveExperience()
            }
        });
    }

    protected override setupLeaderUnitSideAbilities(card: this) {
        card.addOnAttackAbility({
            title: 'Give an experience token to another Imperial unit',
            optional: true,
            targetResolver: {
                controller: RelativePlayer.Self,
                cardCondition: (card, context) => card.hasSomeTrait(Trait.Imperial) && card !== context.source,
                immediateEffect: AbilityHelper.immediateEffects.giveExperience()
            }
        });
    }
}
