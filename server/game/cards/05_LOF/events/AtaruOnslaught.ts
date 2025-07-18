import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { Trait } from '../../../core/Constants';

export default class AtaruOnslaught extends EventCard {
    protected override getImplementationId () {
        return {
            id: '6736342819',
            internalName: 'ataru-onslaught',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Ready a Force unit with 4 or less power',
            targetResolver: {
                cardCondition: (card) => card.isUnit() && card.hasSomeTrait(Trait.Force) && card.getPower() <= 4,
                immediateEffect: AbilityHelper.immediateEffects.ready(),
            }
        });
    }
}
