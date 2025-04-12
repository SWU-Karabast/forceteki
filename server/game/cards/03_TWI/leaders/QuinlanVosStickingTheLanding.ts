import AbilityHelper from '../../../AbilityHelper';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { CardType, RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class QuinlanVosStickingTheLanding extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '2358113881',
            internalName: 'quinlan-vos#sticking-the-landing',
        };
    }

    protected override setupLeaderSideAbilities() {
        this.addTriggeredAbility({
            title: 'Exhaust this leader',
            when: {
                onCardPlayed: (event, context) =>
                    event.player === context.player &&
                    event.cardTypeWhenInPlay === CardType.BasicUnit,
            },
            optional: true,
            immediateEffect: AbilityHelper.immediateEffects.exhaust(),
            ifYouDo: (ifYouDoContext) => ({
                title: 'Deal 1 damage to an enemy unit that costs the same as the played unit',
                targetResolver: {
                    controller: RelativePlayer.Opponent,
                    cardTypeFilter: WildcardCardType.Unit,
                    cardCondition: (card) => card.isUnit() && card.cost === ifYouDoContext.event.card.cost,
                    immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 1 })
                }
            })
        });
    }

    protected override setupLeaderUnitSideAbilities() {
        this.addTriggeredAbility({
            title: 'Deal 1 damage to an enemy unit that costs the same as or less than the played unit',
            when: {
                onCardPlayed: (event, context) =>
                    event.player === context.player &&
                    event.cardTypeWhenInPlay === CardType.BasicUnit,
            },
            optional: true,
            targetResolver: {
                controller: RelativePlayer.Opponent,
                cardTypeFilter: WildcardCardType.Unit,
                cardCondition: (card, context) => card.isUnit() && card.cost <= context.event.card.cost,
                immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 1 })
            }
        });
    }
}

