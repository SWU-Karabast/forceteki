import type { AbilityContext } from '../AbilityContext';
import { Decks, EventNames, Locations, TargetModes } from '../Constants';
import { shuffleArray } from '../Utils/helpers';
import type DrawCard from '../drawcard';
import type { GameAction } from './GameAction';
import { PlayerAction, type PlayerActionProperties } from './PlayerAction';
import type Player = require('../player');

type Derivable<T> = T | ((context: AbilityContext) => T);

export interface DeckSearchProperties extends PlayerActionProperties {
    targetMode?: TargetModes;
    activePromptTitle?: string;
    amount?: number | ((context: AbilityContext) => number);
    numCards?: number | ((context: AbilityContext) => number);
    reveal?: boolean;
    deck?: Decks;
    shuffle?: boolean | ((context: AbilityContext) => boolean);
    title?: string;
    gameAction?: GameAction;
    message?: string;
    uniqueNames?: boolean;
    player?: Player;
    choosingPlayer?: Player;
    placeOnBottomInRandomOrder?: boolean;
    messageArgs?: (context: AbilityContext, cards: DrawCard[]) => any | any[];
    selectedCardsHandler?: (context: AbilityContext, event: any, cards: DrawCard[]) => void;
    remainingCardsHandler?: (context: AbilityContext, event: any, cards: DrawCard[]) => void;
    cardCondition?: (card: DrawCard, context: AbilityContext) => boolean;
    takesNothingGameAction?: GameAction;
}

export class DeckSearchAction extends PlayerAction {
    name = 'deckSearch';
    eventName = EventNames.OnDeckSearch;

    defaultProperties: DeckSearchProperties = {
        amount: -1,
        numCards: 1,
        targetMode: TargetModes.Single,
        deck: Decks.ConflictDeck,
        selectedCardsHandler: null,
        remainingCardsHandler: null,
        takesNothingGameAction: null,
        shuffle: true,
        reveal: true,
        uniqueNames: false,
        placeOnBottomInRandomOrder: false,
        cardCondition: () => true
    };

    hasLegalTarget(context: AbilityContext, additionalProperties = {}): boolean {
        const properties = this.getProperties(context, additionalProperties) as DeckSearchProperties;
        if (this.#getAmount(properties.amount, context) === 0) {
            return false;
        }
        const player = properties.player || context.player;
        return this.#getDeck(player, properties).length > 0 && super.canAffect(player, context);
    }

    getProperties(context: AbilityContext, additionalProperties = {}): DeckSearchProperties {
        const properties = super.getProperties(context, additionalProperties) as DeckSearchProperties;
        if (properties.reveal === undefined) {
            properties.reveal = properties.cardCondition !== undefined;
        }
        properties.cardCondition = properties.cardCondition || (() => true);
        return properties;
    }

    getEffectMessage(context: AbilityContext): [string, any[]] {
        const properties = this.getProperties(context);
        const amount = this.#getAmount(properties.amount, context);
        const message =
            amount > 0
                ? `look at the top ${amount === 1 ? 'card' : `${amount} cards`} of their deck`
                : 'search their deck';
        return [message, []];
    }

    canAffect(player: Player, context: AbilityContext, additionalProperties = {}): boolean {
        const properties = this.getProperties(context, additionalProperties) as DeckSearchProperties;
        const amount = this.#getAmount(properties.amount, context);
        return amount !== 0 && this.#getDeck(player, properties).length > 0 && super.canAffect(player, context);
    }

    defaultTargets(context: AbilityContext): Player[] {
        return [context.player];
    }

    addPropertiesToEvent(event: any, player: Player, context: AbilityContext, additionalProperties: unknown): void {
        const { amount } = this.getProperties(context, additionalProperties) as DeckSearchProperties;
        const fAmount = this.#getAmount(amount, context);
        super.addPropertiesToEvent(event, player, context, additionalProperties);
        event.amount = fAmount;
    }

