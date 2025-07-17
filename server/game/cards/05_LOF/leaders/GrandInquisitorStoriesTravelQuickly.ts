import type { IAbilityHelper } from '../../../AbilityHelper';
import type { ILeaderUnitAbilityRegistrar, ILeaderUnitLeaderSideAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';

export default class GrandInquisitorStoriesTravelQuickly extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'grand-inquisitor#stories-travel-quickly-id',
            internalName: 'grand-inquisitor#stories-travel-quickly',
        };
    }

    protected override setupLeaderSideAbilities(registrar: ILeaderUnitLeaderSideAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addActionAbility({
            title: 'Attack with a unit. The defender gets -2/-0 for this attack',
            cost: [
                AbilityHelper.costs.exhaustSelf(),
                AbilityHelper.costs.useTheForce(),
            ],
            initiateAttack: {
                defenderLastingEffects: {
                    effect: AbilityHelper.ongoingEffects.modifyStats({ power: -2, hp: 0 })
                }
            }
        });
    }

    protected override setupLeaderUnitSideAbilities(registrar: ILeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addOnAttackAbility({
            title: 'The defender gets -2/-0 for this attack',
            immediateEffect: AbilityHelper.immediateEffects.forThisAttackCardEffect((context) => ({
                target: context.event.attack.getAllTargets(),
                effect: AbilityHelper.ongoingEffects.modifyStats({ power: -2, hp: 0 })
            })),
        });
    }
}
