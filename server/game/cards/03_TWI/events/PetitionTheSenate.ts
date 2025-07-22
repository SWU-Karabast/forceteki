import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { Trait } from '../../../core/Constants';

export default class PetitionTheSenate extends EventCard {
    protected override getImplementationId() {
        return {
            id: '3500129784',
            internalName: 'petition-the-senate',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Draw 3 cards.',
            immediateEffect: AbilityHelper.immediateEffects.conditional({
                condition: (context) => context.player.getArenaUnits({ trait: Trait.Official }).length >= 3,
                onTrue: AbilityHelper.immediateEffects.draw({ amount: 3 }),
            })
        });
    }
}
