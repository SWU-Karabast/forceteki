import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { ZoneName } from '../../../core/Constants';

export default class ExpendableMercenary extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'expendable-mercenary-id',
            internalName: 'expendable-mercenary',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenDefeatedAbility({
            title: 'Resource this unit from its owner\'s discard pile',
            optional: true,
            immediateEffect: abilityHelper.immediateEffects.conditional({
                condition: (context) => context.source.zoneName === ZoneName.Discard,
                onTrue: abilityHelper.immediateEffects.resourceCard((context) => ({ target: context.source }))
            })
        });
    }
}