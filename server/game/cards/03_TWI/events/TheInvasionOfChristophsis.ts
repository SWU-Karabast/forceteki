import { EventCard } from '../../../core/card/EventCard';
import AbilityHelper from '../../../AbilityHelper';

export default class TheInvasionofChristophsis extends EventCard {
    protected override getImplementationId() {
        return {
            id: '2565830105',
            internalName: 'the-invasion-of-christophsis'
        };
    }

    public override setupCardAbilities(card: this) {
        card.setEventAbility({
            title: 'Defeat each unit that your opponent controls.',
            immediateEffect: AbilityHelper.immediateEffects.defeat((context) => ({ target: context.player.opponent.getArenaUnits() }))
        });
    }
}
