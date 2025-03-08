import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import { Trait } from '../../../core/Constants';

export default class ElectromagneticPulse extends EventCard {
    protected override getImplementationId() {
        return {
            id: '4819196588',
            internalName: 'electromagnetic-pulse',
        };
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'Deal 2 damage to a Droid or Vehicle unit and exhaust it.',
            targetResolver: {
                cardCondition: (card) => card.isUnit() && card.hasSomeTrait([Trait.Droid, Trait.Vehicle]),
                immediateEffect: AbilityHelper.immediateEffects.sequential([
                    AbilityHelper.immediateEffects.damage((context) => ({ target: context.target, amount: 2 })),
                    AbilityHelper.immediateEffects.exhaust((context) => ({ target: context.target }))
                ])
            }
        });
    }
}
