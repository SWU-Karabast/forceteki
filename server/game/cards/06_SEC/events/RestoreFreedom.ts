import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { Aspect, RelativePlayer, WildcardCardType, ZoneName } from '../../../core/Constants';
import { CostAdjustType } from '../../../core/cost/CostAdjuster';

export default class RestoreFreedom extends EventCard {
    protected override getImplementationId() {
        return {
            id: 'restore-freedom-id',
            internalName: 'restore-freedom',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Play a unit from your hand. It costs 1 resource less for each Heroism aspect icon among friendly units.',
            targetResolver: {
                // TODO remove cardTypeFilter but fix Choose nothing button before
                cardTypeFilter: WildcardCardType.Unit,
                zoneFilter: ZoneName.Hand,
                controller: RelativePlayer.Self,
                immediateEffect: AbilityHelper.immediateEffects.playCardFromHand((context) => {
                    const heroismAspectCount = context.player.getArenaUnits({})
                        .map((x) => x.aspects)
                        .flat()
                        .filter((x) => x === Aspect.Heroism).length;

                    return ({
                        adjustCost: {
                            costAdjustType: CostAdjustType.Decrease,
                            amount: Math.max(0, heroismAspectCount)
                        },
                        playAsType: WildcardCardType.Unit
                    });
                }),
            }
        });
    }
}