import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { TargetMode } from '../../../core/Constants';

export default class PursueTheLead extends EventCard {
    protected override getImplementationId() {
        return {
            id: 'pursue-the-lead-id',
            internalName: 'pursue-the-lead',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Choose a player. That player discards a card from their hand. If it costs 3 or less, create a Spy token',
            targetResolver: {
                mode: TargetMode.Player,
                immediateEffect: abilityHelper.immediateEffects.discardCardsFromOwnHand({ amount: 1 }),
            },
            ifYouDo: (ifYouDoContext) => ({
                title: 'If it costs 3 or less, create a Spy token',
                ifYouDoCondition: () => ifYouDoContext.events[0]?.card?.printedCost <= 3,
                immediateEffect: abilityHelper.immediateEffects.createSpy()
            })
        });
    }
}
