import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { ZoneName } from '../../../core/Constants';

export default class GeneralGrievousScuttlingToSafety extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '1759702973',
            internalName: 'general-grievous#scuttling-to-safety'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addOnDefenseAbility({
            title: 'Return him to his owner\'s hand',
            immediateEffect: AbilityHelper.immediateEffects.conditional({
                condition: (context) => context.source.zoneName === ZoneName.GroundArena,
                onTrue: AbilityHelper.immediateEffects.returnToHand(),
            }),
        });
    }
}