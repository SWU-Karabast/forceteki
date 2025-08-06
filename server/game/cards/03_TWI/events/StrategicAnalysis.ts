import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';

export default class StrategicAnalysis extends EventCard {
    protected override getImplementationId() {
        return {
            id: '1417180295',
            internalName: 'strategic-analysis',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Draw 3 cards',
            immediateEffect: AbilityHelper.immediateEffects.draw({ amount: 3 })
        });
    }
}
