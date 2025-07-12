import AbilityHelper from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class T6Shuttle1974StayClose extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 't6-shuttle-1974#stay-close-id',
            internalName: 't6-shuttle-1974#stay-close'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar) {
        registrar.addTriggeredAbility({
            title: 'Give an experience token to this unit',
            when: {
                onAttackDeclared: (event, context) => event.attack.getAllTargets().includes(context.source),
            },
            optional: true,
            immediateEffect: AbilityHelper.immediateEffects.giveExperience(),
        });
    }
}
