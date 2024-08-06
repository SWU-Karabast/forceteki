import { CardTypes, Players, Locations, TargetModes, Decks } from '../../../Constants';
import AbilityDsl from '../../../abilitydsl';
import DrawCard from '../../../drawcard';

export default class TennyosBlessing extends DrawCard {
    static id = 'tennyo-s-blessing';

    public setupCardAbilities() {
        this.action({
            title: 'Look at your dynasty deck',
            evenDuringDynasty: true,
            target: {
                cardType: CardTypes.Province,
                location: Locations.Provinces,
                controller: Players.Self,
                cardCondition: (card) => card.location !== Locations.StrongholdProvince,
                gameAction: AbilityDsl.actions.deckSearch({
                    targetMode: TargetModes.UpTo,
                    numCards: 2,
                    amount: 4,
                    shuffle: true,
                    deck: Decks.DynastyDeck,
                    selectedCardsHandler: (context, event, cards) => {
                        if (cards.length > 0) {
                            context.game.addMessage(
                                '{0} selects {1} and puts {2} into {3}',
                                event.player,
                                cards,
                                cards.length > 1 ? 'them' : 'it',
                                context.target.facedown ? context.target.location : context.target
                            );
                            cards.forEach((card) => {
                                event.player.moveCard(card, context.target.location);
                                card.facedown = false;
                            });
                        } else {
                            context.game.addMessage('{0} selects no cards', event.player);
                        }
                    }
                })
            }
        });
    }
}