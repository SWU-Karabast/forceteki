// allow block comments without spaces so we can have compact jsdoc descriptions in this file
/* eslint @stylistic/lines-around-comment: off */

import type { AbilityContext } from '../core/ability/AbilityContext.js';
import { Card } from '../core/card/Card.js';
import { EventName, Location, TargetMode } from '../core/Constants.js';
import { GameEvent } from '../core/event/GameEvent.js';
import { GameSystem, IGameSystemProperties } from '../core/gameSystem/GameSystem.js';
import { shuffleDeck } from './GameSystemLibrary.js';
import { IPlayerTargetSystemProperties, PlayerTargetSystem } from '../core/gameSystem/PlayerTargetSystem.js';
import Player from '../core/Player.js';
import { shuffleArray } from '../core/utils/Helpers.js';
import * as Contract from '../core/utils/Contract.js';

type Derivable<T, TContext extends AbilityContext = AbilityContext> = T | ((context: TContext) => T);

export interface ISearchDeckProperties<TContext extends AbilityContext = AbilityContext> extends IPlayerTargetSystemProperties {
    targetMode?: TargetMode.UpTo | TargetMode.Single | TargetMode.UpToVariable | TargetMode.Unlimited | TargetMode.Exactly | TargetMode.ExactlyVariable;
    activePromptTitle?: string;

    /** The number of cards from the top of the deck to search, or a function to determine how many cards to search. Default is -1, which indicates the whole deck. */
    searchCount?: number | ((context: TContext) => number);

    /** The number of cards to select from the search, or a function to determine how many cards to select. Default is 1. The targetMode will interact with this to determine the min/max number of cards to retrieve. */
    selectCount?: number | ((context: TContext) => number);
    revealSelected?: boolean;
    shuffleWhenDone?: boolean | ((context: TContext) => boolean);
    title?: string;

    /** This determines what to do with the selected cards (if a custom selectedCardsHandler is not provided). */
    selectedCardsImmediateEffect?: GameSystem<TContext>;
    message?: string;
    chosenCardsMustHaveUniqueNames?: boolean;
    player?: Player;
    choosingPlayer?: Player;
    messageArgs?: (context: TContext, cards: Card[]) => any | any[];

    /** Used to override default logic for handling the selected cards. The default utilizes the selectedCardsImmediateEffect */
    selectedCardsHandler?: (context: TContext, event: any, cards: Card[]) => void;

    /** Used to override default logic for handling the remaining cards. The default places them on the bottom of the deck. */
    remainingCardsHandler?: (context: TContext, event: any, cards: Card[]) => void;

    /** Used for filtering selection based on things like trait, type, etc. */
    cardCondition?: (card: Card, context: TContext) => boolean;
    chooseNothingImmediateEffect?: GameSystem<TContext>;
}

