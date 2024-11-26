import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { AbilityType, RelativePlayer, Trait } from '../../../core/Constants';
import { Attack } from '../../../core/attack/Attack';
import { UnitCard } from '../../../core/card/CardTypes';
import { WildcardCardType } from '../../../core/Constants';
import { noAction, replacementEffect } from '../../../gameSystems/GameSystemLibrary';

export default class MaulShadowCollectiveVisionary extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '8862896760',
            internalName: 'maul#shadow-collective-visionary'
        };
    }

    public override setupCardAbilities() {
        this.addOnAttackAbility({
            title: 'You may choose another friendly Underworld unit. If you do, all combat damage that would be dealt to this unit during this attack is dealt to the chosen unit instead.',
            immediateEffect: AbilityHelper.immediateEffects.forThisAttackCardEffect((context) => ({
                effect: AbilityHelper.ongoingEffects.gainAbility({
                    type: AbilityType.Triggered,
                    optional: true,
                    title: 'All combat damage that would be dealt to this unit during this attack is dealt to the chosen unit instead.',
                    when: { onAttackDamageResolved: (event, context) => event.attack.attacker === this },
                    targetResolver: {
                        cardTypeFilter: WildcardCardType.Unit,
                        controller: RelativePlayer.Self,
                        cardCondition: (card) => card.hasSomeTrait(Trait.Underworld) && card !== this,
                        immediateEffect: AbilityHelper.immediateEffects.replacementEffect({
                            replacementImmediateEffect: AbilityHelper.immediateEffects.damage(() => ({ amount: 10 }))
                        }),
                    }
                })
            }))
        });
    }
}

MaulShadowCollectiveVisionary.implemented = true;


/*
immediateEffect: AbilityHelper.immediateEffects.forThisAttackCardEffect((context) => ({
                effect: AbilityHelper.ongoingEffects.gainAbility({
                    type: AbilityType.Triggered,
                    title: 'All combat damage that would be dealt to this unit during this attack is dealt to the chosen unit instead.',
                    when: { onAttackDamageResolved: (event, context) => event.attack.attacker === this },
                    immediateEffect: AbilityHelper.immediateEffects.replacementEffect({
                        replacementImmediateEffect: AbilityHelper.immediateEffects.damage(() => ({ amount: 10 }))
                    }),
                    targetResolver: {
                        cardTypeFilter: WildcardCardType.Unit,
                        controller: RelativePlayer.Self,
                        cardCondition: (card) => card.hasSomeTrait(Trait.Underworld) && card !== this
                    }
                })
            }))
*/
/*

        this.addReplacementEffectAbility({
            title: 'All combat damage that would be dealt to this unit during this attack is dealt to the chosen unit instead.',
            when: {
                onAttackDamageResolved: (event, context) => true
            },
            replaceWith: {
                target: this,
                replacementImmediateEffect: AbilityHelper.immediateEffects.defeat()
            },
            // effect: 'shield prevents {1} from taking damage',
            // effectArgs: (context) => [context.source.parentCard],
        });

                AbilityHelper.immediateEffects.simultaneous((context) => ([
                    AbilityHelper.immediateEffects.damage(() => ({ amount: 10 })),
                    AbilityHelper.immediateEffects.forThisAttackCardEffect({
                        effect: AbilityHelper.ongoingEffects.modifyStats({ power: -(context.event.attack as Attack).getTargetTotalPower, hp: 0 }),
                        target: (context.event.attack as Attack).target
                    })
                ]))
                */