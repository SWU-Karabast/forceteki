import type { AbilityContext } from '../core/ability/AbilityContext';
import type { Card } from '../core/card/Card';
import CardSelectorFactory from '../core/cardSelector/CardSelectorFactory';
import type BaseCardSelector from '../core/cardSelector/BaseCardSelector';
import type { CardTypeFilter, MetaEventName, RelativePlayerFilter, ZoneFilter } from '../core/Constants';
import { EffectName, GameStateChangeRequired, RelativePlayer, TargetMode } from '../core/Constants';
import { CardTargetSystem, type ICardTargetSystemProperties } from '../core/gameSystem/CardTargetSystem';
import type { GameEvent } from '../core/event/GameEvent';
import * as Contract from '../core/utils/Contract';
import { CardTargetResolver } from '../core/ability/abilityTargets/CardTargetResolver';
import type { AggregateSystem } from '../core/gameSystem/AggregateSystem';

export interface ISelectCardProperties<TContext extends AbilityContext = AbilityContext> extends ICardTargetSystemProperties {
    activePromptTitle?: string;
    player?: RelativePlayer;
    cardTypeFilter?: CardTypeFilter | CardTypeFilter[];
    controller?: RelativePlayerFilter;
    zoneFilter?: ZoneFilter | ZoneFilter[];
    cardCondition?: (card: Card, context: TContext) => boolean;
    checkTarget?: boolean;
    message?: string;
    manuallyRaiseEvent?: boolean;
    messageArgs?: (card: Card, properties: ISelectCardProperties<TContext>) => any[];
    innerSystem: CardTargetSystem<TContext> | AggregateSystem<TContext>;
    selector?: BaseCardSelector;
    mode?: TargetMode;
    numCards?: number;
    canChooseNoCards?: boolean;
    innerSystemProperties?: (card: Card) => any;
    cancelHandler?: () => void;
    effect?: string;
    effectArgs?: (context) => string[];
    optional?: boolean;
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
        manuallyRaiseEvent: false,
        optional: false
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
                properties.cardCondition(card, context) &&
                properties.innerSystem.allTargetsLegal(
                    context,
                    Object.assign({}, additionalProperties, properties.innerSystemProperties(card))
                );
            properties.selector = CardSelectorFactory.create(Object.assign({}, properties, { cardCondition }));
        }

        if (properties.mode === TargetMode.UpTo || properties.mode === TargetMode.UpToVariable) {
            properties.canChooseNoCards = properties.canChooseNoCards ?? true;
        } else {
            if (properties.canChooseNoCards != null) {
                Contract.fail('Cannot use canChooseNoCards if mode is not UpTo or UpToVariable');
            }
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
            source: context.source,
            onCancel: properties.cancelHandler,
            onSelect: (cards) => {
                if (properties.message) {
                    context.game.addMessage(properties.message, ...properties.messageArgs(cards, properties));
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
            onMenuCommand: (arg) => {
                if (arg === 'noTarget' || arg === 'cancel') {
                    return true;
                }
                Contract.fail(`Unknown menu option '${arg}'`);
            }
        };

        const legalTargets = properties.selector.getAllLegalTargets(context, player);

        // if there are legal targets but this wouldn't have a gamestate-changing effect on any of them, we can just shortcut and skip selection
        if (
            properties.innerSystem &&
            !legalTargets.some((target) => properties.innerSystem.canAffect(
                target,
                this.getContextCopy(target, context),
                {},
                GameStateChangeRequired.MustFullyOrPartiallyResolve
            ))
        ) {
            return;
        }

        const finalProperties = Object.assign(defaultProperties, properties);
        if (player.autoSingleTarget) {
            if (legalTargets.length === 1) {
                finalProperties.onSelect(legalTargets[0]);
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
        if (properties.optional || properties.innerSystem.isOptional(context)) {
            return true;
        }

        if (properties.isCost === true) {
            return false;
        }

        if (properties.mode === TargetMode.Exactly || properties.mode === TargetMode.ExactlyVariable || properties.mode === TargetMode.Single) {
            return false;
        }

        const controller = typeof properties.controller === 'function' ? properties.controller(context) : properties.controller;
        const hasAnyCardFilter = this.hasAnyCardFilter(properties);
        return properties.canChooseNoCards || (CardTargetResolver.allZonesAreHidden(properties.zoneFilter, controller) && hasAnyCardFilter);
    }

    private hasAnyCardFilter(properties): boolean {
        return properties.cardTypeFilter || this.properties.cardCondition;
    }

    private getContextCopy(card: Card, context: TContext): TContext {
        const contextCopy = context.copy();
        contextCopy.targets[this.name] = card;
        if (this.name === 'target') {
            contextCopy.target = card;
        }
        return contextCopy as TContext;
    }
}
