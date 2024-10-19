import { EventCard } from '../../../core/card/EventCard';

export default class Outflank extends EventCard {
    protected override getImplementationId() {
        return {
            id: '0802973415',
            internalName: 'outflank',
        };
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'Attack with a unit',
            initiateAttack: {},
            then: {
                title: 'Attack with another unit',
                initiateAttack: {}
            }
        });
    }
}

Outflank.implemented = true;
