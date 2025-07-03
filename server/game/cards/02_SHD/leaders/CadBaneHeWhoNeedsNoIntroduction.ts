import AbilityHelper from '../../../AbilityHelper';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { RelativePlayer, Trait, WildcardCardType } from '../../../core/Constants';

export default class CadBaneHeWhoNeedsNoIntroduction extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '1384530409',
            internalName: 'cad-bane#he-who-needs-no-introduction',
        };
    }

    protected override setupLeaderSideAbilities(card: this) {
        card.addTriggeredAbility({
            title: 'Exhaust this leader to deal 1 damage to a unit controlled by the opponent',
            optional: true,
            when: {
                onCardPlayed: (event, context) => event.player === context.player && event.card.hasSomeTrait(Trait.Underworld)
            },
            immediateEffect: AbilityHelper.immediateEffects.exhaust(),
            ifYouDo: {
                title: 'The opponent chooses a unit they control. Deal 1 damage to it.',
                targetResolver: {
                    choosingPlayer: RelativePlayer.Opponent,
                    controller: RelativePlayer.Opponent,
                    cardTypeFilter: WildcardCardType.Unit,
                    immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 1 })
                },
            }
        });
    }

    protected override setupLeaderUnitSideAbilities(card: this) {
        card.addTriggeredAbility({
            title: 'The opponent chooses a unit they control. Deal 2 damage to it.',
            optional: true,
            when: {
                onCardPlayed: (event, context) => event.player === context.player && event.card.hasSomeTrait(Trait.Underworld)
            },
            limit: AbilityHelper.limit.perRound(1),
            targetResolver: {
                choosingPlayer: RelativePlayer.Opponent,
                controller: RelativePlayer.Opponent,
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 2 })
            },
        });
    }
}
