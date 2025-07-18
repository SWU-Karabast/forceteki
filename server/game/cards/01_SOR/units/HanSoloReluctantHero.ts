import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class HanSoloReluctantHero extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '9500514827',
            internalName: 'han-solo#reluctant-hero',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: 'While attacking, this unit deals combat damage before the defender.',
            ongoingEffect: AbilityHelper.ongoingEffects.dealsDamageBeforeDefender(),
        });
    }
}
