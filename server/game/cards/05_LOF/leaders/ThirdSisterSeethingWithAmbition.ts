import AbilityHelper from '../../../AbilityHelper';
import type { TriggeredAbilityContext } from '../../../core/ability/TriggeredAbilityContext';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { CardType, Duration, EventName, KeywordName, RelativePlayer, WildcardCardType, ZoneName } from '../../../core/Constants';

export default class ThirdSisterSeethingWithAmbition extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '3357344238',
            internalName: 'third-sister#seething-with-ambition',
        };
    }

    protected override setupLeaderSideAbilities() {
        this.addActionAbility({
            title: 'Play a unit from your hand. It gains Hidden for this phase',
            cost: [AbilityHelper.costs.exhaustSelf()],
            targetResolver: {
                cardCondition: (card) => card.isUnit(),
                cardTypeFilter: CardType.BasicUnit,
                controller: RelativePlayer.Self,
                zoneFilter: ZoneName.Hand,
                immediateEffect: AbilityHelper.immediateEffects.simultaneous([
                    AbilityHelper.immediateEffects.playCardFromHand({
                        playAsType: WildcardCardType.Unit,
                    }),
                    AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                        effect: AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Hidden)
                    }),
                ])
            }
        });
    }

    protected override setupLeaderUnitSideAbilities() {
        this.addOnAttackAbility({
            title: 'The next unit you play this phase gains Hidden',
            immediateEffect: AbilityHelper.immediateEffects.delayedPlayerEffect({
                title: 'The next unit you play this phase gains Hidden',
                when: {
                    onCardPlayed: (event, context) => this.isUnitPlayedEvent(event, context),
                },
                duration: Duration.UntilEndOfPhase,
                effectDescription: 'give Hidden to the next unit they will play this phase',
                immediateEffect: AbilityHelper.immediateEffects.cardLastingEffect((context) => ({
                    target: context.events.find((event) => this.isUnitPlayedEvent(event, context)).card,
                    effect: AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Hidden),
                    duration: Duration.Persistent,
                }))
            })
        });
    }

    private isUnitPlayedEvent(event, context: TriggeredAbilityContext): boolean {
        return event.name === EventName.OnCardPlayed &&
          event.cardTypeWhenInPlay === CardType.BasicUnit &&
          event.card.controller === context.player;
    }
}
