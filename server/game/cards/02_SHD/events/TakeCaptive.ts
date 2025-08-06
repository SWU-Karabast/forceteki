import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { RelativePlayer, WildcardCardType, WildcardZoneName } from '../../../core/Constants';

export default class TakeCaptive extends EventCard {
    protected override getImplementationId() {
        return {
            id: '3765912000',
            internalName: 'take-captive',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'A friendly unit captures an enemy non-leader unit in the same arena',
            targetResolvers: {
                friendlyUnit: {
                    zoneFilter: WildcardZoneName.AnyArena,
                    controller: RelativePlayer.Self,
                    cardTypeFilter: WildcardCardType.Unit
                },
                captureUnit: {
                    dependsOn: 'friendlyUnit',
                    controller: RelativePlayer.Opponent,
                    cardCondition: (card, context) => card.zoneName === context.targets['friendlyUnit'].zoneName,
                    immediateEffect: AbilityHelper.immediateEffects.capture((context) => ({ captor: context.targets['friendlyUnit'] }))
                }
            }
        });
    }
}
