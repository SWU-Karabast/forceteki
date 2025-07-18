import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import type { IAbilityHelper } from '../../../AbilityHelper';
import { PhaseName, RelativePlayer, WildcardCardType, ZoneName } from '../../../core/Constants';
import { CostAdjustType } from '../../../core/cost/CostAdjuster';

export default class SneakAttack extends EventCard {
    protected override getImplementationId() {
        return {
            id: '3426168686',
            internalName: 'sneak-attack'
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Play a unit from your hand. It costs 3 less and enters play ready. At the start of the regroup phase, defeat it.',
            cannotTargetFirst: true,
            targetResolver: {
                zoneFilter: ZoneName.Hand,
                controller: RelativePlayer.Self,
                immediateEffect: AbilityHelper.immediateEffects.playCardFromHand({
                    entersReady: true,
                    adjustCost: { costAdjustType: CostAdjustType.Decrease, amount: 3 },
                    playAsType: WildcardCardType.Unit
                }),
            },
            ifYouDo: (ifYouDoContext) => ({
                title: 'At the start of the regroup phase, defeat it.',
                immediateEffect: AbilityHelper.immediateEffects.delayedCardEffect({
                    title: 'Defeat it.',
                    target: ifYouDoContext.events[0].card,
                    when: {
                        onPhaseStarted: (context) => context.phase === PhaseName.Regroup
                    },
                    immediateEffect: AbilityHelper.immediateEffects.defeat()
                })
            })
        });
    }
}
