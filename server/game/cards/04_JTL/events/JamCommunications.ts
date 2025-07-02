import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';

export default class JamCommunications extends EventCard {
    protected override getImplementationId() {
        return {
            id: '0391050270',
            internalName: 'jam-communications',
        };
    }

    public override setupCardAbilities(card: this) {
        card.setEventAbility({
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
