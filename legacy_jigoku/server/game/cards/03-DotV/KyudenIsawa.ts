import { CardTypes, Locations, PlayTypes, Players } from '../../Constants';
import { StrongholdCard } from '../../StrongholdCard';
import AbilityDsl from '../../abilitydsl';

export default class KyudenIsawa extends StrongholdCard {
    static id = 'kyuden-isawa';

    setupCardAbilities() {
        this.action({
            title: 'Play a spell event from discard',
            cost: [
                AbilityDsl.costs.bowSelf(),
                AbilityDsl.costs.discardCard({
                    cardCondition: (card) => card.hasTrait('spell') && card.type === CardTypes.Event
                })
            ],
            condition: () => this.game.isDuringConflict(),
            effect: 'play a spell event from discard',
            gameAction: AbilityDsl.actions.selectCard((context) => ({
                activePromptTitle: 'Choose a spell event',
                cardType: CardTypes.Event,
                controller: Players.Self,
                location: Locations.ConflictDiscardPile,
                cardCondition: (card) => card.hasTrait('spell'),
                gameAction: AbilityDsl.actions.playCard({
                    resetOnCancel: true,
                    source: this,
                    playType: PlayTypes.PlayFromHand,
                    postHandler: (spellContext) => {
                        const card = spellContext.source;
                        context.game.addMessage("{0} is removed from the game by {1}'s ability", card, context.source);
                        context.player.moveCard(card, Locations.RemovedFromGame);
                    }
                })
            }))
        });
    }
}
