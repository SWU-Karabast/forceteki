import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { Trait, WildcardCardType } from '../../../core/Constants';

export default class ContemptForCulture extends EventCard {
    protected override getImplementationId() {
        return {
            id: 'contempt-for-culture-id',
            internalName: 'contempt-for-culture',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Deal 2 damage to a non-Vehicle unit. Create a Spy token.',
            immediateEffect: abilityHelper.immediateEffects.simultaneous([
                abilityHelper.immediateEffects.createSpy(),
                abilityHelper.immediateEffects.selectCard({
                    cardTypeFilter: WildcardCardType.Unit,
                    cardCondition: (card) => !card.hasSomeTrait(Trait.Vehicle),
                    immediateEffect: abilityHelper.immediateEffects.damage({ amount: 2 })
                })
            ])
        });
    }
}