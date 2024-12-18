import AbilityHelper from '../../../AbilityHelper';
import { CardType } from '../../../core/Constants';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { CostAdjustType } from '../../../core/cost/CostAdjuster';

export default class StrategicAcument extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '2397845395',
            internalName: 'strategic-acumen',
        };
    }

    protected override setupCardAbilities(): void {
        this.addGainActionAbilityTargetingAttached({
            title: 'Play a unit from your hand. It costs 1 less.',
            cost: [
                AbilityHelper.costs.exhaustSelf()
            ],
            targetResolver: {
                cardTypeFilter: CardType.BasicUnit
            },

            immediateEffect: AbilityHelper.immediateEffects.playCardFromHand({
                adjustCost: {
                    costAdjustType: CostAdjustType.Decrease,
                    amount: 1
                }
            })
        });
    }
}

StrategicAcument.implemented = true;