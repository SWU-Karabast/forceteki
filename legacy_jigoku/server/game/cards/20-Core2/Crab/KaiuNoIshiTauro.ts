import { CardTypes, Locations, Players, Decks } from '../../../Constants';
import AbilityDsl from '../../../abilitydsl';
import DrawCard from '../../../drawcard';

export default class KaiuNoIshiTauro extends DrawCard {
    static id = 'kaiu-no-ishi-tauro';

    setupCardAbilities() {
        this.action({
            title: 'Return rings to fetch an attachment',
            cost: AbilityDsl.costs.returnRings(),
            target: {
                cardType: CardTypes.Character,
                controller: Players.Self,
                gameAction: AbilityDsl.actions.deckSearch(context => ({
                    activePromptTitle: 'Select an attachment',
                    deck: Decks.ConflictDeck,
                    cardCondition: card => card.type === CardTypes.Attachment &&
                        (card.hasTrait('weapon') || card.hasTrait('armor') || card.hasTrait('item')) &&
                        (context.game.actions.attach({ attachment: card }).canAffect(context.target, context)) &&
                        card.costLessThan(context.costs.returnRing ? context.costs.returnRing.length + 1 : 1),
                    shuffle: true,
                    reveal: true,
                    selectedCardsHandler: (context, event, cards) => {
                        const card = cards[0];
                        if (!card) {
                            context.game.addMessage('{0} takes nothing', context.player);
                            return;
                        }

                        context.game.addMessage(
                            '{0} takes {1} and attaches it to {2}',
                            event.player,
                            card,
                            context.target
                        );
                        context.game.queueSimpleStep(() =>
                            AbilityDsl.actions
                                .attach({ target: context.target, attachment: card })
                                .resolve(null, context)
                        );
                    }
                }))
            },
            effect: 'search their deck for an attachment costing {1} or less and attach it to {0}',
            effectArgs: (context) => context.costs.returnRing.length,
        });
    }
}
