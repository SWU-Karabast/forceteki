import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import type { IAbilityHelper } from '../../../AbilityHelper';
import { WildcardCardType, WildcardZoneName } from '../../../core/Constants';

export default class FoundlingRescue extends EventCard {
    protected override getImplementationId() {
        return {
            id: '2405496593',
            internalName: 'foundling-rescue',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Defeat a unit with 2 or less HP. Create a Mandalorian token.',
            immediateEffect: AbilityHelper.immediateEffects.simultaneous([
                AbilityHelper.immediateEffects.selectCard({
                    activePromptTitle: 'Defeat a unit with 2 or less HP',
                    canChooseNoCards: true,
                    cardTypeFilter: WildcardCardType.Unit,
                    zoneFilter: WildcardZoneName.AnyArena,
                    cardCondition: (card, _) => card.isUnit() && card.remainingHp <= 2,
                    immediateEffect: AbilityHelper.immediateEffects.defeat(),
                }),
                AbilityHelper.immediateEffects.createMandalorian(),
            ])
        });
    }
}