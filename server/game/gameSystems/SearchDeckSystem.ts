// allow block comments without spaces so we can have compact jsdoc descriptions in this file
/* eslint @stylistic/js/lines-around-comment: off */

import type { AbilityContext } from '../core/ability/AbilityContext.js';
import { Card } from '../core/card/Card.js';
import { EventName, Location, TargetMode } from '../core/Constants.js';
import { GameEvent } from '../core/event/GameEvent.js';
import { GameSystem, IGameSystemProperties } from '../core/gameSystem/GameSystem.js';
import { shuffleDeck } from './GameSystemLibrary.js';
import { IPlayerTargetSystemProperties, PlayerTargetSystem } from '../core/gameSystem/PlayerTargetSystem.js';
import Player from '../core/Player.js';
import { shuffleArray } from '../core/utils/Helpers.js';

type Derivable<T> = T | ((context: AbilityContext) => T);

export interface ISearchDeckProperties extends IPlayerTargetSystemProperties {
    targetMode?: TargetMode.UpTo | TargetMode.Single | TargetMode.UpToVariable | TargetMode.Unlimited | TargetMode.Exactly | TargetMode.ExactlyVariable;
    activePromptTitle?: string;
    /** The number of cards from the top of the deck to search, or a function to determine how many cards to search. Default is -1, which indicates the whole deck. */
    searchCount?: number | ((context: AbilityContext) => number);
    /** The number of cards to select from the search, or a function to determine how many cards to select. Default is 1. The targetMode will interact with this to determine the min/max number of cards to retrieve. */
    selectCount?: number | ((context: AbilityContext) => number);
    revealSelected?: boolean;
    shuffleWhenDone?: boolean | ((context: AbilityContext) => boolean);
    title?: string;
    /** This determines what to do with the selected cards. */
    chosenCardsImmediateEffect?: GameSystem<IGameSystemProperties>;
    message?: string;
    chosenCardsMustHaveUniqueNames?: boolean;
    player?: Player;
    choosingPlayer?: Player;
    messageArgs?: (context: AbilityContext, cards: Card[]) => any | any[];
    selectedCardsHandler?: (context: AbilityContext, event: any, cards: Card[]) => void;
    remainingCardsHandler?: (context: AbilityContext, event: any, cards: Card[]) => void;
    cardCondition?: (card: Card, context: AbilityContext) => boolean;
    chooseNothingImmediateEffect?: GameSystem<IGameSystemProperties>;
}

export class SearchDeckSystem extends PlayerTargetSystem<ISearchDeckProperties> {
    public override readonly name = 'deckSearch';
    public override readonly eventName = EventName.OnDeckSearch;
    public override readonly costDescription: string = '';
    public override readonly effectDescription: string = '';

    protected override defaultProperties: ISearchDeckProperties = {
        searchCount: -1,
        selectCount: 1,
        targetMode: TargetMode.UpTo,
        selectedCardsHandler: null,
        chooseNothingImmediateEffect: null,
        shuffleWhenDone: false,
        revealSelected: true,
        chosenCardsMustHaveUniqueNames: false,
        cardCondition: () => true,
        remainingCardsHandler: this.handleRemainingCardsDefault
    };

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    public override eventHandler(event): void { }

    public override hasLegalTarget(context: AbilityContext, additionalProperties = {}): boolean {
        const properties = this.generatePropertiesFromContext(context, additionalProperties) as ISearchDeckProperties;
        if (this.computeSearchCount(properties.searchCount, context) === 0) {
            return false;
        }
        const player = properties.player || context.player;
        return this.getDeck(player).length > 0 && super.canAffect(player, context);
    }

    public override generatePropertiesFromContext(context: AbilityContext, additionalProperties = {}): ISearchDeckProperties {
        const properties = super.generatePropertiesFromContext(context, additionalProperties) as ISearchDeckProperties;

        properties.cardCondition = properties.cardCondition || (() => true);
        return properties;
    }

    public override getEffectMessage(context: AbilityContext): [string, any[]] {
        const properties = this.generatePropertiesFromContext(context);
        const searchCountAmount = this.computeSearchCount(properties.searchCount, context);
        const message =
        searchCountAmount > 0
            ? `look at the top ${searchCountAmount === 1 ? 'card' : `${searchCountAmount} cards`} of their deck`
            : 'search their deck';
        return [message, []];
    }

