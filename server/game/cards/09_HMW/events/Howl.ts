import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import type { IAbilityHelper } from '../../../AbilityHelper';
import { WildcardCardType } from '../../../core/Constants';

export default class Howl extends EventCard {
    protected override getImplementationId() {
        return {
            id: '0444555401',
            internalName: 'howl',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Create a Beast token. Return a non-leader unit to its owner\'s hand',
            immediateEffect: AbilityHelper.immediateEffects.sequential([
                AbilityHelper.immediateEffects.createBeast(),
                AbilityHelper.immediateEffects.selectCard({
                    activePromptTitle: 'Return a non-leader unit to its owner\'s hand',
                    cardTypeFilter: WildcardCardType.NonLeaderUnit,
                    immediateEffect: AbilityHelper.immediateEffects.returnToHand()
                }),
            ])
        });
    }
}