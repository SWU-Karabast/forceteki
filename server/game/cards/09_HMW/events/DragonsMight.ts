import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import type { IAbilityHelper } from '../../../AbilityHelper';
import { WildcardCardType } from '../../../core/Constants';

export default class DragonsMight extends EventCard {
    protected override getImplementationId() {
        return {
            id: 'dragons-might-id',
            internalName: 'dragons-might',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Defeat a non-leader unit with 4 or less power',
            targetResolver: {
                cardTypeFilter: WildcardCardType.NonLeaderUnit,
                cardCondition: (card) => card.isUnit() && card.getPower() <= 4,
                immediateEffect: abilityHelper.immediateEffects.defeat()
            }
        });
    }
}