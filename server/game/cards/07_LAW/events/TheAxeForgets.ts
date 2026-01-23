import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { EventCard } from '../../../core/card/EventCard';

export default class TheAxeForgets extends EventCard {
    protected override getImplementationId() {
        return {
            id: '2505117809',
            internalName: 'the-axe-forgets',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Return a non-leader unit that costs 3 or less to its owner\'s hand',
            targetResolver: {
                cardCondition: (card) => card.isNonLeaderUnit() && card.cost <= 3,
                immediateEffect: abilityHelper.immediateEffects.returnToHand(),
            }
        });
    }
}