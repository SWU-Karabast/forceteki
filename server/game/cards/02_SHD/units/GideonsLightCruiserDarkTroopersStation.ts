import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Aspect, PlayType, RelativePlayer, WildcardCardType, ZoneName } from '../../../core/Constants';
import { CostAdjustType } from '../../../core/cost/CostAdjuster';

export default class GideonsLightCruiserDarkTroopersStation extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '5351496853',
            internalName: 'gideons-light-cruiser#dark-troopers-station',
        };
    }

    public override setupCardAbilities() {
        this.addWhenPlayedAbility({
            title: 'If you control Moff Gideon, play a Villainy unit that costs 3 or less from your hand or discard pile for free.',
            targetResolver: {
                controller: RelativePlayer.Self,
                zoneFilter: [ZoneName.Discard, ZoneName.Hand],
                cardTypeFilter: WildcardCardType.Unit,
                cardCondition: (card) => card.isUnit() && card.hasSomeAspect(Aspect.Villainy) && card.cost <= 3,
                immediateEffect: AbilityHelper.immediateEffects.conditional({
                    condition: (context) => context.source.controller.controlsLeaderOrUnitWithTitle('Moff Gideon'),
                    onTrue: AbilityHelper.immediateEffects.playCard((context) => ({
                        playType: context.target.zoneName === ZoneName.Hand ? PlayType.PlayFromHand : PlayType.PlayFromOutOfPlay,
                        adjustCost: { costAdjustType: CostAdjustType.Free }
                    })),
                    onFalse: AbilityHelper.immediateEffects.noAction(),
                })
            }
        });
    }
}

GideonsLightCruiserDarkTroopersStation.implemented = true;
