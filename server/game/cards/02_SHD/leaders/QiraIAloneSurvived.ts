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
            cost: [AbilityHelper.costs.exhaustSelf(), AbilityHelper.costs.abilityActivationResourceCost(1)],
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                controller: RelativePlayer.Self,
                immediateEffect: AbilityHelper.immediateEffects.sequential([
                    AbilityHelper.immediateEffects.damage({ amount: 2 }),
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
                    return event.card === context.source;
                }
            },
            immediateEffect: AbilityHelper.immediateEffects.sequential([
                AbilityHelper.immediateEffects.heal((context) => {
                    const allUnits = context.player.getArenaUnits().concat(context.player.opponent.getArenaUnits());
                    const healAmount = (card) => card.damage;
                    return { amount: healAmount, target: allUnits };
                }),
                AbilityHelper.immediateEffects.damage((context) => {
                    const allUnits = context.player.getArenaUnits().concat(context.player.opponent.getArenaUnits());
                    const damageAmount = (card) => Math.floor(card.getHp() / 2);
                    return { amount: damageAmount, target: allUnits };
                })
            ])
        });
    }
}
