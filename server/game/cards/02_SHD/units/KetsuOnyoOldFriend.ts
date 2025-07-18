import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { DamageType } from '../../../core/Constants';

export default class KetsuOnyoOldFriend extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '4595532978',
            internalName: 'ketsu-onyo#old-friend',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'Defeat an upgrade that costs 2 or less.',
            optional: true,
            when: {
                onDamageDealt: (event, context) =>
                    // TODO: refactor damage enum types to account for the fact that overwhelm is combat damage
                    event.damageSource?.attack?.attacker === context.source &&
                    ((event.type === DamageType.Combat && event.damageSource.attack.getAllTargets().some((target) => target.isBase())) || event.type === DamageType.Overwhelm)
            },
            targetResolver: {
                immediateEffect: AbilityHelper.immediateEffects.defeat(),
                cardCondition: (card) => card.isUpgrade() && card.cost <= 2,
            }
        });
    }
}
