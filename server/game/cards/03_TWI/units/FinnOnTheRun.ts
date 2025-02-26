import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { AbilityType, DamageType, WildcardCardType } from '../../../core/Constants';

export default class FinnOnTheRun extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '7244268162',
            internalName: 'finn#on-the-run',
        };
    }

    public override setupCardAbilities() {
        this.addTriggeredAbility({
            title: 'For this phase, if damage would be dealt to that unit, prevent 1 of that damage',
            when: {
                onAttackCompleted: (event, context) => event.attack.attacker === context.source,
            },
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                cardCondition: (card) => card.unique,
                immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                    effect: AbilityHelper.ongoingEffects.gainAbility({
                        title: 'For this phase, if damage would be dealt to that unit, prevent 1 of that damage',
                        type: AbilityType.ReplacementEffect,
                        when: {
                            onDamageDealt: (event, context) => event.card === context.source
                        },
                        replaceWith: {
                            replacementImmediateEffect: AbilityHelper.immediateEffects.conditional((context) => ({
                                condition: () => context.event.type === DamageType.Combat,
                                onTrue: AbilityHelper.immediateEffects.combatDamage((context) => ({
                                    target: context.source,
                                    amount: this.getReducedDamage(context.event.amount),
                                    sourceAttack: context.event.damageSource.attack,
                                    source: context.event.damageSource.damageDealtBy
                                })),
                                onFalse: AbilityHelper.immediateEffects.damage((context) => ({
                                    target: context.source,
                                    amount: this.getReducedDamage(context.event.amount),
                                    source: context.event.damageSource.damageDealtBy,
                                }))
                            }))
                        },
                        effect: 'Finn\'s ability prevents 1 damage to {1}',
                        effectArgs: (context) => [context.source]
                    })
                })
            }
        });
    }

    private getReducedDamage(amount) {
        return Math.max(amount - 1, 0);
    }
}
