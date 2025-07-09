import AbilityHelper from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { CardType, Trait } from '../../../core/Constants';

export default class DarthMalakCovetousApprentice extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '2285555274',
            internalName: 'darth-malak#covetous-apprentice'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar) {
        registrar.addWhenPlayedAbility({
            title: 'Ready Darth Malak',
            optional: true,
            immediateEffect: AbilityHelper.immediateEffects.conditional({
                condition: (context) => context.player.hasSomeArenaCard({
                    trait: Trait.Sith,
                    type: CardType.LeaderUnit
                }),
                onTrue: AbilityHelper.immediateEffects.ready()
            })
        });
    }
}
