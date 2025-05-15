import AbilityHelper from '../../../AbilityHelper';
import type { AbilityContext } from '../../../core/ability/AbilityContext';
import type { Card } from '../../../core/card/Card';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { TargetMode, Trait } from '../../../core/Constants';
import type { Player } from '../../../core/Player';
import * as Contract from '../../../core/utils/Contract';

export default class QuiGonJinnsLightsaber extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '3445044882',
            internalName: 'quigon-jinns-lightsaber',
        };
    }

    public override canAttach(targetCard: Card, _context: AbilityContext, controller: Player): boolean {
        return targetCard.isUnit() && !targetCard.hasSomeTrait(Trait.Vehicle) && targetCard.controller === controller;
    }

    public override setupCardAbilities() {
        this.addWhenPlayedAbility({
            title: 'Exhaust any number of units with combined cost 6 or less.',
            optional: true,
            targetResolver: {
                activePromptTitle: 'Exhaust any number of units with combined cost 6 or less',
                mode: TargetMode.Unlimited,
                multiSelectCardCondition: (card, selectedCards) => card.isUnit() && this.costSum(selectedCards.concat(card)) <= 6 && card.exhausted === false,
                immediateEffect: AbilityHelper.immediateEffects.exhaust()
            }
        });
    }

    private costSum(cards: Card[]): number {
        let costSum = 0;
        for (const card of cards) {
            Contract.assertTrue(card.isUnit());
            costSum += card.cost;
        }
        return costSum;
    }
}