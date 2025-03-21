import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName } from '../../../core/Constants';

export default class AhsokaTanoAlwaysReadyForTrouble extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '7144880397',
            internalName: 'ahsoka-tano#always-ready-for-trouble',
        };
    }

    public override setupCardAbilities () {
        this.addActionAbility({
            title: 'Return to hand',
            cost: AbilityHelper.costs.abilityResourceCost(2),
            immediateEffect: AbilityHelper.immediateEffects.simultaneous([
                AbilityHelper.immediateEffects.returnToHand((context) => ({
                    target: context.source.upgrades
                })),
                AbilityHelper.immediateEffects.returnToHand()
            ])
        });

        this.addConstantAbility({
            title: 'Gain Ambush',
            condition: (context) => {
                const player = context.player;
                const opponent = player.opponent;
                return player.getUnitsInPlay().length < opponent.getUnitsInPlay().length;
            },
            ongoingEffect: AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Ambush)
        });
    }
}
