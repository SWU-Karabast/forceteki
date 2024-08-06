import AbilityDsl from '../../../abilitydsl';
import { Locations } from '../../../Constants';
import DrawCard from '../../../drawcard';

function optionText(cards: Array<DrawCard>): string {
    const names = new Map<string, number>();
    for (const card of cards) {
        names.set(card.name, (names.get(card.name) ?? 0) + 1);
    }

    return Array.from(names.entries())
        .map(([name, count]) => (count > 1 ? `${name} (${count})` : name))
        .join(', ');
}

function drawPileAndShuffleRest(cardsToHand: Array<DrawCard>, cardsToDeck: Array<DrawCard>) {
    return AbilityDsl.actions.sequential([
        AbilityDsl.actions.moveCard({ target: cardsToHand, destination: Locations.Hand }),
        AbilityDsl.actions.returnToDeck({ target: cardsToDeck, shuffle: true })
    ]);
}

export default class DrawingTheVoid extends DrawCard {
    static id = 'drawing-the-void';

    setupCardAbilities() {
        this.wouldInterrupt({
            title: 'Choose which cards to draw',
            when: {
                onCardsDrawn: (event, context) =>
                    event.player === context.player && context.player.isTraitInPlay('shugenja')
            },
            gameAction: AbilityDsl.actions.cancel({
                effect: 'choose between two piles of cards to draw',
                replacementGameAction: AbilityDsl.actions.chooseAction((context) => {
                    const pileSize: number = (context as any).event.amount;
                    const topCards: Array<DrawCard> = context.player.conflictDeck.first(pileSize);
                    const bottomCards: Array<DrawCard> = context.player.conflictDeck.last(pileSize);
                    return {
                        options: {
                            [optionText(topCards)]: { action: drawPileAndShuffleRest(topCards, bottomCards) },
                            [optionText(bottomCards)]: { action: drawPileAndShuffleRest(bottomCards, topCards) }
                        },
                        activePromptTitle: 'Choose a pile of cards to draw',
                        effect: ''
                    };
                })
            }),
            then: () => ({
                gameAction: AbilityDsl.actions.onAffinity({
                    trait: 'void',
                    gameAction: AbilityDsl.actions.draw(),
                    effect: 'draw an extra card'
                })
            })
        });
    }
}