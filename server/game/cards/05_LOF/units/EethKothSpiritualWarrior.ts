import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class EethKothSpiritualWarrior extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '1160624693',
            internalName: 'eeth-koth#spiritual-warrior',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenDefeatedAbility({
            title: 'Use the Force to put Eeth Koth into play as a resource',
            optional: true,
            immediateEffect: AbilityHelper.immediateEffects.useTheForce(),
            ifYouDo: {
                title: 'Put Eeth Koth into play as a resource',
                immediateEffect: AbilityHelper.immediateEffects.resourceCard((context) => ({ target: context.source }))
            }
        });
    }
}