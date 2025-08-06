import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';

export default class JamCommunications extends EventCard {
    protected override getImplementationId() {
        return {
            id: '0391050270',
            internalName: 'jam-communications',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Look at an opponent\'s hand and discard an event from it',
            immediateEffect: AbilityHelper.immediateEffects.lookAtAndSelectCard((context) => ({
                target: context.player.opponent.hand,
                canChooseFewer: false,
                immediateEffect: AbilityHelper.immediateEffects.discardSpecificCard(),
                cardCondition: (card) => card.isEvent()
            }))
        });
    }
}
