// allow block comments without spaces so we can have compact jsdoc descriptions in this file
/* eslint @stylistic/lines-around-comment: off */

import type { AbilityContext } from '../core/ability/AbilityContext.js';
import type { Card } from '../core/card/Card.js';
import { DeckZoneDestination, EventName, TargetMode, ZoneName } from '../core/Constants.js';
import type { GameEvent } from '../core/event/GameEvent.js';
import type { GameSystem } from '../core/gameSystem/GameSystem.js';
import type { IPlayerTargetSystemProperties } from '../core/gameSystem/PlayerTargetSystem.js';
import { PlayerTargetSystem } from '../core/gameSystem/PlayerTargetSystem.js';
import type { Player } from '../core/Player.js';
import { Contract } from '../core/utils/Contract.js';
import * as ChatHelpers from '../core/chat/ChatHelpers.js';
import { ShuffleDeckSystem } from './ShuffleDeckSystem.js';
import type { IDisplayCardsSelectProperties } from '../core/gameSteps/PromptInterfaces.js';
import type { DeckZone } from '../core/zone/DeckZone.js';
import type { FormatMessage, MsgArg } from '../core/chat/GameChat.js';
import { MoveCardSystem } from './MoveCardSystem.js';

type Derivable<T, TContext extends AbilityContext = AbilityContext> = T | ((context: TContext) => T);

export interface ISearchDeckProperties<TContext extends AbilityContext = AbilityContext> extends IPlayerTargetSystemProperties {
    targetMode?: TargetMode.UpTo | TargetMode.Single | TargetMode.UpToVariable | TargetMode.Unlimited;
    activePromptTitle?: string;

    /**
     * The number of cards from the top of the deck to search, or a function to determine how many cards to search. Default is -1, which indicates the whole deck.
     *
     * This is currently required while SearchEntireDeckSystem exists, but once the prompt UI issue is fixed we can remove that system and make this optional again.
     */
    searchCount: number | ((context: TContext) => number);
    canChooseFewer?: boolean;

    /** The number of cards to select from the search, or a function to determine how many cards to select. Default is 1. The targetMode will interact with this to determine the min/max number of cards to retrieve. */
    selectCount?: number | ((context: TContext) => number);
    shuffleWhenDone?: boolean | ((context: TContext) => boolean);
    title?: string;

    choosingPlayer?: Player;

    /** This determines what to do with the selected cards (if a custom selectedCardsHandler is not provided). */
    selectedCardsImmediateEffect?: GameSystem<TContext>;

    /** Used to override default logic for handling the selected cards. The default utilizes the selectedCardsImmediateEffect */
    selectedCardsHandler?: (context: TContext, event: any, cards: Card[]) => void;

    /** This determines what to do with the remaining cards (if a custom remainingCardsHandler is not provided). */
    remainingCardsImmediateEffect?: GameSystem<TContext>;

    /** Used to override default logic for handling the remaining cards. Otherwise it will fall back to a specified remainingCardsImmediateEffect.  If neither is set, cards are placed on the bottom of the deck. */
    remainingCardsHandler?: (context: TContext, event: any, cards: Card[]) => void;

    /** Used for filtering selection based on things like trait, type, etc. */
    cardCondition?: (card: Card, context: TContext) => boolean;
    chooseNothingImmediateEffect?: GameSystem<TContext>;
    multiSelectCondition?: (card: Card, currentlySelectedCards: Card[], context: TContext) => boolean;
}

export class SearchDeckSystem<TContext extends AbilityContext = AbilityContext, TProperties extends ISearchDeckProperties<TContext> = ISearchDeckProperties<TContext>> extends PlayerTargetSystem<TContext, TProperties> {
    public override readonly name = 'deckSearch';
    public override readonly eventName = EventName.OnDeckSearch;

    protected override defaultProperties: ISearchDeckProperties = {
        searchCount: -1,
        selectCount: 1,
        targetMode: TargetMode.UpTo,
        selectedCardsHandler: null,
        chooseNothingImmediateEffect: null,
        shuffleWhenDone: false,
        cardCondition: () => true,
        multiSelectCondition: () => true,
        remainingCardsHandler: null,
        remainingCardsImmediateEffect: null
    };

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    public override eventHandler(event): void { }

