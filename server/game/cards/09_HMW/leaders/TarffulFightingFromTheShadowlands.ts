import type { IAbilityHelper } from '../../../AbilityHelper';
import type {
    ILeaderUnitAbilityRegistrar,
    ILeaderUnitLeaderSideAbilityRegistrar
} from '../../../core/card/AbilityRegistrationInterfaces';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class TarffulFightingFromTheShadowlands extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'tarfful#fighting-from-the-shadowlands-id',
            internalName: 'tarfful#fighting-from-the-shadowlands',
        };
    }

    protected override setupLeaderSideAbilities(registrar: ILeaderUnitLeaderSideAbilityRegistrar, abilityHelper: IAbilityHelper): void {
        registrar.addActionAbility({
            title: 'Create a Beast token',
            cost: [abilityHelper.costs.abilityActivationResourceCost(2), abilityHelper.costs.exhaustSelf(), abilityHelper.costs.discardCardFromOwnHand()],
            immediateEffect: abilityHelper.immediateEffects.createBeast()
        });
    }

    protected override setupLeaderUnitSideAbilities(registrar: ILeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper): void {
        registrar.addOnAttackAbility({
            title: `Pay ${TextHelper.resource(1)} to create a Beast token`,
            optional: true,
            immediateEffect: abilityHelper.immediateEffects.payResources((context) => ({ amount: 1, target: context.player })),
            ifYouDo: {
                title: 'Create a Beast token',
                immediateEffect: abilityHelper.immediateEffects.createBeast()
            }
        });
    }
}
