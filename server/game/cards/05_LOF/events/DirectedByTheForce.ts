import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { RelativePlayer, WildcardCardType, ZoneName } from '../../../core/Constants';

export default class DirectedByTheForce extends EventCard {
    protected override getImplementationId() {
        return {
            id: '7078597376',
            internalName: 'directed-by-the-force',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Gain the Force and you may play a unit from your hand',
            immediateEffect: AbilityHelper.immediateEffects.simultaneous([
                AbilityHelper.immediateEffects.theForceIsWithYou(),
                AbilityHelper.immediateEffects.selectCard({
                    controller: RelativePlayer.Self,
                    zoneFilter: ZoneName.Hand,
                    optional: true,
                    effect: 'choose a unit to play',
                    immediateEffect: AbilityHelper.immediateEffects.playCardFromHand({
                        playAsType: WildcardCardType.Unit
                    }),
                }),
            ]),
        });
    }
}
