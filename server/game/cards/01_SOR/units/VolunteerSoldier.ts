import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Trait } from '../../../core/Constants';

export default class VolunteerSoldier extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '4111616117',
            internalName: 'volunteer-soldier',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addDecreaseCostAbility({
            title: 'If you control a Trooper unit, this unit costs 1 less to play',
            condition: (context) => context.player.hasSomeArenaUnit({ otherThan: context.source, trait: Trait.Trooper }),
            amount: 1
        });
    }
}
