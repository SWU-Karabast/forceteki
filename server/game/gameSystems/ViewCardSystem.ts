import type { AbilityContext } from '../core/ability/AbilityContext';
import type { Card } from '../core/card/Card';
import type { GameEvent } from '../core/event/GameEvent';
import type { ICardTargetSystemProperties } from '../core/gameSystem/CardTargetSystem';
import { CardTargetSystem } from '../core/gameSystem/CardTargetSystem';
import type { GameSystem } from '../core/gameSystem/GameSystem';
import type Player from '../core/Player';
import * as Contract from '../core/utils/Contract';
import * as Helpers from '../core/utils/Helpers';

export enum ViewCardInteractMode {
    ViewOnly = 'viewOnly',
    SelectSingle = 'selectSingle',
    PerCardButtons = 'perCardButtons'
}

export interface IPerCardButton {
    text: string;
    arg: string;
    immediateEffect: GameSystem;
}

interface IViewCardPropertiesBase extends ICardTargetSystemProperties {
    interactMode: ViewCardInteractMode;

    message?: string | ((context) => string);
    messageArgs?: (cards: any) => any[];

    /** The player who is viewing or revealing the card. */
    player?: Player;

    /** Temporary parameter while we are migrating everything to the new display prompt */
    useDisplayPrompt?: boolean;

    /** If we want to display text under any cards, map their uuid(s) to the title text here */
    displayTextByCardUuid?: Map<string, string>;
}

export interface IViewCardOnlyProperties extends IViewCardPropertiesBase {
    interactMode: ViewCardInteractMode.ViewOnly;
}

export interface IViewCardAndSelectSingleProperties extends IViewCardPropertiesBase {
    interactMode: ViewCardInteractMode.SelectSingle;
    canChooseNothing?: boolean;
    immediateEffect?: GameSystem;
}

export interface IViewCardWithPerCardButtonsProperties extends IViewCardPropertiesBase {
    interactMode: ViewCardInteractMode.PerCardButtons;
    perCardButtons: IPerCardButton[];
}

export type IViewCardProperties = IViewCardOnlyProperties | IViewCardAndSelectSingleProperties | IViewCardWithPerCardButtonsProperties;

export abstract class ViewCardSystem<TContext extends AbilityContext = AbilityContext, TProperties extends IViewCardProperties = IViewCardProperties> extends CardTargetSystem<TContext, TProperties> {
    public override eventHandler(event, _additionalProperties = {}): void {
        const context = event.context;
        context.game.addMessage(this.getMessage(event.message, context), ...event.messageArgs);

        if (event.promptHandler) {
            event.promptHandler();
        }
    }

    protected abstract getChatMessage(useDisplayPrompt: boolean): string;
    protected abstract getPromptedPlayer(properties: IViewCardProperties, context: TContext): Player;

    public override queueGenerateEventGameSteps(events: GameEvent[], context: TContext, additionalProperties = {}): void {
        const { target } = this.generatePropertiesFromContext(context, additionalProperties);
        const cards = Helpers.asArray(target).filter((card) => this.canAffect(card, context));
        if (cards.length === 0) {
            return;
        }
        const event = this.createEvent(null, context, additionalProperties);
        this.updateEvent(event, cards, context, additionalProperties);
        events.push(event);
    }

    public override addPropertiesToEvent(event, cards, context: TContext, additionalProperties): void {
        super.addPropertiesToEvent(event, cards, context, additionalProperties);
        const properties = this.generatePropertiesFromContext(context, additionalProperties);

        if (!cards) {
            cards = properties.target;
        }
        if (!Array.isArray(cards)) {
            cards = [cards];
        }

        const useDisplayPrompt = properties.useDisplayPrompt != null
            ? properties.useDisplayPrompt
            : properties.interactMode !== ViewCardInteractMode.ViewOnly;

        Contract.assertFalse(!useDisplayPrompt && properties.interactMode !== ViewCardInteractMode.ViewOnly, 'Cannot disable display prompt for non-basic view card prompts');

        event.cards = cards;
        event.message = this.getChatMessage(useDisplayPrompt);
        event.messageArgs = this.getMessageArgs(event, context, additionalProperties);
        event.displayTextByCardUuid = properties.displayTextByCardUuid;
        event.promptHandler = useDisplayPrompt ? this.buildPromptHandler(cards, properties, context) : null;
    }

