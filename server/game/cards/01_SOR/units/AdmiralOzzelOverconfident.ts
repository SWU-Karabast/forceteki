import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { CardType, Location, Trait, RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class AdmiralOzzelOverconfident extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '8117080217',
            internalName: 'admiral-ozzel#overconfident'
        };
    }

    public override setupCardAbilities() {
        this.addActionAbility({
            title: 'Play an Imperial unit from your hand. It enters play ready',
            cost: AbilityHelper.costs.exhaustSelf(),
            immediateEffect: AbilityHelper.immediateEffects.sequential([
                AbilityHelper.immediateEffects.selectCard({
                    activePromptTitle: 'Play an Imperial unit from your hand. It enters play ready',
                    cardTypeFilter: CardType.BasicUnit,
                    locationFilter: Location.Hand,
                    optional: true,
                    cardCondition: (card) => card.hasSomeTrait(Trait.Imperial),
                    innerSystem: AbilityHelper.immediateEffects.playCard({entersReady:true})
                }),
                AbilityHelper.immediateEffects.selectCard({
                    activePromptTitle: 'Ready a unit',
                    player: RelativePlayer.Opponent,
                    optional: true,
                    cardTypeFilter: WildcardCardType.Unit,
                    innerSystem: AbilityHelper.immediateEffects.ready()
                })
            ])
        });
    }
}

AdmiralOzzelOverconfident.implemented = true;