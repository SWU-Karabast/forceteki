import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { PlayType } from '../../../core/Constants';
import { CostAdjustType } from '../../../core/cost/CostAdjuster';

export default class StolenLandspeeder extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '7642980906',
            internalName: 'stolen-landspeeder'
        };
    }

    public override setupCardAbilities() {
        this.addTriggeredAbility({
            title: 'An opponent takes control of it',
            when: {
                whenPlayed: true,
            },
            immediateEffect: AbilityHelper.immediateEffects.conditional({
                condition: (context) => context.event.playType === PlayType.PlayFromHand,
                onTrue: AbilityHelper.immediateEffects.takeControlOfUnit((context) => ({
                    newController: context.player.opponent
                })),
            })
        });

        this.addBountyAbility({
            title: 'If you own this unit, play it from your discard pile for free and give an Experience token to it',
            immediateEffect: AbilityHelper.immediateEffects.conditional({
                condition: (context) => context.source.owner === context.player,
                onTrue: AbilityHelper.immediateEffects.sequential([
                    AbilityHelper.immediateEffects.playCardFromOutOfPlay({
                        adjustCost: { costAdjustType: CostAdjustType.Free },
                    }),
                    AbilityHelper.immediateEffects.giveExperience(),
                ]),
            })
        });
    }
}
