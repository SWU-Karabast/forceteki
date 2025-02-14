import AbilityHelper from '../../../AbilityHelper';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { RelativePlayer, WildcardCardType } from '../../../core/Constants';

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
                    event.card.controller === context.source.controller &&
                    event.card.isUnit(),
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
                    event.card.controller === context.source.controller &&
                    event.card.isUnit(),
            },
            targetResolver: {
                controller: RelativePlayer.Opponent,
                cardTypeFilter: WildcardCardType.Unit,
                cardCondition: (card, context) => card.isUnit() && card.cost <= context.event.card.cost,
                immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 1 })
            }
        });
    }
}

