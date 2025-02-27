import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';

export default class FellTheDragon extends EventCard {
    protected override getImplementationId () {
        return {
            id: '3329959260',
            internalName: 'fell-the-dragon',
        };
    }

    public override setupCardAbilities () {
        this.setEventAbility({
            title: 'Defeat a non-leader unit with 5 or more power',
            targetResolver: {
                cardCondition: (card, _) => card.isNonLeaderUnit() && card.getPower() >= 5,
                immediateEffect: AbilityHelper.immediateEffects.defeat(),
            }
        });
    }
}
