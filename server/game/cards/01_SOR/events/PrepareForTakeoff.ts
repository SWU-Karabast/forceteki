import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import type { IAbilityHelper } from '../../../AbilityHelper';
import { TargetMode, Trait } from '../../../core/Constants';

export default class PrepareForTakeoff extends EventCard {
    protected override getImplementationId() {
        return {
            id: '3974134277',
            internalName: 'prepare-for-takeoff'
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Search the top 8 cards for up to 2 Vehicle units, reveal them, and draw them',
            immediateEffect: AbilityHelper.immediateEffects.deckSearch({
                targetMode: TargetMode.UpTo,
                selectCount: 2,
                searchCount: 8,
                cardCondition: (card) => card.hasSomeTrait(Trait.Vehicle),
                selectedCardsImmediateEffect: AbilityHelper.immediateEffects.drawSpecificCard()
            })
        });
    }
}
