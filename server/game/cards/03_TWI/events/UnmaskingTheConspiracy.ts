import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';

export default class UnmaskingTheConspirancy extends EventCard {
    protected override getImplementationId() {
        return {
            id: '0959549331',
            internalName: 'unmasking-the-conspiracy',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar) {
        registrar.setEventAbility({
            title: 'Discard a card from your hand. If you do, look at your opponent\'s hand and discard a card from it',
            immediateEffect: AbilityHelper.immediateEffects.discardCardsFromOwnHand((context) => ({
                target: context.player,
                amount: 1
            })),
            ifYouDo: {
                title: 'Look at your opponent\'s hand and discard a card from it',
                immediateEffect: AbilityHelper.immediateEffects.lookAtAndSelectCard((context) => ({
                    target: context.player.opponent.hand,
                    immediateEffect: AbilityHelper.immediateEffects.discardSpecificCard()
                }))
            },
        });
    }
}
