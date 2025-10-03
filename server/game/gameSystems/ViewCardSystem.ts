import type { AbilityContext } from '../core/ability/AbilityContext';
import type { Card } from '../core/card/Card';
import type { MsgArg } from '../core/chat/GameChat';
import type { GameEvent } from '../core/event/GameEvent';
import type { ICardTargetSystemProperties } from '../core/gameSystem/CardTargetSystem';
import { CardTargetSystem } from '../core/gameSystem/CardTargetSystem';
import type { GameSystem } from '../core/gameSystem/GameSystem';
import type { Player } from '../core/Player';
import * as Contract from '../core/utils/Contract';
import * as Helpers from '../core/utils/Helpers';

export enum ViewCardInteractMode {
    ViewOnly = 'viewOnly',
    SelectCards = 'selectSingle',
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

    activePromptTitle?: string;

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

export interface IViewAndSelectCardsProperties<TContext extends AbilityContext = AbilityContext> extends IViewCardPropertiesBase {
    interactMode: ViewCardInteractMode.SelectCards;
    canChooseFewer?: boolean;
    immediateEffect?: GameSystem<TContext>;

    /** Used for filtering selection based on things like trait, type, etc. */
    cardCondition?: (card: Card, context: TContext) => boolean;

    maxCards?: number;
}

export interface IViewCardWithPerCardButtonsProperties extends IViewCardPropertiesBase {
    interactMode: ViewCardInteractMode.PerCardButtons;
    perCardButtons: IPerCardButton[];
}

export type IViewCardProperties = IViewCardOnlyProperties | IViewAndSelectCardsProperties | IViewCardWithPerCardButtonsProperties;

export abstract class ViewCardSystem<TContext extends AbilityContext = AbilityContext, TProperties extends IViewCardProperties = IViewCardProperties> extends CardTargetSystem<TContext, TProperties> {
    public override eventHandler(event): void {
        if (event.promptHandler) {
            event.promptHandler();
        }
    }

    protected abstract getPromptedPlayer(properties: IViewCardProperties, context: TContext): Player;

    public override queueGenerateEventGameSteps(events: GameEvent[], context: TContext, additionalProperties: Partial<TProperties> = {}): void {
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
        event.displayTextByCardUuid = properties.displayTextByCardUuid;
        event.promptHandler = useDisplayPrompt ? this.buildPromptHandler(cards, properties, context) : null;
    }

    private buildPromptHandler(cards: Card[], properties: IViewCardProperties, context: TContext): () => void {
        const promptedPlayer = this.getPromptedPlayer(properties, context);

        switch (properties.interactMode) {
            case ViewCardInteractMode.ViewOnly:
                return this.buildViewOnlyPrompt(promptedPlayer, cards, properties, context);
            case ViewCardInteractMode.SelectCards:
                return this.buildSelectCardsPrompt(promptedPlayer, cards, properties, context);
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
                activePromptTitle: properties.activePromptTitle,
                displayCards: cards,
                source: context.source,
                displayTextByCardUuid: properties.displayTextByCardUuid
            }
        );
    }

    private buildSelectCardsPrompt(promptedPlayer: Player, cards: Card[], properties: IViewAndSelectCardsProperties, context: TContext) {
        const selectedCardsHandler = (selectedCards: Card[]) => {
            context.selectedPromptCards = selectedCards;

            const gameSystem = properties.immediateEffect;
            if (gameSystem && selectedCards.length > 0) {
                const events = [];
                gameSystem.setDefaultTargetFn(() => selectedCards);
                this.addOnSelectEffectMessage(context, gameSystem);
                gameSystem.queueGenerateEventGameSteps(events, context);

                context.game.queueSimpleStep(() => {
                    context.game.openEventWindow(events);
                }, 'resolve effect on selected card');
            }
        };

        const cardCondition = properties.cardCondition || (() => true);

        return () => context.game.promptDisplayCardsForSelection(
            promptedPlayer,
            {
                activePromptTitle: properties.activePromptTitle,
                source: context.source,
                displayCards: cards,
                maxCards: properties.maxCards ?? 1,
                canChooseFewer: properties.canChooseFewer ?? true,
                selectedCardsHandler,
                displayTextByCardUuid: properties.displayTextByCardUuid,
                validCardCondition: (card: Card) =>
                    cardCondition(card, context) &&
                    (!properties.immediateEffect || properties.immediateEffect.canAffect(card, context))
            }
        );
    }

    private buildPerCardButtonsPrompt(promptedPlayer: Player, cards: Card[], properties: IViewCardWithPerCardButtonsProperties, context: TContext) {
        const argsToEffects = new Map<string, GameSystem>(properties.perCardButtons.map((button) => [button.arg, button.immediateEffect]));
        const buttonDefinitions = properties.perCardButtons.map((button) => {
            let disabled = false;

            // This is used to filter out game actions that wouldn't be legal such as playing a card blocked by Regional Governor
            // If we ever have a prompt choice displaying more than one card, we'll need to update this
            const gameSystem = argsToEffects.get(button.arg);
            if (cards.length === 1 && !gameSystem.canAffect(cards[0], context)) {
                disabled = true;
            }

            return { text: button.text, arg: button.arg, disabled: disabled };
        });

        const events = [];
        const onCardButton = (card: Card, arg: string) => {
            const gameSystem = argsToEffects.get(arg);
            Contract.assertNotNullLike(gameSystem, `No entry found for prompt arg ${arg}`);

            gameSystem.setDefaultTargetFn(() => [card]);
            this.addOnSelectEffectMessage(context, gameSystem);
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
                activePromptTitle: properties.activePromptTitle,
                source: context.source,
                displayCards: cards,
                perCardButtons: buttonDefinitions,
                onCardButton,
                onComplete
            });
    }

    private addOnSelectEffectMessage(
        context: TContext,
        system: GameSystem
    ) {
        const [effectMessage, effectArgs] = system.getEffectMessage(context);

        if (!effectMessage) {
            return;
        }

        const messageArgs: MsgArg[] = [context.player, ' uses ', context.source, ' to ', { format: effectMessage, args: effectArgs }];
        context.game.addMessage(`{${[...Array(messageArgs.length).keys()].join('}{')}}`, ...messageArgs);
    }
}
