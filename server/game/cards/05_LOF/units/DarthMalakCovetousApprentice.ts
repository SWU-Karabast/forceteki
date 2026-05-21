import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Trait, WildcardCardType } from '../../../core/Constants';

export default class DarthMalakCovetousApprentice extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '2285555274',
            internalName: 'darth-malak#covetous-apprentice'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Ready Darth Malak',
            optional: true,
            immediateEffect: AbilityHelper.immediateEffects.conditional({
                condition: (context) => context.player.hasSomeArenaCard({
                    trait: Trait.Sith,
                    type: WildcardCardType.LeaderUnit
                }),
                onTrue: AbilityHelper.immediateEffects.ready()
            })
        });
    }
}
