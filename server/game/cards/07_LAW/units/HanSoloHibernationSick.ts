import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class HanSoloHibernationSick extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'han-solo#hibernation-sick-id',
            internalName: 'han-solo#hibernation-sick',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addOnAttackAbility({
            title: 'Give an Experience token to this unit',
            immediateEffect: abilityHelper.immediateEffects.giveExperience((context) => ({
                target: context.source,
            }))
        });
    }
}
