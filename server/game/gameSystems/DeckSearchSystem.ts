import type { AbilityContext } from '../core/ability/AbilityContext';
import { Card } from '../core/card/Card';
import { EventName, Location, TargetMode } from '../core/Constants';
import { GameEvent } from '../core/event/GameEvent';
import { GameSystem, IGameSystemProperties } from '../core/gameSystem/GameSystem';
import { IPlayerTargetSystemProperties, PlayerTargetSystem } from '../core/gameSystem/PlayerTargetSystem';
import Player from '../core/Player';
import { shuffleArray } from '../core/utils/Helpers';

type Derivable<T> = T | ((context: AbilityContext) => T);

export interface IDeckSearchProperties extends IPlayerTargetSystemProperties {
    targetMode?: TargetMode;
    activePromptTitle?: string;
    amount?: number | ((context: AbilityContext) => number); // Number of cards to search through
    numCards?: number | ((context: AbilityContext) => number);
    reveal?: boolean;
    shuffle?: boolean | ((context: AbilityContext) => boolean);
    title?: string;
    gameAction?: GameSystem<IGameSystemProperties>; // What should be done with the selected cards?
    message?: string;
    uniqueNames?: boolean;
    player?: Player;
    choosingPlayer?: Player;
    placeOnBottomInRandomOrder?: boolean;
    messageArgs?: (context: AbilityContext, cards: Card[]) => any | any[];
    selectedCardsHandler?: (context: AbilityContext, event: any, cards: Card[]) => void;
    remainingCardsHandler?: (context: AbilityContext, event: any, cards: Card[]) => void;
    cardCondition?: (card: Card, context: AbilityContext) => boolean;
    takesNothingGameAction?: GameSystem<IGameSystemProperties>;
}

export class DeckSearchSystem extends PlayerTargetSystem<IDeckSearchProperties> {
    public override readonly name = 'deckSearch';
    public override readonly eventName = EventName.OnDeckSearch;
    public override readonly costDescription: string = '';
    public override readonly effectDescription: string = '';

    protected override defaultProperties: IDeckSearchProperties = {
        amount: -1,
        numCards: 1,
        targetMode: TargetMode.Single,
        selectedCardsHandler: null,
        remainingCardsHandler: null,
        takesNothingGameAction: null,
        shuffle: false,
        reveal: true,
        uniqueNames: false,
        placeOnBottomInRandomOrder: true,
        cardCondition: () => true
    };

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    public eventHandler(event): void { }

    public override hasLegalTarget(context: AbilityContext, additionalProperties = {}): boolean {
        const properties = this.generatePropertiesFromContext(context, additionalProperties) as IDeckSearchProperties;
        if (this.getAmount(properties.amount, context) === 0) {
            return false;
        }
        const player = properties.player || context.player;
        return this.getDeck(player, properties).length > 0 && super.canAffect(player, context);
    }

    public override generatePropertiesFromContext(context: AbilityContext, additionalProperties = {}): IDeckSearchProperties {
        const properties = super.generatePropertiesFromContext(context, additionalProperties) as IDeckSearchProperties;
        if (properties.reveal === undefined) {
            properties.reveal = properties.cardCondition !== undefined;
        }
        properties.cardCondition = properties.cardCondition || (() => true);
        return properties;
    }

    public override getEffectMessage(context: AbilityContext): [string, any[]] {
        const properties = this.generatePropertiesFromContext(context);
        const amount = this.getAmount(properties.amount, context);
        const message =
            amount > 0
                ? `look at the top ${amount === 1 ? 'card' : `${amount} cards`} of their deck`
                : 'search their deck';
        return [message, []];
    }

    public override canAffect(player: Player, context: AbilityContext, additionalProperties = {}): boolean {
        const properties = this.generatePropertiesFromContext(context, additionalProperties) as IDeckSearchProperties;
        const amount = this.getAmount(properties.amount, context);
        return amount !== 0 && this.getDeck(player, properties).length > 0 && super.canAffect(player, context);
    }

    public override defaultTargets(context: AbilityContext): Player[] {
        return [context.player];
    }

    public override addPropertiesToEvent(event: any, player: Player, context: AbilityContext, additionalProperties: unknown): void {
        const { amount } = this.generatePropertiesFromContext(context, additionalProperties) as IDeckSearchProperties;
        const fAmount = this.getAmount(amount, context);
        super.addPropertiesToEvent(event, player, context, additionalProperties);
        event.amount = fAmount;
    }

