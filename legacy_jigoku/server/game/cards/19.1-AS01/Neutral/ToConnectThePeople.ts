import type { AbilityContext } from '../../../AbilityContext';
import AbilityDsl from '../../../abilitydsl';
import { CardTypes, Locations, Players, TargetModes } from '../../../Constants';
import DrawCard from '../../../drawcard';
import { PlayCharacterAsIfFromHand } from '../../../PlayCharacterAsIfFromHand';
import { PlayDisguisedCharacterAsIfFromHand } from '../../../PlayDisguisedCharacterAsIfFromHand';

export default class ToConnectThePeople extends DrawCard {
    static id = 'to-connect-the-people';

    public setupCardAbilities() {
        this.action({
            title: "Play a character from your opponent's discard pile",
            condition: (context) =>
                !context.game.isDuringConflict() &&
                (context.player.cardsInPlay as DrawCard[]).some(
                    (card) => card.getType() === CardTypes.Character && card.hasTrait('merchant')
                ),
            gameAction: AbilityDsl.actions.sequential([
                AbilityDsl.actions.discardCard((context) => ({
                    target: context.player.opponent && context.player.opponent.dynastyDeck.first(3)
                })),
                AbilityDsl.actions.selectCard({
                    cardType: CardTypes.Character,
                    controller: Players.Opponent,
                    location: [Locations.ConflictDiscardPile, Locations.DynastyDiscardPile],
                    targets: true,
                    cardCondition: (card, context) => !card.isUnique() && card.glory <= this.maxMerchantGlory(context),
                    mode: TargetModes.Single,
                    gameAction: AbilityDsl.actions.sequential([
                        AbilityDsl.actions.cardLastingEffect({
                            effect: [
                                AbilityDsl.effects.gainPlayAction(PlayCharacterAsIfFromHand),
                                AbilityDsl.effects.gainPlayAction(PlayDisguisedCharacterAsIfFromHand)
                            ]
                        }),
                        AbilityDsl.actions.playCard({ ignoredRequirements: ['location'] })
                    ])
                })
            ]),
            max: AbilityDsl.limit.perRound(1)
        });
    }

    private maxMerchantGlory(context: AbilityContext) {
        return (context.player.cardsInPlay as DrawCard[]).reduce(
            (maxGlory, card) =>
                card.getType() === CardTypes.Character && card.hasTrait('merchant') && card.glory > maxGlory
                    ? card.glory
                    : maxGlory,
            0
        );
    }
}
