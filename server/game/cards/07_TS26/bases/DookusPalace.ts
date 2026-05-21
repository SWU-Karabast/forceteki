import type { IBaseAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import type { IAbilityHelper } from '../../../AbilityHelper';
import { RelativePlayer, WildcardCardType, ZoneName } from '../../../core/Constants';
import { BaseCard } from '../../../core/card/BaseCard';
import { CostAdjustType } from '../../../core/cost/CostAdjuster';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class DookusPalace extends BaseCard {
    protected override getImplementationId() {
        return {
            id: '4631699773',
            internalName: 'dookus-palace',
        };
    }

    public override setupCardAbilities(registrar: IBaseAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.setEpicActionAbility({
            title: `Play a unit from your hand. It costs ${TextHelper.resource(1)} less for each friendly leader unit.`,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                controller: RelativePlayer.Self,
                zoneFilter: ZoneName.Hand,
                immediateEffect: abilityHelper.immediateEffects.playCardFromHand((context) => ({
                    playAsType: WildcardCardType.Unit,
                    adjustCost: {
                        costAdjustType: CostAdjustType.Decrease,
                        amount: context.player.getArenaUnits({ condition: (c) => c.isLeaderUnit() }).length
                    }
                })),
            }
        });
    }
}
