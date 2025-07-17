import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';

export default class TheChaosOfWar extends EventCard {
    protected override getImplementationId() {
        return {
            id: '8090818642',
            internalName: 'the-chaos-of-war',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Deal damage to each player’s base equal to the number of cards in that player’s hand.',
            immediateEffect: AbilityHelper.immediateEffects.simultaneous([
                AbilityHelper.immediateEffects.damage((context) => ({
                    amount: context.player.opponent.hand.length,
                    target: context.player.opponent.base,
                })),
                AbilityHelper.immediateEffects.damage((context) => ({
                    amount: context.player.hand.length,
                    target: context.player.base,
                })),
            ]),
        });
    }
}
