import AbilityHelper from '../../../AbilityHelper';
import type { AbilityContext } from '../../../core/ability/AbilityContext';
import { UnlimitedAbilityLimit } from '../../../core/ability/AbilityLimit';
import type { Card } from '../../../core/card/Card';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { RelativePlayer, TargetMode, ZoneName } from '../../../core/Constants';

export default class AdmiralTrenchChkchkchkchk extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '3905028200',
            internalName: 'admiral-trench#chkchkchkchk',
        };
    }

    protected override deployActionAbilityProps() {
        return {
            limit: new UnlimitedAbilityLimit(),
            cost: [
                AbilityHelper.costs.exhaustSelf<AbilityContext<this>>(),
                AbilityHelper.costs.abilityResourceCost<AbilityContext<this>>(3),
            ],
        };
    }

    protected override setupLeaderSideAbilities() {
        this.addActionAbility({
            title: 'Discard a card that costs 3 or more from your hand',
            cost: AbilityHelper.costs.exhaustSelf(),
            targetResolver: {
                activePromptTitle: 'Choose a card to discard',
                controller: RelativePlayer.Self,
                zoneFilter: ZoneName.Hand,
                cardCondition: (card) => card.hasCost() && card.cost >= 3,
                immediateEffect: AbilityHelper.immediateEffects.discardSpecificCard(),
            },
            ifYouDo: {
                title: 'Draw a card',
                immediateEffect: AbilityHelper.immediateEffects.draw()
            }
        });
    }

    protected override setupLeaderUnitSideAbilities() {
        this.addTriggeredAbility({
            title: 'Reveal the top 4 cards of your deck. An opponent discards 2 of them. Draw 1 of the remaining cards and discard the other',
            when: {
                onLeaderDeployed: (event, context) => {
                    return event.card === context.source;
                }
            },
            immediateEffect: AbilityHelper.immediateEffects.sequential([
                AbilityHelper.immediateEffects.reveal((context) => ({
                    target: context.player.getTopCardsOfDeck(4),
                    useDisplayPrompt: true,
                })),
                AbilityHelper.immediateEffects.conditional({
                    condition: (context) => context.player.deckZone.count <= 2,
                    onTrue: AbilityHelper.immediateEffects.discardSpecificCard((context) => ({
                        target: context.player.getTopCardsOfDeck(2),
                    })),
                    onFalse: AbilityHelper.immediateEffects.sequential([
                        AbilityHelper.immediateEffects.selectCard({
                            activePromptTitle: 'Choose 2 cards to discard',
                            name: 'discardedCards',
                            mode: TargetMode.Exactly,
                            numCards: 2,
                            controller: RelativePlayer.Self,
                            zoneFilter: ZoneName.Deck,
                            player: RelativePlayer.Opponent,
                            cardCondition: (card, context) => (context.player.getTopCardsOfDeck(4) as Card[]).includes(card),
                            innerSystem: AbilityHelper.immediateEffects.discardSpecificCard(),
                        }),
                        AbilityHelper.immediateEffects.conditional({
                            condition: (context) => context.player.deckZone.count === 1,
                            onTrue: AbilityHelper.immediateEffects.draw((context) => ({
                                target: context.player,
                            })),
                            onFalse: AbilityHelper.immediateEffects.selectCard({
                                activePromptTitle: 'Choose a card to draw and discard the other',
                                name: 'drawnCard',
                                mode: TargetMode.Single,
                                controller: RelativePlayer.Self,
                                zoneFilter: ZoneName.Deck,
                                cardCondition: (card, context) => (context.player.getTopCardsOfDeck(2) as Card[]).includes(card),
                                innerSystem: AbilityHelper.immediateEffects.simultaneous([
                                    AbilityHelper.immediateEffects.drawSpecificCard(),
                                    AbilityHelper.immediateEffects.discardSpecificCard((context) => ({
                                        target: context.player.getTopCardsOfDeck(2).find((card) => card !== context.targets.drawnCard[0])
                                    })),
                                ]),
                            }),
                        }),
                    ]),
                }),
            ]),
        });
    }
}