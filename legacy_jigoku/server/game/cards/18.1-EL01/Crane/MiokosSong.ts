import { CardTypes, Locations, Players } from '../../../Constants';
import { StrongholdCard } from '../../../StrongholdCard';
import AbilityDsl from '../../../abilitydsl';
import { ProvinceCard } from '../../../ProvinceCard';
import DrawCard from '../../../drawcard';

export default class MiokosSong extends StrongholdCard {
    static id = 'mioko-s-song';

    setupCardAbilities() {
        this.persistentEffect({
            match: (card, context) =>
                card.controller === context.player &&
                card.type === CardTypes.Character &&
                card.isDishonored &&
                card.isFaction('crane'),
            effect: AbilityDsl.effects.modifyBothSkills(1)
        });

        this.reaction({
            title: "Sabotage the opponent's resources",
            when: {
                onCardPlayed: (event, context) =>
                    context.player.opponent &&
                    event.player === context.player &&
                    event.card.type === CardTypes.Character
            },
            cost: [
                AbilityDsl.costs.bowSelf(),
                AbilityDsl.costs.dishonor({ cardCondition: (card, context: any) => card == context.event.card })
            ],
            target: {
                location: Locations.Provinces,
                controller: Players.Opponent,
                cardType: CardTypes.Province,
                gameAction: AbilityDsl.actions.handler({
                    handler: (context) => {
                        const province: ProvinceCard = context.target;
                        const topCards: Array<DrawCard> = context.player.opponent.dynastyDeck.slice(0, 2);
                        this.game.promptWithHandlerMenu(context.player, {
                            activePromptTitle: 'Which card do you want to put in the province?',
                            context: context,
                            cards: topCards,
                            choices: [],
                            handlers: [],
                            cardHandler: (selectedCard: DrawCard) => {
                                const cardsFromProvince = province.cardsInSelf();
                                for (const fromProvince of cardsFromProvince) {
                                    context.player.opponent.moveCard(fromProvince, 'dynasty discard pile');
                                }
                                context.player.opponent.moveCard(selectedCard, province.location);
                                selectedCard.facedown = false;
                                for (const goToBottom of topCards.filter((c) => c !== selectedCard)) {
                                    context.player.opponent.moveCard(goToBottom, 'dynasty deck bottom');
                                }

                                context.game.addMessage(
                                    '{0} puts {1} into {2}, discarding {3}',
                                    context.player,
                                    selectedCard,
                                    province.location,
                                    cardsFromProvince
                                );
                            }
                        });
                    }
                })
            }
        });
    }
}