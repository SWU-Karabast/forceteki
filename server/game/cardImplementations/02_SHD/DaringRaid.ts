import AbilityHelper from '../../AbilityHelper';
import { EventCard } from '../../core/card/EventCard';

export default class DaringRaid extends EventCard {
    protected override getImplementationId() {
        return {
            id: '7826408293',
            internalName: 'daring-raid',
        };
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'Deal 2 damage to a friendly ground unit and an enemy ground unit',
            targetResolver: {
                immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 2 })
            },
            effect: 'deal 2 damage to {1}',
            effectArgs: (context) => [context.target]
        });
    }
}

DaringRaid.implemented = false;