    public override canAffect(player: Player, context: AbilityContext, additionalProperties = {}): boolean {
        const properties = this.generatePropertiesFromContext(context, additionalProperties) as ISearchDeckProperties;
        const searchCountAmount = this.computeSearchCount(properties.searchCount, context);
        return searchCountAmount !== 0 && this.getDeck(player).length > 0 && super.canAffect(player, context);
    }

    public override defaultTargets(context: AbilityContext): Player[] {
        return [context.player];
    }

    public override addPropertiesToEvent(event: any, player: Player, context: AbilityContext, additionalProperties: any): void {
        const { searchCount } = this.generatePropertiesFromContext(context, additionalProperties) as ISearchDeckProperties;
        const searchCountAmount = this.computeSearchCount(searchCount, context);
        super.addPropertiesToEvent(event, player, context, additionalProperties);
        event.amount = searchCountAmount;
    }

    public override generateEventsForAllTargets(context: AbilityContext, additionalProperties = {}): GameEvent[] {
        const events: GameEvent[] = [];

        const properties = this.generatePropertiesFromContext(context, additionalProperties);
        const player = properties.player || context.player;
        const event = this.generateEvent(player, context, additionalProperties) as any;
        const deckLength = this.getDeck(player).length;
        const amount = event.amount === -1 ? deckLength : event.amount > deckLength ? deckLength : event.amount;
        let cards = this.getDeck(player).slice(0, amount);
        if (event.amount === -1) {
            cards = cards.filter((card) => properties.cardCondition(card, context));
        }
        events.push(event);
        this.selectCard(event, additionalProperties, cards, new Set());

        return events;
    }

    private getNumCards(numCards: Derivable<number>, context: AbilityContext): number {
        return typeof numCards === 'function' ? numCards(context) : numCards;
    }

    private computeSearchCount(searchCount: Derivable<number>, context: AbilityContext): number {
        return typeof searchCount === 'function' ? searchCount(context) : searchCount;
    }

    private shouldShuffle(shuffle: Derivable<boolean>, context: AbilityContext): boolean {
        return typeof shuffle === 'function' ? shuffle(context) : shuffle;
    }

    private getDeck(player: Player): Card[] {
        return player.drawDeck;
    }

    private selectCard(event: any, additionalProperties: any, cards: Card[], selectedCards: Set<Card>): void {
        const context: AbilityContext = event.context;
        const properties = this.generatePropertiesFromContext(context, additionalProperties) as ISearchDeckProperties;
        const canCancel = properties.targetMode !== TargetMode.Exactly;
        let selectAmount = 1;
        const choosingPlayer = properties.choosingPlayer || event.player;

        if (properties.targetMode === TargetMode.UpTo || properties.targetMode === TargetMode.UpToVariable) {
            selectAmount = this.getNumCards(properties.selectCount, context);
        }
        if (properties.targetMode === TargetMode.Single) {
            selectAmount = 1;
        }
        if (properties.targetMode === TargetMode.Exactly || properties.targetMode === TargetMode.ExactlyVariable) {
            selectAmount = this.getNumCards(properties.selectCount, context);
        }
        if (properties.targetMode === TargetMode.Unlimited) {
            selectAmount = -1;
        }

        let title = properties.activePromptTitle;
        if (!properties.activePromptTitle) {
            title = 'Select a card' + (properties.revealSelected ? ' to reveal' : '');
            if (selectAmount < 0 || selectAmount > 1) {
                title =
                    `Select ${selectAmount < 0 ? 'all' : 'up to ' + selectAmount} cards` +
                    (properties.revealSelected ? ' to reveal' : '');
            }
        }

        // TODO: I don't think this actually does anything. Further research needed
        // if (properties.shuffleWhenDone) {
        //     cards.sort((a, b) => a.name.localeCompare(b.name));
        // }

        context.game.promptWithHandlerMenu(choosingPlayer, {
            activePromptTitle: title,
            context: context,
            cards: cards,
            cardCondition: (card: Card, context: AbilityContext) =>
                properties.cardCondition(card, context) &&
                (!properties.chosenCardsMustHaveUniqueNames || !Array.from(selectedCards).some((sel) => sel.name === card.name)) &&
                (!properties.chosenCardsImmediateEffect || properties.chosenCardsImmediateEffect.canAffect(card, context, additionalProperties)),
            choices: canCancel ? (selectedCards.size > 0 ? ['Done'] : ['Take nothing']) : [],
            handlers: [() => this.handleDone(properties, context, event, selectedCards, cards)],
            cardHandler: (card: Card) => {
                const newSelectedCards = new Set(selectedCards);
                newSelectedCards.add(card);
                const index = cards.indexOf(card, 0);
                if (index > -1) {
                    cards.splice(index, 1);
                }
                if ((selectAmount < 0 || newSelectedCards.size < selectAmount) && cards.length > 0) {
                    this.selectCard(event, additionalProperties, cards, newSelectedCards);
                } else {
                    this.handleDone(properties, context, event, newSelectedCards, cards);
                }
            }
        });
    }