    private buildPromptHandler(cards: Card[], properties: IViewCardProperties, context: TContext): () => void {
        const promptedPlayer = this.getPromptedPlayer(properties, context);

        switch (properties.interactMode) {
            case ViewCardInteractMode.ViewOnly:
                return this.buildViewOnlyPrompt(promptedPlayer, cards, properties, context);
            case ViewCardInteractMode.SelectSingle:
                return this.buildSelectSingleCardPrompt(promptedPlayer, cards, properties, context);
            case ViewCardInteractMode.PerCardButtons:
                return this.buildPerCardButtonsPrompt(promptedPlayer, cards, properties, context);
            default:
                Contract.fail(`Unrecognized interact mode ${(properties as any).interactMode}`);
        }
    }

    private buildViewOnlyPrompt(promptedPlayer: Player, cards: Card[], properties: IViewCardOnlyProperties, context: TContext) {
        return () => context.game.promptDisplayCardsBasic(
            promptedPlayer,
            {
                displayCards: cards,
                source: context.source,
                displayTextByCardUuid: properties.displayTextByCardUuid
            }
        );
    }

    private buildSelectSingleCardPrompt(promptedPlayer: Player, cards: Card[], properties: IViewCardAndSelectSingleProperties, context: TContext) {
        const selectedCardsHandler = (selectedCards: Card[]) => {
            context.selectedPromptCards = selectedCards;

            const gameSystem = properties.immediateEffect;
            if (gameSystem) {
                const events = [];
                gameSystem.setDefaultTargetFn(() => selectedCards);
                gameSystem.queueGenerateEventGameSteps(events, context);

                context.game.queueSimpleStep(() => {
                    context.game.openEventWindow(events);
                }, 'resolve effect on selected card');
            }
        };

        return () => context.game.promptDisplayCardsForSelection(
            promptedPlayer,
            {
                source: context.source,
                displayCards: cards,
                maxCards: 1,
                canChooseNothing: properties.canChooseNothing || true,
                selectedCardsHandler
            }
        );
    }

    private buildPerCardButtonsPrompt(promptedPlayer: Player, cards: Card[], properties: IViewCardWithPerCardButtonsProperties, context: TContext) {
        const buttonDefinitions = properties.perCardButtons.map((button) => ({ text: button.text, arg: button.arg }));
        const argsToEffects = new Map<string, GameSystem>(properties.perCardButtons.map((button) => [button.arg, button.immediateEffect]));

        const events = [];
        const onCardButton = (card: Card, arg: string) => {
            const gameSystem = argsToEffects.get(arg);
            Contract.assertNotNullLike(gameSystem, `No entry found for prompt arg ${arg}`);

            gameSystem.setDefaultTargetFn(() => [card]);
            gameSystem.queueGenerateEventGameSteps(events, context);
        };

        const onComplete = () => {
            context.game.queueSimpleStep(() => {
                context.game.openEventWindow(events);
            }, 'resolve effects on selected cards');
        };

        return () => context.game.promptDisplayCardsWithButtons(
            promptedPlayer,
            {
                activePromptTitle: 'Select card to move to the top or bottom of the deck',
                source: context.source,
                displayCards: cards,
                perCardButtons: buttonDefinitions,
                onCardButton,
                onComplete
            });
    }

    public getMessage(message, context: TContext): string {
        if (typeof message === 'function') {
            return message(context);
        }
        return message;
    }

    public abstract getMessageArgs(event: any, context: TContext, additionalProperties);
}
