import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';

export default class SmugglersAid extends EventCard {
    protected override getImplementationId() {
        return {
            id: '0866321455',
            internalName: 'smugglers-aid',
        };
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'Heal 3 damage from your base',
            immediateEffect: AbilityHelper.immediateEffects.heal((context) => ({
                amount: 3,
                target: context.source.controller.base
            }))
        });
    }
}

SmugglersAid.implemented = true;