export class SearchDeckSystem<TContext extends AbilityContext = AbilityContext> extends PlayerTargetSystem<TContext, ISearchDeckProperties<TContext>> {
    public override readonly name = 'deckSearch';
    public override readonly eventName = EventName.OnDeckSearch;

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
        remainingCardsHandler: this.remainingCardsDefaultHandler
    };

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    public override eventHandler(event): void { }

    public override hasLegalTarget(context: TContext, additionalProperties = {}): boolean {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);
        if (this.computeSearchCount(properties.searchCount, context) === 0) {
            return false;
        }
        const player = properties.player || context.player;
        return this.getDeck(player).length > 0 && super.canAffect(player, context);
    }

    public override generatePropertiesFromContext(context: TContext, additionalProperties = {}) {
        const properties = super.generatePropertiesFromContext(context, additionalProperties);

        properties.cardCondition = properties.cardCondition || (() => true);
        return properties;
    }

    public override getEffectMessage(context: TContext): [string, any[]] {
        const properties = this.generatePropertiesFromContext(context);
        const searchCountAmount = this.computeSearchCount(properties.searchCount, context);
        const message =
        searchCountAmount > 0
            ? `look at the top ${searchCountAmount === 1 ? 'card' : `${searchCountAmount} cards`} of their deck`
            : 'search their deck';
        return [message, []];
    }

    public override defaultTargets(context: TContext): Player[] {
        return [context.player];
    }

    protected override addPropertiesToEvent(event: any, player: Player, context: TContext, additionalProperties: any): void {
        const { searchCount } = this.generatePropertiesFromContext(context, additionalProperties);
        const searchCountAmount = this.computeSearchCount(searchCount, context);
        super.addPropertiesToEvent(event, player, context, additionalProperties);
        event.amount = searchCountAmount;
    }

    public override queueGenerateEventGameSteps(events: GameEvent[], context: TContext, additionalProperties = {}): void {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);
        const player = properties.player || context.player;
        const event = this.generateEvent(player, context, additionalProperties) as any;
        const deckLength = this.getDeck(player).length;
        const amount = event.amount === -1 ? deckLength : (event.amount > deckLength ? deckLength : event.amount);
        let cards = this.getDeck(player).slice(0, amount);
        if (event.amount === -1) {
            cards = cards.filter((card) => properties.cardCondition(card, context));
        }
        this.selectCard(event, additionalProperties, cards, new Set());
        events.push(event);
    }

    private getNumCards(numCards: Derivable<number>, context: TContext): number {
        return typeof numCards === 'function' ? numCards(context) : numCards;
    }

    private computeSearchCount(searchCount: Derivable<number>, context: TContext): number {
        return typeof searchCount === 'function' ? searchCount(context) : searchCount;
    }

    private shouldShuffle(shuffle: Derivable<boolean>, context: TContext): boolean {
        return typeof shuffle === 'function' ? shuffle(context) : shuffle;
    }

    private getDeck(player: Player): Card[] {
        return player.drawDeck;
    }

    private selectCard(event: any, additionalProperties: any, cards: Card[], selectedCards: Set<Card>): void {
        const context: TContext = event.context;
        const properties = this.generatePropertiesFromContext(context, additionalProperties) as ISearchDeckProperties;
        const canCancel = properties.targetMode !== TargetMode.Exactly;
        let selectAmount = 1;
        const choosingPlayer = properties.choosingPlayer || event.player;

        switch (properties.targetMode) {
            case TargetMode.UpTo:
            case TargetMode.UpToVariable:
            case TargetMode.Exactly:
            case TargetMode.ExactlyVariable:
                selectAmount = this.getNumCards(properties.selectCount, context);
                break;
            case TargetMode.Unlimited:
                selectAmount = -1;
                break;
            case TargetMode.Single:
                selectAmount = 1;
                break;
            default:
                Contract.fail(`Invalid targetMode: ${properties.targetMode}`);
                break;
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
            cardCondition: (card: Card, context: TContext) =>
                properties.cardCondition(card, context) &&
                (!properties.chosenCardsMustHaveUniqueNames || !Array.from(selectedCards).some((sel) => sel.name === card.name)) &&
                (!properties.selectedCardsImmediateEffect || properties.selectedCardsImmediateEffect.canAffect(card, context, additionalProperties)),
            choices: canCancel ? (selectedCards.size > 0 ? ['Done'] : ['Take nothing']) : [],
            handlers: [() => this.onSearchComplete(properties, context, event, selectedCards, cards)],
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
                    this.onSearchComplete(properties, context, event, newSelectedCards, cards);
                }
            }
        });
    }

    private onSearchComplete(properties: ISearchDeckProperties, context: TContext, event: any, selectedCards: Set<Card>, allCards: Card[]): void {
        event.selectedCards = Array.from(selectedCards);
        context.selects['deckSearch'] = Array.from(selectedCards);
        this.searchCompleteHandler(properties, context, event, selectedCards);
        if (properties.selectedCardsHandler === null) {
            this.selectedCardsDefaultHandler(properties, context, event, selectedCards);
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

    private remainingCardsDefaultHandler(context: TContext, event: any, cardsToMove: Card[]) {
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

    private selectedCardsDefaultHandler(properties: ISearchDeckProperties, context: TContext, event: any, selectedCards: Set<Card>): void {
        const gameSystem = this.generatePropertiesFromContext(event.context).selectedCardsImmediateEffect;
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

    private searchCompleteHandler(properties: ISearchDeckProperties, context: TContext, event: any, selectedCards: Set<Card>): void {
        const choosingPlayer = properties.choosingPlayer || event.player;
        if (selectedCards.size > 0 && properties.message) {
            const args = properties.messageArgs ? properties.messageArgs(context, Array.from(selectedCards)) : [];
            return context.game.addMessage(properties.message, ...args);
        }

        if (selectedCards.size === 0) {
            return this.chooseNothingHandler(properties, context, event);
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

    private chooseNothingHandler(properties: ISearchDeckProperties, context: TContext, event: any) {
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