import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';

export default class RazeToRuin extends EventCard {
    protected override getImplementationId() {
        return {
            id: 'raze-to-ruin-id',
            internalName: 'raze-to-ruin',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Each player discards all but 3 cards from their hand',
            immediateEffect: AbilityHelper.immediateEffects.discardCardsFromOwnHand((context) => ({
                target: context.game.getPlayers(),
                amount: (player) => Math.max(0, player.hand.length - 3)
            }))
        });
    }
}