    public override generateEventsForAllTargets(context: AbilityContext, additionalProperties = {}): GameEvent[] {
        const events: GameEvent[] = [];

        const properties = this.generatePropertiesFromContext(context, additionalProperties) as IDeckSearchProperties;
        const player = properties.player || context.player;
        const event = this.generateEvent(player, context, additionalProperties) as any;
        const amount = event.amount > -1 ? event.amount : this.getDeck(player, properties).length;
        let cards = this.getDeck(player, properties).slice(0, amount);
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

    private getAmount(amount: Derivable<number>, context: AbilityContext): number {
        return typeof amount === 'function' ? amount(context) : amount;
    }

    private shouldShuffle(shuffle: Derivable<boolean>, context: AbilityContext): boolean {
        return typeof shuffle === 'function' ? shuffle(context) : shuffle;
    }

    private getDeck(player: Player, properties: IDeckSearchProperties): any[] {
        return player.drawDeck;
    }

    private selectCard(event: any, additionalProperties: unknown, cards: Card[], selectedCards: Set<Card>): void {
        const context: AbilityContext = event.context;
        const properties = this.generatePropertiesFromContext(context, additionalProperties) as IDeckSearchProperties;
        const canCancel = properties.targetMode !== TargetMode.Exactly;
        let selectAmount = 1;
        const choosingPlayer = properties.choosingPlayer || event.player;

        if (properties.targetMode === TargetMode.UpTo || properties.targetMode === TargetMode.UpToVariable) {
            selectAmount = this.getNumCards(properties.numCards, context);
        }
        if (properties.targetMode === TargetMode.Single) {
            selectAmount = 1;
        }
        if (properties.targetMode === TargetMode.Exactly || properties.targetMode === TargetMode.ExactlyVariable) {
            selectAmount = this.getNumCards(properties.numCards, context);
        }
        if (properties.targetMode === TargetMode.Unlimited) {
            selectAmount = -1;
        }

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
            cardCondition: (card: Card, context: AbilityContext) =>
                properties.cardCondition(card, context) &&
                (!properties.uniqueNames || !Array.from(selectedCards).some((sel) => sel.name === card.name)) &&
                (!properties.gameAction || properties.gameAction.canAffect(card, context, additionalProperties)),
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

    private handleDone(
        properties: IDeckSearchProperties,
        context: AbilityContext,
        event: any,
        selectedCards: Set<Card>,
        allCards: Card[]
    ): void {
        event.selectedCards = Array.from(selectedCards);
        context.selects['deckSearch'] = Array.from(selectedCards);
        if (properties.selectedCardsHandler === null) {
            this.defaultHandleDone(properties, context, event, selectedCards);
        } else {
            properties.selectedCardsHandler(context, event, Array.from(selectedCards));
        }

        if (typeof properties.remainingCardsHandler === 'function') {
            const cardsToMove = allCards.filter((card) => !selectedCards.has(card));
            properties.remainingCardsHandler(context, event, cardsToMove);
        } else {
            this.defaultRemainingCardsHandler(properties, context, event, selectedCards, allCards);
        }
    }

    private defaultRemainingCardsHandler(
        properties: IDeckSearchProperties,
        context: AbilityContext,
        event: any,
        selectedCards: Set<Card>,
        allCards: Card[]
    ) {
        if (this.shouldShuffle(properties.shuffle, context)) {
            return event.player.shuffleDeck();
        }

        if (properties.placeOnBottomInRandomOrder) {
            const cardsToMove = allCards.filter((card) => !selectedCards.has(card));
            if (cardsToMove.length > 0) {
                shuffleArray(cardsToMove);
                for (const card of cardsToMove) {
                    event.player.moveCard(card, Location.Deck, { bottom: true });
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

    private defaultHandleDone(
        properties: IDeckSearchProperties,
        context: AbilityContext,
        event: any,
        selectedCards: Set<Card>
    ): void {
        this.doneMessage(properties, context, event, selectedCards);

        const gameAction = this.generatePropertiesFromContext(event.context).gameAction;
        if (gameAction) {
            const selectedArray = Array.from(selectedCards);
            event.context.targets = selectedArray;
            gameAction.setDefaultTargetFn(() => selectedArray);
            context.game.queueSimpleStep(() => {
                if (gameAction.hasLegalTarget(context)) {
                    gameAction.resolve(null, context);
                }
            });
        }
    }

    private doneMessage(
        properties: IDeckSearchProperties,
        context: AbilityContext,
        event: any,
        selectedCards: Set<Card>
    ): void {
        const choosingPlayer = properties.choosingPlayer || event.player;
        if (selectedCards.size > 0 && properties.message) {
            const args = properties.messageArgs ? properties.messageArgs(context, Array.from(selectedCards)) : [];
            return context.game.addMessage(properties.message, ...args);
        }

        if (selectedCards.size === 0) {
            return this.takesNothing(properties, context, event);
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

    private takesNothing(properties: IDeckSearchProperties, context: AbilityContext, event: any) {
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