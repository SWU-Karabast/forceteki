import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName, Trait, WildcardCardType } from '../../../core/Constants';

export default class RaddusHoldosFinalCommand extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '8779760486',
            internalName: 'raddus#holdos-final-command'
        };
    }

    public override setupCardAbilities(card: this) {
        card.addConstantAbility({
            title: 'While you control another resistance card, this unit gains Sentinel',
            condition: (context) => context.player.controlsCardWithTrait(Trait.Resistance, false, context.source),
            matchTarget: (card, context) => card === context.source,
            ongoingEffect: AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Sentinel)
        });
        card.addWhenDefeatedAbility({
            title: 'Deal damage equal to this unit\'s power to an enemy unit.',
            targetResolver: {
                cardCondition: (card, context) => card.controller !== context.player,
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.damage((context) => ({
                    amount: context.event.lastKnownInformation.power
                }))
            }
        });
    }
}
