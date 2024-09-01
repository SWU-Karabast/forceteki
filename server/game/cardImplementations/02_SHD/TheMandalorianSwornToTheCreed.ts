import AbilityHelper from '../../AbilityHelper';
import { LeaderUnitCard } from '../../core/card/LeaderUnitCard';

export default class TheMandalorianSwornToTheCreed extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '9005139831',
            internalName: 'the-mandalorian#sworn-to-the-creed',
        };
    }
}

TheMandalorianSwornToTheCreed.implemented = true;