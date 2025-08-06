import type { IAbilityHelper } from '../../../AbilityHelper';
import type { ILeaderUnitAbilityRegistrar, ILeaderUnitLeaderSideAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { CardType, RelativePlayer, ZoneName } from '../../../core/Constants';
import { CostAdjustType } from '../../../core/cost/CostAdjuster';

export default class BarrissOffeeWeHaveBecomeVillains extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '1184397926',
            internalName: 'barriss-offee#we-have-become-villains',
        };
    }

    protected override setupLeaderSideAbilities(registrar: ILeaderUnitLeaderSideAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addActionAbility({
            title: 'Play an event from your hand. It costs 1 resource less.',
            cost: [AbilityHelper.costs.exhaustSelf(), AbilityHelper.costs.useTheForce()],
            targetResolver: {
                // TODO remove cardTypeFilter but fix Choose nothing button before
                cardTypeFilter: CardType.Event,
                controller: RelativePlayer.Self,
                zoneFilter: ZoneName.Hand,
                immediateEffect: AbilityHelper.immediateEffects.playCardFromHand({
                    adjustCost: { costAdjustType: CostAdjustType.Decrease, amount: 1 },
                    playAsType: CardType.Event,
                })
            }
        });
    }

    protected override setupLeaderUnitSideAbilities(registrar: ILeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addActionAbility({
            title: 'Play an event from your hand. It costs 1 resource less.',
            cost: AbilityHelper.costs.useTheForce(),
            targetResolver: {
                // TODO remove cardTypeFilter but fix Choose nothing button before
                cardTypeFilter: CardType.Event,
                controller: RelativePlayer.Self,
                zoneFilter: ZoneName.Hand,
                immediateEffect: AbilityHelper.immediateEffects.playCardFromHand({
                    adjustCost: { costAdjustType: CostAdjustType.Decrease, amount: 1 },
                    playAsType: CardType.Event,
                })
            }
        });
    }
}
