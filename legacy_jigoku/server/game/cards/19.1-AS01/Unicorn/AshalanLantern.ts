import { CardTypes, Decks, Durations, Locations, PlayTypes } from '../../../Constants';
import { PlayCharacterAsIfFromHandIntoConflict } from '../../../PlayCharacterAsIfFromHand';
import { PlayDisguisedCharacterAsIfFromHandIntoConflict } from '../../../PlayDisguisedCharacterAsIfFromHand';
import AbilityDsl from '../../../abilitydsl';
import type BaseCard from '../../../basecard';
import DrawCard from '../../../drawcard';

export default class AshalanLantern extends DrawCard {
    static id = 'ashalan-lantern';

    public setupCardAbilities() {
        this.action({
            title: "Play a character from your opponent's dynasty deck",
            condition: (context) => context.game.isDuringConflict(),
            cost: AbilityDsl.costs.nameCard(),
            gameAction: AbilityDsl.actions.sequential([
                AbilityDsl.actions.playerLastingEffect((context) => ({
                    duration: Durations.UntilPassPriority,
                    targetController: context.player,
                    effect: AbilityDsl.effects.reduceNextPlayedCardCost(
                        3,
                        (card: BaseCard) => card.name === context.costs.nameCardCost
                    )
                })),
                AbilityDsl.actions.deckSearch((context) => ({
                    amount: 3,
                    deck: Decks.DynastyDeck,
                    player: context.player.opponent,
                    choosingPlayer: context.player,
                    shuffle: false,
                    cardCondition: (card) => card.type === CardTypes.Character && !card.isUnique(),
                    gameAction: AbilityDsl.actions.playCard((deckSearchContext) => {
                        const target = deckSearchContext.targets[0];
                        return {
                            target,
                            source: this,
                            resetOnCancel: false,
                            playType: PlayTypes.PlayFromHand,
                            playAction: target
                                ? [
                                      new PlayCharacterAsIfFromHandIntoConflict(target),
                                      new PlayDisguisedCharacterAsIfFromHandIntoConflict(target)
                                  ]
                                : undefined,
                            ignoredRequirements: ['phase'],
                            postHandler: () => context.player.moveCard(context.source, Locations.ConflictDiscardPile)
                        };
                    }),
                    remainingCardsHandler: (context, event, cards) => {
                        context.game.addMessage(
                            "{0} puts {1} on the top of {2}' dynasty deck",
                            context.player,
                            cards,
                            context.player.opponent
                        );
                    },
                    message: '{0}{1}{2}{3}',
                    messageArgs: (context, selectedCards) => [
                        context.player,
                        selectedCards.length > 0 ? ' compels ' : ' takes nothing',
                        selectedCards,
                        selectedCards.length > 0 ? ' into service' : ''
                    ]
                }))
            ]),
            effect: "look for a character on the top of {1}'s dynasty deck. They reveal {2}",
            effectArgs: (context) => [context.player.opponent, context.player.opponent.dynastyDeck.first(3)]
        });
    }
}