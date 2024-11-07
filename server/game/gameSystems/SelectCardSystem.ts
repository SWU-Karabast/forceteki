import type { AbilityContext } from '../core/ability/AbilityContext';
import type { Card } from '../core/card/Card';
import CardSelectorFactory from '../core/cardSelector/CardSelectorFactory';
import type BaseCardSelector from '../core/cardSelector/BaseCardSelector';
import { CardTypeFilter, EffectName, EventName, GameStateChangeRequired, Location, LocationFilter, MetaEventName, RelativePlayer, TargetMode } from '../core/Constants';
import { type ICardTargetSystemProperties, CardTargetSystem } from '../core/gameSystem/CardTargetSystem';
import type { GameEvent } from '../core/event/GameEvent';
import * as Contract from '../core/utils/Contract';
import { CardTargetResolver } from '../core/ability/abilityTargets/CardTargetResolver';
import { AggregateSystem } from '../core/gameSystem/AggregateSystem';

export interface ISelectCardProperties<TContext extends AbilityContext = AbilityContext> extends ICardTargetSystemProperties {
    activePromptTitle?: string;
    player?: RelativePlayer;
    cardTypeFilter?: CardTypeFilter | CardTypeFilter[];
    controller?: RelativePlayer;
    locationFilter?: LocationFilter | LocationFilter[];
    cardCondition?: (card: Card, context: TContext) => boolean;
    checkTarget?: boolean;
    message?: string;
    manuallyRaiseEvent?: boolean;
    messageArgs?: (card: Card, player: RelativePlayer, properties: ISelectCardProperties<TContext>) => any[];
    innerSystem: CardTargetSystem<TContext> | AggregateSystem<TContext>;
    selector?: BaseCardSelector;
    mode?: TargetMode;
    numCards?: number;
    hidePromptIfSingleCard?: boolean;
    innerSystemProperties?: (card: Card) => any;
    cancelHandler?: () => void;
    effect?: string;
    effectArgs?: (context) => string[];
}

/**
 * A wrapper system for adding a target selection prompt around the execution the wrapped system.
 * Functions the same as a targetResolver and used in situations where one can't be created (e.g., costs).
 */
export class SelectCardSystem<TContext extends AbilityContext = AbilityContext> extends CardTargetSystem<TContext, ISelectCardProperties<TContext>> {
    public override readonly name: string = 'selectCard';
    protected override readonly eventName: MetaEventName.SelectCard;
    protected override readonly defaultProperties: ISelectCardProperties<TContext> = {
        cardCondition: () => true,
        innerSystem: null,
        innerSystemProperties: (card) => ({ target: card }),
        checkTarget: false,
        hidePromptIfSingleCard: true,
        manuallyRaiseEvent: false
    };

    public constructor(properties: ISelectCardProperties<TContext> | ((context: TContext) => ISelectCardProperties<TContext>)) {
        super(properties);
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    public eventHandler(event): void { }

    public override getEffectMessage(context: TContext): [string, any[]] {
        const { target, effect, effectArgs } = this.generatePropertiesFromContext(context);
        if (effect) {
            return [effect, effectArgs(context) || []];
        }
        return ['choose a target for {0}', [target]];
    }

    public override generatePropertiesFromContext(context: TContext, additionalProperties = {}) {
        const properties = super.generatePropertiesFromContext(context, additionalProperties);
        properties.innerSystem.setDefaultTargetFn(() => properties.target);
        if (!properties.selector) {
            const cardCondition = (card, context) =>
                properties.innerSystem.allTargetsLegal(
                    context,
                    Object.assign({}, additionalProperties, properties.innerSystemProperties(card))
                ) && properties.cardCondition(card, context);
            properties.selector = CardSelectorFactory.create(Object.assign({}, properties, { cardCondition }));
        }
        return properties;
    }

    public override canAffect(card: Card, context: TContext, additionalProperties = {}, mustChangeGameState = GameStateChangeRequired.None): boolean {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);
        const player =
            (properties.checkTarget && context.choosingPlayerOverride) ||
            (properties.player === RelativePlayer.Opponent && context.player.opponent) ||
            context.player;
        return properties.selector.canTarget(card, context, player);
    }

    public override hasLegalTarget(context: TContext, additionalProperties = {}): boolean {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);
        const player =
            (properties.checkTarget && context.choosingPlayerOverride) ||
            (properties.player === RelativePlayer.Opponent && context.player.opponent) ||
            context.player;
        return properties.selector.hasEnoughTargets(context, player);
    }

    public override queueGenerateEventGameSteps(events: GameEvent[], context: TContext, additionalProperties = {}): void {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);
        if (properties.player === RelativePlayer.Opponent && !context.player.opponent) {
            return;
        }
        let player = properties.player === RelativePlayer.Opponent ? context.player.opponent : context.player;
        let mustSelect = [];
        if (properties.checkTarget) {
            player = context.choosingPlayerOverride || player;
            mustSelect = properties.selector
                .getAllLegalTargets(context, player)
                .filter((card) =>
                    card
                        .getOngoingEffectValues(EffectName.MustBeChosen)
                        .some((restriction) => restriction.isMatch('target', context))
                );
        }
        if (!properties.selector.hasEnoughTargets(context, player)) {
            return;
        }

        let buttons = [];
        buttons = properties.cancelHandler ? buttons.concat({ text: 'Cancel', arg: 'cancel' }) : buttons;
        buttons = this.selectionIsOptional(properties, context) ? buttons.concat({ text: 'Choose no target', arg: 'noTarget' }) : buttons;

        const defaultProperties = {
            context: context,
            selector: properties.selector,
            mustSelect: mustSelect,
            buttons: buttons,
            onCancel: properties.cancelHandler,
            onSelect: (player, cards) => {
                if (properties.message) {
                    context.game.addMessage(properties.message, ...properties.messageArgs(cards, player, properties));
                }
                properties.innerSystem.queueGenerateEventGameSteps(
                    events,
                    context,
                    Object.assign(additionalProperties, properties.innerSystemProperties(cards))
                );
                if (properties.manuallyRaiseEvent) {
                    context.game.openEventWindow(events);
                }
                return true;
            },
            onMenuCommand: (player, arg) => {
                if (arg === 'noTarget' || arg === 'cancel') {
                    return true;
                }
                Contract.fail(`Unknown menu option '${arg}'`);
            }
        };
        const finalProperties = Object.assign(defaultProperties, properties);
        if (properties.hidePromptIfSingleCard) {
            const cards = properties.selector.getAllLegalTargets(context);
            if (cards.length === 1) {
                finalProperties.onSelect(player, cards[0]);
                return;
            }
        }
        context.game.promptForSelect(player, finalProperties);
        return;
    }

    public override hasTargetsChosenByInitiatingPlayer(context: TContext, additionalProperties = {}): boolean {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);
        return properties.checkTarget && properties.player !== RelativePlayer.Opponent;
    }

    private selectionIsOptional(properties, context): boolean {
        if (properties.innerSystem.isOptional(context)) {
            return true;
        }
        const controller = typeof properties.controller === 'function' ? properties.controller(context) : properties.controller;
        return CardTargetResolver.allZonesAreHidden(properties.locationFilter, controller) && properties.selector.hasAnyCardFilter;
    }
}
