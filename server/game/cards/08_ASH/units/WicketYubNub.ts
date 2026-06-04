import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class WicketYubNub extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '4800098984',
            internalName: 'wicket#yub-nub',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: 'This unit can\'t attack bases',
            ongoingEffect: abilityHelper.ongoingEffects.cannotAttackBase()
        });
    }
}