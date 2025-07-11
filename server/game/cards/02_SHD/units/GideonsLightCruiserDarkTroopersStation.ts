import AbilityHelper from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
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

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar) {
        registrar.addWhenPlayedAbility({
            title: 'If you control Moff Gideon, play a Villainy unit that costs 3 or less from your hand or discard pile for free.',
            targetResolver: {
                controller: RelativePlayer.Self,
                zoneFilter: [ZoneName.Discard, ZoneName.Hand],
                cardCondition: (card) => card.isUnit() && card.hasSomeAspect(Aspect.Villainy) && card.cost <= 3,
                immediateEffect: AbilityHelper.immediateEffects.conditional({
                    condition: (context) => context.player.controlsLeaderUnitOrUpgradeWithTitle('Moff Gideon'),
                    onTrue: AbilityHelper.immediateEffects.playCard((context) => ({
                        playType: context.target.zoneName === ZoneName.Hand ? PlayType.PlayFromHand : PlayType.PlayFromOutOfPlay,
                        playAsType: WildcardCardType.Unit,
                        adjustCost: { costAdjustType: CostAdjustType.Free }
                    })),
                })
            }
        });
    }
}
