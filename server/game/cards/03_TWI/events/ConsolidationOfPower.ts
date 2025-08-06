import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { RelativePlayer, TargetMode, WildcardCardType, WildcardZoneName, ZoneName } from '../../../core/Constants';
import { CostAdjustType } from '../../../core/cost/CostAdjuster';

export default class ConsolidationOfPower extends EventCard {
    protected override getImplementationId() {
        return {
            id: '4895747419',
            internalName: 'consolidation-of-power',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Choose any number of friendly units. You may play a unit from your hand if its cost is less than or equal to the combined power of the chosen units for free. Then, defeat the chosen units.',
            targetResolvers: {
                friendlyUnits: {
                    mode: TargetMode.Unlimited,
                    canChooseNoCards: true,
                    cardTypeFilter: WildcardCardType.Unit,
                    zoneFilter: WildcardZoneName.AnyArena,
                    controller: RelativePlayer.Self,
                },
                playUnit: {
                    optional: true,
                    dependsOn: 'friendlyUnits',
                    mode: TargetMode.Single,
                    controller: RelativePlayer.Self,
                    cardCondition: (_card, context) => context.targets.playUnit.cost <= context.targets.friendlyUnits.reduce((sum, card) => sum + card.getPower(), 0),
                    zoneFilter: ZoneName.Hand,
                    immediateEffect: AbilityHelper.immediateEffects.playCardFromHand({
                        adjustCost: { costAdjustType: CostAdjustType.Free },
                        playAsType: WildcardCardType.Unit
                    })
                }
            },
            then: (thenContext) => ({
                title: 'Defeat the chosen units.',
                immediateEffect: AbilityHelper.immediateEffects.defeat({
                    target: thenContext.targets.friendlyUnits,
                })
            })
        });
    }
}
