import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { Trait } from '../../../core/Constants';

export default class KoiogranTurn extends EventCard {
    protected override getImplementationId() {
        return {
            id: '9695562265',
            internalName: 'koiogran-turn',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Ready a Fighter or Transport unit with 6 or less power',
            targetResolver: {
                cardCondition: (card) => card.isUnit() && card.getPower() <= 6 && (card.hasSomeTrait([Trait.Fighter, Trait.Transport])),
                immediateEffect: AbilityHelper.immediateEffects.ready(),
            }
        });
    }
}