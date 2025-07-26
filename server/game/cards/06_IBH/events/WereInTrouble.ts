import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { WildcardCardType } from '../../../core/Constants';
import { type IAbilityHelper } from '../../../AbilityHelper';

export default class WereInTrouble extends EventCard {
    protected override getImplementationId () {
        return {
            id: '7524197668',
            internalName: 'were-in-trouble',
        };
    }

    public override setupCardAbilities (registrar: IEventAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Deal 3 damage to a unit',
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: abilityHelper.immediateEffects.damage({ amount: 3 }),
            }
        });
    }
}