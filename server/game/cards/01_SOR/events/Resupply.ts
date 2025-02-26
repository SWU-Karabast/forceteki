import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';

export default class Resupply extends EventCard {
    protected override getImplementationId() {
        return {
            id: '2703877689',
            internalName: 'resupply',
        };
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'Put this event into play as a resource',
            immediateEffect: AbilityHelper.immediateEffects.resourceCard((context) => ({ target: context.source }))
        });
    }
}
