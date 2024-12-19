import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import { Trait } from '../../../core/Constants';

export default class PetitionTheSenate extends EventCard {
    protected override getImplementationId() {
        return {
            id: '3500129784',
            internalName: 'petition-the-senate',
        };
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'Draw 3 cards.',
            immediateEffect: AbilityHelper.immediateEffects.conditional({
                condition: (context) => context.source.controller.getUnitsInPlayWithTrait(Trait.Official).length >= 3,
                onTrue: AbilityHelper.immediateEffects.draw({ amount: 3 }),
                onFalse: AbilityHelper.immediateEffects.noAction()
            })
        });
    }
}

PetitionTheSenate.implemented = true;
