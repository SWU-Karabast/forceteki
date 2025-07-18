import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';

export default class KeepFighting extends EventCard {
    protected override getImplementationId () {
        return {
            id: '3058784025',
            internalName: 'keep-fighting',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Ready a unit with 3 or less power',
            targetResolver: {
                cardCondition: (card) => card.isUnit() && card.getPower() <= 3,
                immediateEffect: AbilityHelper.immediateEffects.ready(),
            }
        });
    }
}
