import AbilityDsl from '../../../abilitydsl';
import { Locations } from '../../../Constants';
import DrawCard from '../../../drawcard';

export default class HonestAssessment extends DrawCard {
    static id = 'honest-assessment';

    setupCardAbilities() {
        this.attachmentConditions({ trait: 'courtier' });

        this.reaction({
            title: 'Name a card',
            when: {
                onCardAttached: (event, context) =>
                    event.card === context.source && event.originalLocation !== Locations.PlayArea
            },
            cost: AbilityDsl.costs.nameCard(),
            max: AbilityDsl.limit.perRound(1),
            gameAction: AbilityDsl.actions.multipleContext((context) => {
                const hand: Array<DrawCard> = context.player.opponent.hand.shuffle();
                const cards = hand.slice(0, 4).sort((a, b) => a.name.localeCompare(b.name));
                return {
                    gameActions: [
                        AbilityDsl.actions.lookAt({ target: cards }),
                        AbilityDsl.actions.discardMatching({
                            target: context.player.opponent,
                            cards,
                            amount: -1, //all
                            reveal: false,
                            match: (context, card) => card.name === context.costs.nameCardCost
                        })
                    ]
                };
            }),
            effect: "look at 4 random cards in {1}'s hand and discard all cards named {2}",
            effectArgs: (context) => [context.player.opponent, context.costs.nameCardCost]
        });
    }
}
