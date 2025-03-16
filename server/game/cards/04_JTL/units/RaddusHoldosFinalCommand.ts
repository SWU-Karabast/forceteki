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

    public override setupCardAbilities() {
        this.addConstantAbility({
            title: 'While you control another resistance card, this unit gains Sentinel',
            condition: (context) => context.player.hasSomeArenaCard({
                trait: Trait.Resistance,
                otherThan: context.source
            }) || context.player.leader.hasSomeTrait(Trait.Resistance),
            matchTarget: (card, context) => card === context.source,
            ongoingEffect: AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Sentinel)
        });
        this.addWhenDefeatedAbility({
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
