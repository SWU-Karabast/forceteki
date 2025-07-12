import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class KnightOfTheRepublic extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '4541556921',
            internalName: 'knight-of-the-republic',
        };
    }

    protected override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'Create a Clone Trooper token.',
            when: {
                onAttackDeclared: (event, context) => event.attack.getAllTargets().includes(context.source),
            },
            immediateEffect: AbilityHelper.immediateEffects.createCloneTrooper()
        });
    }
}
