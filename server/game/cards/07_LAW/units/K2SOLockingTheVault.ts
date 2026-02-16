import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { ZoneName } from '../../../core/Constants';

export default class K2SOLockingTheVault extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'k2so#locking-the-vault-id',
            internalName: 'k2so#locking-the-vault',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addOnAttackAbility({
            title: 'Deal 3 damage to a damaged ground unit',
            optional: true,
            targetResolver: {
                cardCondition: (card) => card.isUnit() && card.damage > 0,
                zoneFilter: ZoneName.GroundArena,
                immediateEffect: abilityHelper.immediateEffects.damage({ amount: 3 })
            }
        });
    }
}