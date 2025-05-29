import AbilityHelper from '../../../AbilityHelper';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { RelativePlayer, Trait, WildcardCardType, ZoneName } from '../../../core/Constants';
import { CostAdjustType } from '../../../core/cost/CostAdjuster';

export default class AdmiralPiettCommandingTheArmada extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '4030832630',
            internalName: 'admiral-piett#commanding-the-armada',
        };
    }

    protected override setupLeaderSideAbilities() {
        this.addActionAbility({
            title: 'Play a Capital Ship unit from your hand. It costs 1 resource less',
            cost: AbilityHelper.costs.exhaustSelf(),
            targetResolver: {
                activePromptTitle: 'Choose a Capital Ship',
                cardCondition: (card) => card.hasSomeTrait(Trait.CapitalShip),
                controller: RelativePlayer.Self,
                zoneFilter: ZoneName.Hand,
                immediateEffect: AbilityHelper.immediateEffects.playCardFromHand({
                    adjustCost: { costAdjustType: CostAdjustType.Decrease, amount: 1 },
                    playAsType: WildcardCardType.Unit,
                }),
            }
        });
    }

    protected override setupLeaderUnitSideAbilities() {
        this.addConstantAbility({
            title: 'Play a Capital Ship unit from your hand. It costs 2 resources less',
            targetController: RelativePlayer.Self,
            ongoingEffect: AbilityHelper.ongoingEffects.decreaseCost({
                match: (card) => card.hasSomeTrait(Trait.CapitalShip),
                cardTypeFilter: WildcardCardType.Unit,
                amount: 2
            })
        });
    }
}


