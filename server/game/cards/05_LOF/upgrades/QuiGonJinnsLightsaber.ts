import AbilityHelper from '../../../AbilityHelper';
import type { Card } from '../../../core/card/Card';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { TargetMode, Trait } from '../../../core/Constants';
import * as Contract from '../../../core/utils/Contract';

export default class QuiGonJinnsLightsaber extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '3445044882',
            internalName: 'quigon-jinns-lightsaber',
        };
    }

    public override setupCardAbilities() {
        const selectedCards: Card[] = [];

        this.setAttachCondition((card: Card) => !card.hasSomeTrait(Trait.Vehicle) && card.controller === this.controller);

        this.addWhenPlayedAbility({
            title: 'Exhaust any number of units with combined cost 6 or less.',
            optional: true,
            immediateEffect: AbilityHelper.immediateEffects.conditional({
                condition: (context) => context.source.parentCard?.title === 'Qui-Gon Jinn',
                onTrue: AbilityHelper.immediateEffects.selectCard({
                    activePromptTitle: 'Exhaust any number of units with combined cost 6 or less',
                    mode: TargetMode.Unlimited,
                    cardCondition: (card: Card) => card.isUnit() && this.costSum(selectedCards.concat(card)) <= 6,
                    canChooseNoCards: true,
                    innerSystem: AbilityHelper.immediateEffects.exhaust()
                })
            })
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