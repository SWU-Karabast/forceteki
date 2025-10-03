import type { IAbilityHelper } from '../../../AbilityHelper';
import type { TriggeredAbilityContext } from '../../../core/ability/TriggeredAbilityContext';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { AbilityType, DamagePreventionType, RelativePlayer, Trait, WildcardCardType } from '../../../core/Constants';
import { DamageSourceType } from '../../../IDamageOrDefeatSource';

export default class MaulShadowCollectiveVisionary extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '8862896760',
            internalName: 'maul#shadow-collective-visionary',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addOnAttackAbility({
            title: 'Choose another friendly Underworld unit. All combat damage that would be dealt to this unit during this attack is dealt to the chosen unit instead.',
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                controller: RelativePlayer.Self,
                cardCondition: (card, context) => card.hasSomeTrait(Trait.Underworld) && card !== context.source,
                immediateEffect: AbilityHelper.immediateEffects.conditional({
                    // don't bother triggering the ability if we're attacking a base
                    condition: (context) => context.event.attack.targetIsUnit(),
                    onTrue: AbilityHelper.immediateEffects.forThisAttackCardEffect((maulContext) => ({
                        target: maulContext.source,
                        effect: AbilityHelper.ongoingEffects.gainDamagePreventionAbility({
                            title: 'Redirect combat damage to another Underworld unit',
                            type: AbilityType.DamagePrevention,
                            preventionType: DamagePreventionType.Replace,
                            preventDamageFrom: DamageSourceType.Attack,
                            replaceWithSystem: AbilityHelper.immediateEffects.combatDamage((damageContext) => ({
                                target: maulContext.target,
                                amount: (damageContext as TriggeredAbilityContext).event.amount,
                                sourceAttack: (damageContext as TriggeredAbilityContext).event.damageSource.attack,
                                source: (damageContext as TriggeredAbilityContext).event.damageSource.damageDealtBy
                            }))
                        })
                    }))
                })
            }
        });
    }
}
