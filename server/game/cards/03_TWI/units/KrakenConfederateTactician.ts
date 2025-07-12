import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class KrakenConfederateTactician extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '7979348081',
            internalName: 'kraken#confederate-tactician'
        };
    }

    protected override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Create 2 Battle Droid tokens.',
            immediateEffect: AbilityHelper.immediateEffects.createBattleDroid({ amount: 2 })
        });

        registrar.addOnAttackAbility({
            title: 'Give each friendly token unit +1/+1 for this phase.',
            immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect((context) => ({
                target: context.player.getArenaUnits({ condition: (card) => card.isTokenUnit() }),
                effect: AbilityHelper.ongoingEffects.modifyStats({ power: 1, hp: 1 }),
            })),
        });
    }
}
