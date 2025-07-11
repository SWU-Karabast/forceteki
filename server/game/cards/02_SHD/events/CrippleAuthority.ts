import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';

export default class CrippleAuthority extends EventCard {
    protected override getImplementationId() {
        return {
            id: '3228620062',
            internalName: 'cripple-authority',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar) {
        registrar.setEventAbility({
            title: 'Draw a card. Each opponent who controls more resources than you discards a card from their hand',
            immediateEffect: AbilityHelper.immediateEffects.simultaneous(
                (context) => [
                    AbilityHelper.immediateEffects.draw({
                        target: context.player,
                        amount: 1
                    }),
                    AbilityHelper.immediateEffects.conditional({
                        condition: context.player.opponent.resources.length > context.player.resources.length,
                        onTrue: AbilityHelper.immediateEffects.discardCardsFromOwnHand({
                            target: context.player.opponent,
                            amount: 1
                        }),
                    })
                ]
            )
        });
    }
}
