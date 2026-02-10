import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { EventCard } from '../../../core/card/EventCard';
import { RelativePlayer, WildcardCardType, ZoneName } from '../../../core/Constants';
import { CostAdjustType } from '../../../core/cost/CostAdjuster';

export default class FromACertainPointOfView extends EventCard {
    protected override getImplementationId() {
        return {
            id: '8408430692',
            internalName: 'from-a-certain-point-of-view',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Play a card from your hand, ignoring its aspect penalties',
            targetResolver: {
                zoneFilter: ZoneName.Hand,
                controller: RelativePlayer.Self,
                // TODO remove cardTypeFilter but fix Choose nothing button before
                cardTypeFilter: WildcardCardType.Playable,
                cardCondition: (card, context) => card !== context.source,
                immediateEffect: abilityHelper.immediateEffects.playCardFromHand({
                    playAsType: WildcardCardType.Any,
                    adjustCost: { costAdjustType: CostAdjustType.IgnoreAllAspects },
                })
            }
        });
    }
}