import type { IAbilityHelper } from '../../../AbilityHelper';
import type {
    ILeaderUnitAbilityRegistrar,
    ILeaderUnitLeaderSideAbilityRegistrar
} from '../../../core/card/AbilityRegistrationInterfaces';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';

export default class CountDookuOfferingAid extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '7416439679',
            internalName: 'count-dooku#offering-aid',
        };
    }

    protected override setupLeaderSideAbilities(registrar: ILeaderUnitLeaderSideAbilityRegistrar, abilityHelper: IAbilityHelper) {
        // THIS IMPLEMENTATION IS NOT ACCURATE FOR TWIN SUNS
        registrar.addActionAbility({
            title: 'Both player jeal 1 damage from their base an create a Battle Droid token',
            cost: [abilityHelper.costs.exhaustSelf()],
            immediateEffect: abilityHelper.immediateEffects.simultaneous([
                abilityHelper.immediateEffects.heal((context) => ({
                    amount: 1,
                    target: [context.player.base, context.player.opponent.base]
                })),
                abilityHelper.immediateEffects.createBattleDroid((context) => ({
                    amount: 1,
                    target: context.player
                })),
                abilityHelper.immediateEffects.createBattleDroid((context) => ({
                    amount: 1,
                    target: context.player.opponent
                }))
            ])
        });
    }

    protected override setupLeaderUnitSideAbilities(registrar: ILeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addOnAttackAbility({
            title: 'Create 2 Battle Droid tokens',
            immediateEffect: abilityHelper.immediateEffects.createBattleDroid({ amount: 2 })
        });
    }
}
