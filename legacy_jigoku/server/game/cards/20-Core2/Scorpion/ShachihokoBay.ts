import { AbilityContext } from '../../../AbilityContext';
import { Locations } from '../../../Constants';
import { ProvinceCard } from '../../../ProvinceCard';
import AbilityDsl from '../../../abilitydsl';
import type DrawCard from '../../../drawcard';

class Process {
    private topCards: Set<DrawCard>;
    private cardsToSteal: Set<DrawCard> = new Set();
    private newTopOrder: Array<DrawCard> = [];

    public constructor(private context: AbilityContext) {
        this.topCards = new Set(context.player.opponent.conflictDeck.first(6));
    }

    public start() {
        if (this.topCards.size > 0) {
            this.stealPrompt();
        }
    }

    private get topCardsArray() {
        return Array.from(this.topCards);
    }

    private stealPrompt() {
        const x = this.cardsToSteal.size + 1;
        const y = Math.min(3, this.topCards.size);
        this.context.game.promptWithHandlerMenu(this.context.player, {
            activePromptTitle: `Select a card to take for you (${x} of ${y})`,
            context: this.context,
            cards: this.topCardsArray,
            cardHandler: (card: DrawCard) => this.stealChosen(card),
            choices: ['Done'],
            handlers: [() => this.stealCardsAndContinue()]
        });
    }

    private stealChosen(card: DrawCard): void {
        this.topCards.delete(card);
        this.cardsToSteal.add(card);
        if (this.cardsToSteal.size < 3) {
            this.stealPrompt();
        } else {
            this.stealCardsAndContinue();
        }
    }

    private stealCardsAndContinue() {
        if (this.cardsToSteal.size > 0) {
            this.context.game.addMessage(
                "{0} takes {1} from {2}'s deck",
                this.context.player,
                Array.from(this.cardsToSteal),
                this.context.player.opponent
            );
            for (const card of this.cardsToSteal) {
                card.owner.removeCardFromPile(card);
                card.moveTo(Locations.RemovedFromGame);
                this.context.player.removedFromGame.unshift(card);
                this.context.source.lastingEffect(() => ({
                    until: {
                        onCardMoved: (event: any) =>
                            event.card === card && event.originalLocation === Locations.RemovedFromGame
                    },
                    match: card,
                    effect: [AbilityDsl.effects.canPlayFromOwn(Locations.RemovedFromGame, [card], this.context.source)]
                }));
            }
        }

        if (this.topCards.size > 0) {
            this.reorderPrompt();
        }
    }

    private reorderPrompt() {
        this.context.game.promptWithHandlerMenu(this.context.player, {
            activePromptTitle: `Select a card to put in the ${this.positionWord()} position of their deck`,
            context: this.context,
            cards: this.topCardsArray,
            cardHandler: (card: DrawCard) => this.markNextOnTop(card),
            choices: [],
            handlers: []
        });
    }

    private positionWord(): string {
        switch (this.newTopOrder.length) {
            case 0:
                return 'top';
            case 1:
                return 'second';
            case 2:
                return 'third';
            default:
                return 'next';
        }
    }

    private markNextOnTop(card: DrawCard): void {
        this.topCards.delete(card);
        this.newTopOrder.push(card);
        if (this.topCards.size > 0) {
            this.reorderPrompt();
        } else {
            this.reorderCardsAndContinue();
        }
    }

    private reorderCardsAndContinue() {
        if (this.newTopOrder.length === 0) {
            console.log('OI');
            return;
        }
        this.context.game.addMessage(
            "{0} returns {1} cards to the top of {2}'s deck",
            this.context.player,
            this.newTopOrder.length,
            this.context.player.opponent
        );

        this.context.player.opponent.conflictDeck.splice(0, this.newTopOrder.length, ...this.newTopOrder);
    }
}

export default class ShachihokoBay extends ProvinceCard {
    static id = 'shachihoko-bay';

    setupCardAbilities() {
        this.interrupt({
            title: "Look at the top 6 cards of the attacker's deck and steal up to 3 of them",
            when: {
                onBreakProvince: (event, context) =>
                    event.card === context.source && context.game.currentConflict && Boolean(context.player.opponent)
            },
            gameAction: AbilityDsl.actions.handler({
                handler: (context) => new Process(context).start()
            })
        });
    }
}