import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { AbilityType, DamageType, WildcardCardType } from '../../../core/Constants';
import { DamageSystem } from '../../../gameSystems/DamageSystem';

export default class FinnOnTheRun extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '7244268162',
            internalName: 'finn#on-the-run',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addOnAttackCompletedAbility({
            title: 'For this phase, if damage would be dealt to that unit, prevent 1 of that damage',
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                cardCondition: (card) => card.unique,
                immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                    effect: AbilityHelper.ongoingEffects.gainAbility({
                        title: 'For this phase, if damage would be dealt to that unit, prevent 1 of that damage',
                        type: AbilityType.ReplacementEffect,
                        when: {
                            onDamageDealt: (event, context) => event.card === context.source && !event.isIndirect
                        },
                        effect: 'prevent 1 damage to {1}',
                        effectArgs: (context) => [context.source],
                        replaceWith: {
                            replacementImmediateEffect: new DamageSystem((context) => ({
                                type: context.event.type,
                                target: context.source,
                                amount: Math.max(context.event.amount - 1, 0),
                                source: context.event.damageSource.type === DamageType.Ability ? context.event.damageSource.card : context.event.damageSource.damageDealtBy,
                                sourceAttack: context.event.damageSource.attack,
                            }))
                        },
                    })
                })
            }
        });
    }
}
