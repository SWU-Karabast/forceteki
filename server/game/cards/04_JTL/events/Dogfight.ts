import { EventCard } from '../../../core/card/EventCard';

export default class Dogfight extends EventCard {
    protected override getImplementationId() {
        return {
            id: '3436482269',
            internalName: 'dogfight',
        };
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'Attack with a unit, even if it\'s exhausted. That unit can\'t attack bases for this attack.',
            initiateAttack: {
                targetCondition: (target) => target.isUnit(),
                allowExhaustedAttacker: true
            }
        });
    }
}