    public override hasLegalTarget(context: TContext, additionalProperties: Partial<TProperties> = {}): boolean {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);
        if (this.computeSearchCount(properties.searchCount, context) === 0) {
            return false;
        }
        const player = this.getSingleTarget(properties.target);
        return this.getDeck(player).length > 0 && super.canAffectInternal(player, context);
    }

    public override generatePropertiesFromContext(context: TContext, additionalProperties: Partial<TProperties> = {}) {
        const properties = super.generatePropertiesFromContext(context, additionalProperties);

        properties.cardCondition = properties.cardCondition || (() => true);
        return properties;
    }

    public override getEffectMessage(context: TContext): [string, any[]] {
        const properties = this.generatePropertiesFromContext(context);
        const searchCountAmount = this.computeSearchCount(properties.searchCount, context);
        const player = this.getSingleTarget(properties.target);

        const targetIsSelf = player === context.player;
        const targetMessage: string | FormatMessage = targetIsSelf ? 'their' : { format: '{0}\'s', args: [player] };
        const verb = searchCountAmount === 1 ? 'look at' : 'search';
        const searchSpaceMessage: string | FormatMessage = searchCountAmount > 0
            ? { format: 'the top {0} of ', args: [ChatHelpers.pluralize(searchCountAmount, 'card', 'cards')] }
            : '';

        return [
            '{0} {1}{2} deck',
            [verb, searchSpaceMessage, targetMessage]
        ];
    }

    public override defaultTargets(context: TContext): Player[] {
        return [context.player];
    }

    protected override addPropertiesToEvent(event: any, player: Player, context: TContext, additionalProperties: Partial<TProperties>): void {
        const { searchCount } = this.generatePropertiesFromContext(context, additionalProperties);
        const searchCountAmount = this.computeSearchCount(searchCount, context);
        super.addPropertiesToEvent(event, player, context, additionalProperties);
        event.amount = searchCountAmount;
    }

    public override queueGenerateEventGameSteps(events: GameEvent[], context: TContext, additionalProperties: Partial<TProperties> = {}): void {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);
        const player = this.getSingleTarget(properties.target);
        const event = this.generateRetargetedEvent(player, context, additionalProperties) as any;
        const deckLength = this.getDeck(player).length;
        const amount = event.amount === -1 ? deckLength : (event.amount > deckLength ? deckLength : event.amount);
        const cards = this.getDeck(player).slice(0, amount);
        this.promptSelectCards(event, additionalProperties, cards, new Set());
        events.push(event);
        context.game.snapshotManager.setRequiresConfirmationToRollbackCurrentSnapshot(player.id);
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

    private getDeck(player: Player): readonly Card[] {
        return player.drawDeck;
    }

    private promptSelectCards(event: any, additionalProperties: Partial<TProperties>, cards: Card[], selectedCards: Set<Card>): void {
        const context: TContext = event.context;
        const properties = this.generatePropertiesFromContext(context, additionalProperties);
        let selectAmount: number;
        const choosingPlayer = properties.choosingPlayer || event.player;

        switch (properties.targetMode) {
            case TargetMode.UpTo:
            case TargetMode.UpToVariable:
                selectAmount = this.getNumCards(properties.selectCount, context);
                break;
            case TargetMode.Single:
                selectAmount = 1;
                break;
            case TargetMode.Unlimited:
                selectAmount = -1; // TODO: do we need to use a large number?
                break;
            default:
                Contract.fail(`Invalid targetMode: ${properties.targetMode}`);
        }

        let title = properties.activePromptTitle;
        if (!properties.activePromptTitle) {
            title = 'Select a card';
            if (selectAmount < 0 || selectAmount > 1) {
                title =
                    `Select ${selectAmount < 0 ? 'all' : 'up to ' + selectAmount} cards`;
            }
        }

        const promptProperties = this.buildPromptProperties(
            cards,
            properties,
            context,
            title,
            selectAmount,
            event,
            additionalProperties
        );

        if (promptProperties) {
            context.game.promptDisplayCardsForSelection(
                choosingPlayer,
                promptProperties
            );
        } else {
            this.onSearchComplete(properties, context, event, [], cards);
        }
    }

    protected buildPromptProperties(
        cards: Card[],
        properties: ISearchDeckProperties<TContext>,
        context: TContext,
        title: string,
        selectAmount: number,
        event: any,
        additionalProperties: Partial<TProperties>
    ): IDisplayCardsSelectProperties | null {
        return {
            activePromptTitle: title,
            source: context.source,
            displayCards: cards,
            maxCards: selectAmount,
            canChooseFewer: properties.canChooseFewer || true,
            validCardCondition: (card: Card) =>
                properties.cardCondition(card, context) &&
                (!properties.selectedCardsImmediateEffect || properties.selectedCardsImmediateEffect.canAffect(card, context, additionalProperties)),
            selectedCardsHandler: (selectedCards: Card[]) =>
                this.onSearchComplete(properties, context, event, selectedCards, cards),
            multiSelectCondition: (card: Card, currentlySelectedCards: Card[]) =>
                properties.multiSelectCondition(card, currentlySelectedCards, context)
        };
    }

    protected onSearchComplete(properties: ISearchDeckProperties, context: TContext, event: any, selectedCards: Card[], allCards: Card[]): void {
        event.selectedCards = selectedCards;
        context.selectedPromptCards = Array.from(selectedCards);

        const selectedCardsSet = new Set(selectedCards);
        const cardsToMove = allCards.filter((card) => !selectedCardsSet.has(card));

        const selectedCardMessages: FormatMessage[] = [];
        const remainingCardMessages: FormatMessage[] = [];

        // Handle remaining cards
        if (properties.remainingCardsHandler !== null) {
            properties.remainingCardsHandler(context, event, cardsToMove);
        } else if (properties.remainingCardsImmediateEffect !== null) {
            this.remainingCardsImmediateEffectHandler(properties, context, event, cardsToMove, remainingCardMessages);
        } else {
            this.remainingCardsDefaultHandler(context, event, cardsToMove, remainingCardMessages);
        }

        // Handle selected cards
        this.searchCompleteHandler(properties, context, event, selectedCardsSet, selectedCardMessages);
        if (properties.selectedCardsHandler === null) {
            this.selectedCardsDefaultHandler(properties, context, event, selectedCardsSet, selectedCardMessages);
        } else {
            properties.selectedCardsHandler(context, event, selectedCards);
        }

        // Shuffle if needed
        if (
            // Whole deck search always requires a shuffle
            this.computeSearchCount(properties.searchCount, context) === -1 ||
            this.shouldShuffle(properties.shuffleWhenDone, context)
        ) {
            this.handleDeckShuffle(properties, context, remainingCardMessages);
        }

        this.buildAndEmitGameMessage(context, [...selectedCardMessages, ...remainingCardMessages]);
    }

    protected remainingCardsDefaultHandler(context: TContext, event: any, cardsToMove: Card[], effectMessages: FormatMessage[]) {
        if (cardsToMove.length > 0) {
            this.handleMoveToBottomOfDeck(context, event, cardsToMove, effectMessages);
        }
    }

    private remainingCardsImmediateEffectHandler(
        properties: ISearchDeckProperties,
        context: TContext,
        event: any,
        remainingCards: Card[],
        effectMessages: FormatMessage[]
    ) {
        const gameSystem = properties.remainingCardsImmediateEffect;
        if (gameSystem && remainingCards.length > 0) {
            const events = [];
            gameSystem.setDefaultTargetFn(() => remainingCards);

            const [effectMessage, effectArgs] = gameSystem.getEffectMessage(context);
            effectMessages.push({ format: effectMessage, args: effectArgs });

            gameSystem.queueGenerateEventGameSteps(events, context);

            context.game.queueSimpleStep(() => {
                context.game.openEventWindow(events);
            }, 'resolve effect on remaining cards');
        }
    }

    private selectedCardsDefaultHandler(
        properties: ISearchDeckProperties,
        context: TContext,
        event: any,
        selectedCards: Set<Card>,
        effectMessages: FormatMessage[]
    ) {
        const gameSystem = properties.selectedCardsImmediateEffect;
        const targetDeckOwner = this.getSingleTarget(properties.target);
        if (gameSystem && selectedCards.size > 0) {
            const selectedArray = Array.from(selectedCards);

            const deckZone = targetDeckOwner.getZone(ZoneName.Deck) as DeckZone;
            deckZone.moveCardsToSearching(selectedArray, event);

            const events = [];
            gameSystem.setDefaultTargetFn(() => selectedArray);

            const [effectMessage, effectArgs] = gameSystem.getEffectMessage(context);
            effectMessages.push({ format: effectMessage, args: effectArgs });

            gameSystem.queueGenerateEventGameSteps(events, context);

            context.game.queueSimpleStep(() => {
                context.game.openEventWindow(events);
            }, 'resolve effect on selected cards');
        }
    }

    private searchCompleteHandler(
        properties: ISearchDeckProperties,
        context: TContext,
        event: any,
        selectedCards: Set<Card>,
        effectMessages: FormatMessage[]
    ) {
        if (selectedCards.size === 0) {
            return this.chooseNothingHandler(properties, context, event, effectMessages);
        }
    }

    private chooseNothingHandler(properties: ISearchDeckProperties, context: TContext, event: any, effectMessages: FormatMessage[]) {
        const choosingPlayer = properties.choosingPlayer || event.player;
        const isDiscard = properties.selectedCardsImmediateEffect.eventName === EventName.OnCardDiscarded;
        effectMessages.push({ format: isDiscard ? 'discard no cards' : 'take no cards', args: [choosingPlayer] });

        if (properties.chooseNothingImmediateEffect) {
            context.game.queueSimpleStep(() => {
                if (properties.chooseNothingImmediateEffect.hasLegalTarget(context)) {
                    properties.chooseNothingImmediateEffect.resolve(null, context);
                }
            }, 'Choose nothing');
        }
    }

    private handleMoveToBottomOfDeck(context: TContext, event: any, cards: Card[], effectMessages: FormatMessage[]) {
        const moveSystem = new MoveCardSystem({
            target: cards,
            destination: DeckZoneDestination.DeckBottom,
            shuffleMovedCards: true
        });

        const [effectMessage, effectArgs] = moveSystem.getEffectMessage(context);
        effectMessages.push({ format: effectMessage, args: effectArgs });

        const moveEvents = [];
        moveSystem.queueGenerateEventGameSteps(moveEvents, context);
        context.game.queueSimpleStep(() => {
            context.game.openEventWindow(moveEvents);
        }, 'resolve move for remaining cards');
    }

    private handleDeckShuffle(properties: ISearchDeckProperties, context: TContext, effectMessages: FormatMessage[]) {
        const shuffleSystem = new ShuffleDeckSystem({ target: this.getSingleTarget(properties.target) });
        const [shuffleMessage, shuffleArgs] = shuffleSystem.getEffectMessage(context);
        effectMessages.push({ format: shuffleMessage, args: shuffleArgs });

        context.game.openEventWindow([
            shuffleSystem.generateEvent(context)
        ]);
    }

    private getSingleTarget(target: Player | Player[]): Player {
        if (Array.isArray(target)) {
            Contract.assertTrue(target.length === 1, 'Support for multiple player targets in SearchDeckSystem not implemented yet');

            return target[0];
        }

        return target;
    }

    private buildAndEmitGameMessage(context: TContext, effectMessages: FormatMessage[]) {
        if (effectMessages.length === 0) {
            return;
        }

        const messageArgs: MsgArg[] = [context.player, ' uses ', context.source];
        const gainAbilitySource = context.ability && context.ability.isCardAbility() && context.ability.gainAbilitySource;

        if (gainAbilitySource && gainAbilitySource !== context.source) {
            messageArgs.push('\'s gained ability from ', gainAbilitySource);
        }

        messageArgs.push(' to ');
        messageArgs.push({
            format: ChatHelpers.formatWithLength(effectMessages.length, 'to '),
            args: effectMessages
        });

        const message: FormatMessage = {
            format: `{${[...Array(messageArgs.length).keys()].join('}{')}}`,
            args: messageArgs
        };

        context.game.addMessage(message.format, ...message.args);
    }
}