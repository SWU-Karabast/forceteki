import AbilityDsl from '../../../abilitydsl';
import { Locations } from '../../../Constants';
import DrawCard from '../../../drawcard';
import { parseGameMode } from '../../../GameMode';

const ACTIVE_LOCATIONS = [Locations.Hand, Locations.PlayArea];

export default class LuckyCoin extends DrawCard {
    static id = 'lucky-coin';

    setupCardAbilities() {
        this.reaction({
            title: 'Replace all cards in your provinces',
            when: {
                onRevealFacedownDynastyCards: (_, context) => {
                    const totalCost = context.player
                        .getDynastyCardsInProvince(Locations.Provinces)
                        .reduce((totalCost: number, card: DrawCard) => {
                            const cost = !card.facedown && !isNaN(card.printedCost) ? card.printedCost : 0;
                            return totalCost + cost;
                        }, 0);
                    return totalCost < 6 || totalCost > 12;
                }
            },
            cost: AbilityDsl.costs.removeSelfFromGame({ location: ACTIVE_LOCATIONS }),
            location: ACTIVE_LOCATIONS,
            gameAction: AbilityDsl.actions.handler({
                handler: ({ player, game }) => {
                    const cardsToMulligan = player.getDynastyCardsInProvince(Locations.Provinces);

                    for (const nonStrongholdProvince of parseGameMode(game.gameMode).setupNonStrongholdProvinces) {
                        if (player.dynastyDeck.size() > 0) {
                            player.moveCard(player.dynastyDeck.first(), nonStrongholdProvince);
                        }
                    }

                    for (const card of cardsToMulligan) {
                        const originalLocation = card.location;
                        player.moveCard(card, 'dynasty deck bottom');
                        player.replaceDynastyCard(originalLocation);
                    }
                    player.shuffleDynastyDeck();
                }
            }),
            effect: 'to replace all cards in their provinces'
        });
    }
}