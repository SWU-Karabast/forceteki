import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class GeneralGrievousScuttlingToSafety extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'general-grievous#scuttling-to-safety-id',
            internalName: 'general-grievous#scuttling-to-safety'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'Return him to his owner\'s hand',
            when: {
                onAttackDeclared: (event, context) => event.attack.getAllTargets().includes(context.source),
            },
            immediateEffect: AbilityHelper.immediateEffects.conditional({
                condition: (context) => context.source.zoneName === 'groundArena',
                onTrue: AbilityHelper.immediateEffects.returnToHand(),
            }),
        });
    }
}