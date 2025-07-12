import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { WildcardCardType } from '../../../core/Constants';

export default class ConsumedByTheDarkSide extends EventCard {
    protected override getImplementationId() {
        return {
            id: '8621390428',
            internalName: 'consumed-by-the-dark-side',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Give 2 Experience tokens to a unit',
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.giveExperience({ amount: 2 })
            },
            then: (thenContext) => ({
                title: 'Deal 2 damage to the unit',
                immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 2, target: thenContext.target })
            }),
        });
    }
}
