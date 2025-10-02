import type { IAbilityHelper } from '../../../AbilityHelper';
import type { ILeaderUnitAbilityRegistrar, ILeaderUnitLeaderSideAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { EffectName, RelativePlayer, WildcardCardType, WildcardZoneName, ZoneName } from '../../../core/Constants';
import { CostAdjustType } from '../../../core/cost/CostAdjuster';
import { OngoingEffectBuilder } from '../../../core/ongoingEffect/OngoingEffectBuilder';

export default class DJNeedALift extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'dj#need-a-lift-id',
            internalName: 'dj#need-a-lift'
        };
    }

    protected override setupLeaderSideAbilities(
        registrar: ILeaderUnitLeaderSideAbilityRegistrar,
        AbilityHelper: IAbilityHelper
    ) {
        registrar.addActionAbility({
            title: 'Choose a friendly unit to capture a unit you play from your hand',
            targetResolvers: {
                friendlyUnit: {
                    controller: RelativePlayer.Self,
                    cardTypeFilter: WildcardCardType.Unit,
                    zoneFilter: WildcardZoneName.AnyArena,
                },
                unitInHand: {
                    activePromptTitle: (context) => `Choose a unit in your hand to play for 1 Resource less. ${context.targets.friendlyUnit.title} captures it.`,
                    dependsOn: 'friendlyUnit',
                    zoneFilter: ZoneName.Hand,
                    controller: RelativePlayer.Self,
                    immediateEffect: AbilityHelper.immediateEffects.sequential((context) => ([
                        AbilityHelper.immediateEffects.playCardFromHand({
                            adjustCost: { costAdjustType: CostAdjustType.Decrease, amount: 1 },
                            playAsType: WildcardCardType.Unit,
                        }),
                        AbilityHelper.immediateEffects.capture({
                            captor: context.targets.friendlyUnit
                        })
                    ]))
                }
            }
        });
    }

    protected override setupLeaderUnitSideAbilities(
        registrar: ILeaderUnitAbilityRegistrar,
        AbilityHelper: IAbilityHelper
    ) {
        registrar.addConstantAbility({
            title: 'Each token unit you create enters play ready.',
            targetController: RelativePlayer.Self,
            ongoingEffect: OngoingEffectBuilder.player.static(EffectName.RescuedUnitsEnterPlayReady)
        });
    }
}