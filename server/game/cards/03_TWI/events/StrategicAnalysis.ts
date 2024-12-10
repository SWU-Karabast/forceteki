import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';

export default class StrategicAnalysis extends EventCard {
    protected override getImplementationId() {
        return {
            id: '1417180295',
            internalName: 'strategic-analysis',
        };
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'Draw 3 cards',
            immediateEffect: AbilityHelper.immediateEffects.draw({ amount: 3 })
        });
    }
}

StrategicAnalysis.implemented = true;
