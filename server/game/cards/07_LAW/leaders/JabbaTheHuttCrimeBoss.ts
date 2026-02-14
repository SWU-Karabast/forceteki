import type { IAbilityHelper } from '../../../AbilityHelper';
import type { AbilityContext } from '../../../core/ability/AbilityContext';
import type { ILeaderUnitAbilityRegistrar, ILeaderUnitLeaderSideAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { EventName, GameStateChangeRequired, KeywordName, RelativePlayer, Trait, WildcardCardType, ZoneName } from '../../../core/Constants';


export default class JabbaTheHuttCrimeBoss extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '2418476827',
            internalName: 'jabba-the-hutt#crime-boss',
        };
    }

    protected override setupLeaderSideAbilities(registrar: ILeaderUnitLeaderSideAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addActionAbility({
            title: 'Create a Credit token',
            cost: [
                AbilityHelper.costs.abilityActivationResourceCost(1),
                AbilityHelper.costs.exhaustSelf(),
                AbilityHelper.costs.returnToHandFromPlay({
                    activePromptTitle: 'Return a friendly Underworld unit to hand',
                    controller: RelativePlayer.Self,
                    cardTypeFilter: WildcardCardType.Unit,
                    cardCondition: (card) => card.hasSomeTrait(Trait.Underworld)
                })
            ],
            immediateEffect: AbilityHelper.immediateEffects.createCreditToken()
        });
    }

    protected override setupLeaderUnitSideAbilities(registrar: ILeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addActionAbility({
            title: 'Play an Underworld unit unit from your hand',
            targetResolver: {
                zoneFilter: ZoneName.Hand,
                controller: RelativePlayer.Self,
                cardTypeFilter: WildcardCardType.Unit,
                cardCondition: (card) => card.hasSomeTrait(Trait.Underworld),
                mustChangeGameState: GameStateChangeRequired.MustFullyResolve,
                immediateEffect: AbilityHelper.immediateEffects.simultaneous([
                    AbilityHelper.immediateEffects.playCardFromHand({
                        playAsType: WildcardCardType.Unit
                    }),
                    AbilityHelper.immediateEffects.delayedCardEffect((outerContext) => ({
                        title: 'It gains Ambush for the phase if a Credit token was used to pay its cost',
                        effectDescription: 'conditionally give it Ambush for the phase',
                        limit: AbilityHelper.limit.perGame(1),
                        when: {
                            onCardPlayed: (event) =>
                                event.card === outerContext.target
                        },
                        immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect((innerContext) => ({
                            target: outerContext.target,
                            condition: () => this.usedCreditTokenToPlayUnit(innerContext),
                            effect: AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Ambush)
                        }))
                    }))
                ])
            }
        });
    }

    private usedCreditTokenToPlayUnit(context: AbilityContext): boolean {
        const cardPlayedEvent = context.events
            .find((e) => e.name === EventName.OnCardPlayed);

        if (!cardPlayedEvent) {
            return false;
        }

        return cardPlayedEvent.costs.creditTokens && cardPlayedEvent.costs.creditTokens > 0;
    }
}