import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { WildcardCardType } from '../../../core/Constants';

export default class DrainEssence extends EventCard {
    protected override getImplementationId() {
        return {
            id: '5083905745',
            internalName: 'drain-essence'
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar) {
        registrar.setEventAbility({
            title: 'Deal 2 damage to a unit. The Force is with you.',
            immediateEffect: AbilityHelper.immediateEffects.simultaneous([
                AbilityHelper.immediateEffects.selectCard({
                    activePromptTitle: 'Select a unit to deal 2 damage to',
                    cardTypeFilter: WildcardCardType.Unit,
                    immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 2 })
                }),
                AbilityHelper.immediateEffects.theForceIsWithYou()
            ])
        });
    }
}