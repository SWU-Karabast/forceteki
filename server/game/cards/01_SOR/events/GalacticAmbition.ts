import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { Aspect, RelativePlayer, WildcardCardType, ZoneName } from '../../../core/Constants';
import type { IAbilityHelper } from '../../../AbilityHelper';
import { CostAdjustType } from '../../../core/cost/CostAdjuster';

export default class GalacticAmbition extends EventCard {
    protected override getImplementationId () {
        return {
            id: '5494760041',
            internalName: 'galactic-ambition',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Play a non-Heroism unit from your hand for free. if you do, deal damage to your base equal to its cost',
            targetResolver: {
                controller: RelativePlayer.Self,
                zoneFilter: ZoneName.Hand,
                cardCondition: (card) => !card.hasSomeAspect(Aspect.Heroism),
                immediateEffect: AbilityHelper.immediateEffects.playCardFromHand({
                    adjustCost: { costAdjustType: CostAdjustType.Free },
                    playAsType: WildcardCardType.Unit,
                })
            },
            ifYouDo: (ifYouDoContext) => ({
                title: 'Deal damage to your base equal to the played unit\'s cost',
                immediateEffect: AbilityHelper.immediateEffects.damage({
                    target: ifYouDoContext.player.base,
                    amount: ifYouDoContext.target.printedCost
                })
            })
        });
    }
}
