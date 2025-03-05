import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName, Trait } from '../../../core/Constants';
import type { Card } from '../../../core/card/Card';

export default class RaddusHoldosFinalCommand extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '8779760486',
            internalName: 'raddus#holdos-final-command'
        };
    }

    public override setupCardAbilities() {
        this.addConstantAbility({
            title: 'While you control another resistance card, this unit gains Sentinel',
            condition: (context) => context.player.anyCardsInPlay((card: Card) => card.hasSomeTrait(Trait.Resistance) && card !== context.source),
            matchTarget: (card, context) => card === context.source,
            ongoingEffect: AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Sentinel)
        });
        this.addWhenDefeatedAbility({
            title: 'Deal damage equal to this unit\'s power to an enemy unit.',
            targetResolver: {
                cardCondition: (card, context) => card.isUnit() && card.controller !== context.source.controller,
                immediateEffect: AbilityHelper.immediateEffects.damage((context) => {
                    return { amount: context.source.getPower() };
                })
            }
        });
    }
}
