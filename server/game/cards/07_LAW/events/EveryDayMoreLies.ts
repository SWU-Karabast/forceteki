import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { EventCard } from '../../../core/card/EventCard';

export default class EveryDayMoreLies extends EventCard {
    protected override getImplementationId () {
        return {
            id: '4380072341',
            internalName: 'every-day-more-lies',
        };
    }

    public override setupCardAbilities (registrar: IEventAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Each player discards a card from their hands',
            immediateEffect: abilityHelper.immediateEffects.discardCardsFromOwnHand((context) => ({
                target: context.game.getPlayers(),
                amount: 1
            }))
        });
    }
}