import AbilityHelper from '../../../AbilityHelper';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class QiraIAloneSuvived extends LeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '2432897157',
            internalName: 'qira#i-alone-survived',
        };
    }

    protected override setupLeaderSideAbilities () {
        this.addActionAbility({
            title: 'Deal 2 damage to a friendly unit. Then, give a Shield token to it',
            cost: [AbilityHelper.costs.exhaustSelf(), AbilityHelper.costs.abilityResourceCost(1)],
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                controller: RelativePlayer.Self,
                immediateEffect: AbilityHelper.immediateEffects.sequential([
                    AbilityHelper.immediateEffects.damage((context) => ({ target: context.target, amount: 2 })),
                    AbilityHelper.immediateEffects.giveShield()
                ])
            }
        });
    }

    protected override setupLeaderUnitSideAbilities () {
        this.addTriggeredAbility({
            title: 'Heal all damage from each unit. Then, deal damage to each unit equal to half its remaining HP, rounded down',
            when: {
                onLeaderDeployed: (event, context) => {
                    return event.target.controller === context.source.controller;
                }
            },
            immediateEffect: AbilityHelper.immediateEffects.sequential([
                AbilityHelper.immediateEffects.heal((context) => {
                    const allUnits = context.player.getUnitsInPlay().concat(context.player.opponent.getUnitsInPlay());
                    return { amount: 9999, target: allUnits };
                })
            ])
        });


        /* this.addOnAttackAbility({
            title: 'You may deal 1 damage to a unit. If you attacked with another Mandalorian unit this phase, you may deal 1 damage to a unit',
            // TODO: correct implementation of the rules for multiple instances of damage in the same ability
            immediateEffect: AbilityHelper.immediateEffects.sequential([
                AbilityHelper.immediateEffects.selectCard({
                    cardTypeFilter: WildcardCardType.Unit,
                    innerSystem: AbilityHelper.immediateEffects.damage({
                        optional: true,
                        amount: 1
                    }),
                }),
                AbilityHelper.immediateEffects.selectCard({
                    cardTypeFilter: WildcardCardType.Unit,
                    innerSystem: AbilityHelper.immediateEffects.conditional({
                        optional: true,
                        condition: (context) => this.attacksThisPhaseWatcher.getAttackers((attack) => context.source !== attack.attacker && attack.attacker.hasSomeTrait(Trait.Mandalorian)).length > 0,
                        onTrue: AbilityHelper.immediateEffects.damage({ amount: 1 }),
                        onFalse: AbilityHelper.immediateEffects.noAction(),
                    })
                })
            ])
        });*/
    }
}

QiraIAloneSuvived.implemented = true;
