import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { DamageType, WildcardCardType } from '../../../core/Constants';

export default class MoraloEvalInfamousMurderer extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'moralo-eval#infamous-murderer-id',
            internalName: 'moralo-eval#infamous-murderer',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'Deal 1 damage to a unit',
            when: {
                onDamageDealt: (event, context) => {
                    // TODO: refactor damage enum types to account for the fact that overwhelm is combat damage
                    return ((event.type === DamageType.Combat && event.damageSource.attack.getAllTargets().some((target) => target === context.player.base)) || (event.type === DamageType.Overwhelm && event.card === context.player.base));
                }
            },
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: abilityHelper.immediateEffects.damage({ amount: 1 })
            }
        });
    }
}