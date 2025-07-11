import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';

export default class TrustYourInstincts extends EventCard {
    protected override getImplementationId() {
        return {
            id: '1876907238',
            internalName: 'trust-your-instincts',
        };
    }

    protected override setupCardAbilities(registrar: IEventAbilityRegistrar) {
        registrar.setEventAbility({
            title: 'Use the Force to attack with a unit and give +2/+0 and deal combat damage first',
            immediateEffect: AbilityHelper.immediateEffects.useTheForce(),
            ifYouDo: {
                title: 'Attack with a unit. It gets +2/+0 and deals combat damage before defender',
                initiateAttack: {
                    attackerCondition: (card, context) => card.controller === context.player,
                    attackerLastingEffects: [
                        { effect: AbilityHelper.ongoingEffects.modifyStats({ power: 2, hp: 0 }) },
                        { effect: AbilityHelper.ongoingEffects.dealsDamageBeforeDefender() },
                    ]
                }
            }
        });
    }
}