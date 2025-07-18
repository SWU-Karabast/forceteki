import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import type { IAbilityHelper } from '../../../AbilityHelper';

export default class NoBargain extends EventCard {
    protected override getImplementationId() {
        return {
            id: '7354795397',
            internalName: 'no-bargain'
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Each opponent discards a card from their hand. Draw a card.',
            immediateEffect: AbilityHelper.immediateEffects.simultaneous([
                AbilityHelper.immediateEffects.discardCardsFromOwnHand((context) => ({ target: context.player.opponent, amount: 1 })),
                AbilityHelper.immediateEffects.draw((context) => ({ target: context.player }))
            ]),
        });
    }
}
