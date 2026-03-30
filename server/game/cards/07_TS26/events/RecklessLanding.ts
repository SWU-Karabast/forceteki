import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { EventCard } from '../../../core/card/EventCard';
import { RelativePlayer, WildcardCardType, ZoneName } from '../../../core/Constants';
import { CostAdjustType } from '../../../core/cost/CostAdjuster';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class RecklessLanding extends EventCard {
    protected override getImplementationId() {
        return {
            id: 'reckless-landing-id',
            internalName: 'reckless-landing',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper): void {
        registrar.setEventAbility({
            title: `Play a unit from your hand. It costs ${TextHelper.resource(4)} less. Deal 4 damage to it.`,
            cannotTargetFirst: true,
            targetResolver: {
                zoneFilter: ZoneName.Hand,
                controller: RelativePlayer.Self,
                canChooseNoCards: true,
                immediateEffect: AbilityHelper.immediateEffects.sequential([
                    AbilityHelper.immediateEffects.playCardFromHand({
                        adjustCost: { costAdjustType: CostAdjustType.Decrease, amount: 4 },
                        playAsType: WildcardCardType.Unit
                    }),
                    AbilityHelper.immediateEffects.damage({
                        amount: 4,
                    })
                ]),
            },
        });
    }
}
