import { GameModes } from '../../../GameModes';
import { CardTypes, TargetModes, Decks, Locations, Players } from '../../Constants';
import AbilityDsl from '../../abilitydsl';
import DrawCard from '../../drawcard';

export default class KaiuShihobu extends DrawCard {
    static id = 'kaiu-shihobu';

    setupCardAbilities() {
        this.reaction({
            title: 'Look at your dynasty deck',
            when: {
                onCharacterEntersPlay: (event, context) =>
                    event.card === context.source && context.game.gameMode !== GameModes.Skirmish
            },
            gameAction: AbilityDsl.actions.deckSearch({
                cardCondition: (card) => card.type === CardTypes.Holding,
                targetMode: TargetModes.Unlimited,
                deck: Decks.DynastyDeck,
                selectedCardsHandler: (context, event, cards) => {
                    if (cards.length > 0) {
                        this.game.addMessage('{0} selects {1}', event.player, cards);
                        cards.forEach((card) => {
                            event.player.stronghold.addChildCard(card, Locations.UnderneathStronghold);
                            event.player.moveCard(card, Locations.UnderneathStronghold);
                            card.lastingEffect(() => ({
                                until: {
                                    onCardMoved: (event) =>
                                        event.card === card && event.originalLocation === Locations.UnderneathStronghold
                                },
                                match: card,
                                effect: [AbilityDsl.effects.hideWhenFaceUp()]
                            }));
                        });
                    } else {
                        this.game.addMessage('{0} selects no holdings', event.player);
                    }
                }
            })
        });

        this.action({
            title: 'Put a holding in a province',
            condition: (context) => context.game.gameMode !== GameModes.Skirmish,
            targets: {
                first: {
                    activePromptTitle: 'Choose a holding',
                    cardType: CardTypes.Holding,
                    controller: Players.Self,
                    location: Locations.UnderneathStronghold,
                    cardCondition: (card: DrawCard, context) => context.player.stronghold.childCards.includes(card)
                },
                second: {
                    activePromptTitle: 'Choose an unbroken province',
                    dependsOn: 'first',
                    optional: false,
                    cardType: CardTypes.Province,
                    location: Locations.Provinces,
                    controller: Players.Self,
                    cardCondition: (card) => card.location !== Locations.StrongholdProvince && !card.isBroken
                }
            },
            handler: (context) => {
                let holding = context.targets.first;
                let province = context.targets.second;

                let cards = context.player.getDynastyCardsInProvince(province.location);
                context.player.stronghold.removeChildCard(holding, province.location);
                holding.facedown = false;
                cards.forEach((card) => {
                    context.player.moveCard(card, Locations.DynastyDiscardPile);
                });
            },
            effect: 'discard {1}, replacing {2} with {3}',
            effectArgs: (context) => [
                context.player.getDynastyCardsInProvince(context.targets.second.location),
                context.player.getDynastyCardsInProvince(context.targets.second.location).length > 1 ? 'them' : 'it',
                context.targets.first
            ]
        });
    }
}
