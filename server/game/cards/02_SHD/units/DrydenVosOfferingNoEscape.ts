import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { ZoneName } from '../../../core/Constants';
import { CostAdjustType } from '../../../core/cost/CostAdjuster';

export default class DrydenVos extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '0598830553',
            internalName: 'dryden-vos#offering-no-escape',
        };
    }

    private checkIfTargetIsGuardedByControlledUnit(card, context) {
        return card.zoneName === ZoneName.Capture && card.zone.captor.controller === context.player;
    }

    public override setupCardAbilities() {
        this.addWhenPlayedAbility({
            title: 'Choose a captured card guarded by a unit you control. You may play it for free under your control.',
            targetResolver: {
                zoneFilter: [ZoneName.Capture],
                cardCondition: (card, context) => this.checkIfTargetIsGuardedByControlledUnit(card, context),
                immediateEffect: AbilityHelper.immediateEffects.playCardFromOutOfPlay({
                    adjustCost: { costAdjustType: CostAdjustType.Free },
                    canPlayFromAnyZone: true
                }),
            }
        });
    }
}