    addEventsToArray(events: any[], context: AbilityContext, additionalProperties = {}): void {
        const properties = this.getProperties(context, additionalProperties) as DeckSearchProperties;
        const player = properties.player || context.player;
        const event = this.getEvent(player, context) as any;
        const amount = event.amount > -1 ? event.amount : this.#getDeck(player, properties).length;
        let cards = this.#getDeck(player, properties).slice(0, amount);
        if (event.amount === -1) {
            cards = cards.filter((card) => properties.cardCondition(card, context));
        }
        events.push(event);
        this.#selectCard(event, additionalProperties, cards, new Set());
    }

    #getNumCards(numCards: Derivable<number>, context: AbilityContext): number {
        return typeof numCards === 'function' ? numCards(context) : numCards;
    }

    #getAmount(amount: Derivable<number>, context: AbilityContext): number {
        return typeof amount === 'function' ? amount(context) : amount;
    }

    #shouldShuffle(shuffle: Derivable<boolean>, context: AbilityContext): boolean {
        return typeof shuffle === 'function' ? shuffle(context) : shuffle;
    }

    #getDeck(player: Player, properties: DeckSearchProperties): DrawCard[] {
        switch (properties.deck) {
            case Decks.DynastyDeck:
                return player.dynastyDeck.toArray();
            case Decks.ConflictDeck:
                return player.conflictDeck.toArray();
        }
    }

    #selectCard(event: any, additionalProperties: unknown, cards: DrawCard[], selectedCards: Set<DrawCard>): void {
        const context: AbilityContext = event.context;
        const properties = this.getProperties(context, additionalProperties) as DeckSearchProperties;
        const canCancel = properties.targetMode !== TargetModes.Exactly;
        let selectAmount = 1;
        const choosingPlayer = properties.choosingPlayer || event.player;

        if (properties.targetMode === TargetModes.UpTo || properties.targetMode === TargetModes.UpToVariable)
            selectAmount = this.#getNumCards(properties.numCards, context);
        if (properties.targetMode === TargetModes.Single) selectAmount = 1;
        if (properties.targetMode === TargetModes.Exactly || properties.targetMode === TargetModes.ExactlyVariable)
            selectAmount = this.#getNumCards(properties.numCards, context);
        if (properties.targetMode === TargetModes.Unlimited) selectAmount = -1;

        let title = properties.activePromptTitle;
        if (!properties.activePromptTitle) {
            title = 'Select a card' + (properties.reveal ? ' to reveal' : '');
            if (selectAmount < 0 || selectAmount > 1) {
                title =
                    `Select ${selectAmount < 0 ? 'all' : 'up to ' + selectAmount} cards` +
                    (properties.reveal ? ' to reveal' : '');
            }
        }

        if (properties.shuffle) {
            cards.sort((a, b) => a.name.localeCompare(b.name));
        }

        context.game.promptWithHandlerMenu(choosingPlayer, {
            activePromptTitle: title,
            context: context,
            cards: cards,
            cardCondition: (card: DrawCard, context: AbilityContext) =>
                properties.cardCondition(card, context) &&
                (!properties.uniqueNames || !Array.from(selectedCards).some((sel) => sel.name === card.name)) &&
                (!properties.gameAction || properties.gameAction.canAffect(card, context, additionalProperties)),
            choices: canCancel ? (selectedCards.size > 0 ? ['Done'] : ['Take nothing']) : [],
            handlers: [() => this.#handleDone(properties, context, event, selectedCards, cards)],
            cardHandler: (card: DrawCard) => {
                const newSelectedCards = new Set(selectedCards);
                newSelectedCards.add(card);
                const index = cards.indexOf(card, 0);
                if (index > -1) cards.splice(index, 1);
                if ((selectAmount < 0 || newSelectedCards.size < selectAmount) && cards.length > 0) {
                    this.#selectCard(event, additionalProperties, cards, newSelectedCards);
                } else {
                    this.#handleDone(properties, context, event, newSelectedCards, cards);
                }
            }
        });
    }

    #handleDone(
        properties: DeckSearchProperties,
        context: AbilityContext,
        event: any,
        selectedCards: Set<DrawCard>,
        allCards: DrawCard[]
    ): void {
        event.selectedCards = Array.from(selectedCards);
        context.selects['deckSearch'] = Array.from(selectedCards);
        if (properties.selectedCardsHandler === null) {
            this.#defaultHandleDone(properties, context, event, selectedCards);
        } else {
            properties.selectedCardsHandler(context, event, Array.from(selectedCards));
        }

        if (typeof properties.remainingCardsHandler === 'function') {
            const cardsToMove = allCards.filter((card) => !selectedCards.has(card));
            properties.remainingCardsHandler(context, event, cardsToMove);
        } else {
            this.#defaultRemainingCardsHandler(properties, context, event, selectedCards, allCards);
        }
    }

    #defaultRemainingCardsHandler(
        properties: DeckSearchProperties,
        context: AbilityContext,
        event: any,
        selectedCards: Set<DrawCard>,
        allCards: DrawCard[]
    ) {
        if (this.#shouldShuffle(properties.shuffle, context)) {
            switch (properties.deck) {
                case Decks.ConflictDeck:
                    return event.player.shuffleConflictDeck();
                case Decks.DynastyDeck:
                    return event.player.shuffleDynastyDeck();
                default:
                    return;
            }
        }

        if (properties.placeOnBottomInRandomOrder) {
            const cardsToMove = allCards.filter((card) => !selectedCards.has(card));
            if (cardsToMove.length > 0) {
                shuffleArray(cardsToMove);
                for (const card of cardsToMove) {
                    event.player.moveCard(card, Locations.ConflictDeck, { bottom: true });
                }
                context.game.addMessage(
                    '{0} puts {1} card{2} on the bottom of their conflict deck',
                    event.player,
                    cardsToMove.length,
                    cardsToMove.length > 1 ? 's' : ''
                );
            }
        }
    }

    #defaultHandleDone(
        properties: DeckSearchProperties,
        context: AbilityContext,
        event: any,
        selectedCards: Set<DrawCard>
    ): void {
        this.#doneMessage(properties, context, event, selectedCards);

        const gameAction = this.getProperties(event.context).gameAction;
        if (gameAction) {
            const selectedArray = Array.from(selectedCards);
            event.context.targets = selectedArray;
            gameAction.setDefaultTarget(() => selectedArray);
            context.game.queueSimpleStep(() => {
                if (gameAction.hasLegalTarget(context)) {
                    gameAction.resolve(null, context);
                }
            });
        }
    }

    #doneMessage(
        properties: DeckSearchProperties,
        context: AbilityContext,
        event: any,
        selectedCards: Set<DrawCard>
    ): void {
        const choosingPlayer = properties.choosingPlayer || event.player;
        if (selectedCards.size > 0 && properties.message) {
            const args = properties.messageArgs ? properties.messageArgs(context, Array.from(selectedCards)) : [];
            return context.game.addMessage(properties.message, ...args);
        }

        if (selectedCards.size === 0) {
            return this.#takesNothing(properties, context, event);
        }

        if (properties.reveal) {
            return context.game.addMessage('{0} takes {1}', choosingPlayer, Array.from(selectedCards));
        }

        context.game.addMessage(
            '{0} takes {1} {2}',
            choosingPlayer,
            selectedCards.size,
            selectedCards.size > 1 ? 'cards' : 'card'
        );
    }

    #takesNothing(properties: DeckSearchProperties, context: AbilityContext, event: any) {
        const choosingPlayer = properties.choosingPlayer || event.player;
        context.game.addMessage('{0} takes nothing', choosingPlayer);
        if (properties.takesNothingGameAction) {
            context.game.queueSimpleStep(() => {
                if (properties.takesNothingGameAction.hasLegalTarget(context)) {
                    properties.takesNothingGameAction.resolve(null, context);
                }
            });
        }
    }
}
