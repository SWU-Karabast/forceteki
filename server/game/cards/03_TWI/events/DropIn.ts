import { EventCard } from '../../../core/card/EventCard';
import AbilityHelper from '../../../AbilityHelper';

export default class DropIn extends EventCard {
    protected override getImplementationId() {
        return {
            id: '5074877594',
            internalName: 'drop-in',
        };
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'Create 2 Clone Trooper tokens',
            immediateEffect: AbilityHelper.immediateEffects.createCloneTrooper(
                (context) => ({ amount: 2, target: context.source.controller })
            )
        });
    }
}

DropIn.implemented = true;
