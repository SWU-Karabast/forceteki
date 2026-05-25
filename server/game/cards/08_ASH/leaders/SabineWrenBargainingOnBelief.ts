import type { IAbilityHelper } from '../../../AbilityHelper';
import type {
    ILeaderUnitAbilityRegistrar,
    ILeaderUnitLeaderSideAbilityRegistrar
} from '../../../core/card/AbilityRegistrationInterfaces';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { CardType, Duration, EventName, KeywordName, RelativePlayer, WildcardCardType } from '../../../core/Constants';
import type { TriggeredAbilityContext } from '../../../core/ability/TriggeredAbilityContext';

export default class SabineWrenBargainingOnBelief extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'sabine-wren#bargaining-on-belief-id',
            internalName: 'sabine-wren#bargaining-on-belief',
        };
    }

    protected override setupLeaderSideAbilities(registrar: ILeaderUnitLeaderSideAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addActionAbility({
            title: 'An opponent gives 2 Advantage tokens to a unit they control. If they do, the next you play this phase gains Shielded for this phase',
            cost: abilityHelper.costs.exhaustSelf(),
            targetResolver: {
                activePromptTitle: 'Choose a unit to give 2 Advantage tokens. The next unit your opponent plays this unit gains Shielded for this phase',
                cardTypeFilter: WildcardCardType.Unit,
                choosingPlayer: RelativePlayer.Opponent,
                controller: RelativePlayer.Opponent,
                immediateEffect: abilityHelper.immediateEffects.giveAdvantage({ amount: 2 })
            },
            ifYouDo: {
                title: 'Draw a card',
                immediateEffect: abilityHelper.immediateEffects.delayedPlayerEffect({
                    title: 'The next unit you play this phase gains Shielded for this phase',
                    when: {
                        onCardPlayed: (event, context) => this.isUnitPlayedEvent(event, context),
                    },
                    duration: Duration.UntilEndOfPhase,
                    effectDescription: 'give Shielded to the next unit they play this phase',
                    immediateEffect: abilityHelper.immediateEffects.forThisPhaseCardEffect((context) => ({
                        target: context.events.find((event) => this.isUnitPlayedEvent(event, context)).card,
                        effect: abilityHelper.ongoingEffects.gainKeyword(KeywordName.Shielded),
                    }))
                })
            }
        });
    }

    protected override setupLeaderUnitSideAbilities(registrar: ILeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addOnAttackAbility({
            title: 'The next unit you play this phase gains Shielded',
            immediateEffect: abilityHelper.immediateEffects.delayedPlayerEffect({
                title: 'The next unit you play this phase gains Shielded',
                when: {
                    onCardPlayed: (event, context) => this.isUnitPlayedEvent(event, context),
                },
                duration: Duration.UntilEndOfPhase,
                effectDescription: 'give Shielded to the next unit they play this phase',
                immediateEffect: abilityHelper.immediateEffects.forThisPhaseCardEffect((context) => ({
                    target: context.events.find((event) => this.isUnitPlayedEvent(event, context)).card,
                    effect: abilityHelper.ongoingEffects.gainKeyword(KeywordName.Shielded),
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
