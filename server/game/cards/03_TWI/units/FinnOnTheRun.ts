import AbilityHelper from '../../../AbilityHelper';
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
                            onDamageDealt: (event, context) => event.card === context.source && !event.isIndirect
                        },
                        effect: 'Finn\'s ability prevents 1 damage to {1}',
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