    private handleDone(properties: ISearchDeckProperties, context: AbilityContext, event: any, selectedCards: Set<Card>, allCards: Card[]): void {
        event.selectedCards = Array.from(selectedCards);
        context.selects['deckSearch'] = Array.from(selectedCards);
        if (properties.selectedCardsHandler === null) {
            this.defaultDoneHandle(properties, context, event, selectedCards);
        } else {
            properties.selectedCardsHandler(context, event, Array.from(selectedCards));
        }

        const cardsToMove = allCards.filter((card) => !selectedCards.has(card));
        properties.remainingCardsHandler(context, event, cardsToMove);

        if (this.shouldShuffle(this.properties.shuffleWhenDone, context)) {
            context.game.openEventWindow([
                shuffleDeck().generateEvent(context.target, context)
            ]);
        }
    }

    private handleRemainingCardsDefault(context: AbilityContext, event: any, cardsToMove: Card[]) {
        if (cardsToMove.length > 0) {
            shuffleArray(cardsToMove);
            for (const card of cardsToMove) {
                event.player.moveCard(card, Location.Deck, { bottom: true });
            }
            context.game.addMessage(
                '{0} puts {1} card{2} on the bottom of their deck',
                event.player,
                cardsToMove.length,
                cardsToMove.length > 1 ? 's' : ''
            );
        }
    }

    private defaultDoneHandle(properties: ISearchDeckProperties, context: AbilityContext, event: any, selectedCards: Set<Card>): void {
        this.handleDoneMessage(properties, context, event, selectedCards);

        const gameSystem = this.generatePropertiesFromContext(event.context).chosenCardsImmediateEffect;
        if (gameSystem) {
            const selectedArray = Array.from(selectedCards);
            event.context.targets = selectedArray;
            gameSystem.setDefaultTargetFn(() => selectedArray);
            context.game.queueSimpleStep(() => {
                if (gameSystem.hasLegalTarget(context)) {
                    gameSystem.resolve(null, context);
                }
            }, 'resolve effect on searched cards');
        }
    }

    private handleDoneMessage(properties: ISearchDeckProperties, context: AbilityContext, event: any, selectedCards: Set<Card>): void {
        const choosingPlayer = properties.choosingPlayer || event.player;
        if (selectedCards.size > 0 && properties.message) {
            const args = properties.messageArgs ? properties.messageArgs(context, Array.from(selectedCards)) : [];
            return context.game.addMessage(properties.message, ...args);
        }

        if (selectedCards.size === 0) {
            return this.handleTakeNothing(properties, context, event);
        }

        if (properties.revealSelected) {
            return context.game.addMessage('{0} takes {1}', choosingPlayer, Array.from(selectedCards));
        }

        context.game.addMessage(
            '{0} takes {1} {2}',
            choosingPlayer,
            selectedCards.size,
            selectedCards.size > 1 ? 'cards' : 'card'
        );
    }

    private handleTakeNothing(properties: ISearchDeckProperties, context: AbilityContext, event: any) {
        const choosingPlayer = properties.choosingPlayer || event.player;
        context.game.addMessage('{0} takes nothing', choosingPlayer);
        if (properties.chooseNothingImmediateEffect) {
            context.game.queueSimpleStep(() => {
                if (properties.chooseNothingImmediateEffect.hasLegalTarget(context)) {
                    properties.chooseNothingImmediateEffect.resolve(null, context);
                }
            });
        }
    }
}