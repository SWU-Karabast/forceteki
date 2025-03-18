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
import { SelectCardMode } from '../core/gameSteps/PromptInterfaces';
import * as Helpers from '../core/utils/Helpers';
import type Player from '../core/Player';
import * as EnumHelpers from '../core/utils/EnumHelpers';

export interface ISelectCardProperties<TContext extends AbilityContext = AbilityContext> extends ICardTargetSystemProperties {
    activePromptTitle?: ((context: TContext) => string) | string;
    player?: RelativePlayer;
    cardTypeFilter?: CardTypeFilter | CardTypeFilter[];
    controller?: RelativePlayerFilter;
    zoneFilter?: ZoneFilter | ZoneFilter[];
    cardCondition?: (card: Card, context: TContext) => boolean;
    checkTarget?: boolean;
    message?: string;
    manuallyRaiseEvent?: boolean;
    messageArgs?: (cards: Card[], properties: ISelectCardProperties<TContext>) => any[];
    innerSystem: CardTargetSystem<TContext> | AggregateSystem<TContext>;
    selector?: BaseCardSelector;
    mode?: TargetMode;
    numCards?: number;
    numCardsFunc?: (context: TContext) => number;
    canChooseNoCards?: boolean;
    innerSystemProperties?: (card: Card) => any;
    cancelHandler?: () => void;
    effect?: string;
    effectArgs?: (context) => string[];
    optional?: boolean;
    name?: string;
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
        optional: false,
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
            const cardCondition = (card, context) => {
                const contextCopy = this.getContextCopy(card, context, properties.name);

                return properties.cardCondition(card, contextCopy) &&
                  properties.innerSystem.allTargetsLegal(
                      contextCopy,
                      Object.assign({}, additionalProperties, properties.innerSystemProperties(card)));
            };

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

    protected override targets(context: TContext, additionalProperties?: any): Card[] {
        this.validateContext(context);

        const properties = this.generatePropertiesFromContext(context, additionalProperties);
        const player =
            (properties.checkTarget && context.choosingPlayerOverride) ||
            (properties.player === RelativePlayer.Opponent && context.player.opponent) ||
            context.player;
        return properties.selector.getAllLegalTargets(context, player);
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

        const defaultProperties = {
            context: context,
            selector: properties.selector,
            mustSelect: mustSelect,
            buttons: buttons,
            source: context.source,
            selectCardMode: properties.mode === TargetMode.Single ? SelectCardMode.Single : SelectCardMode.Multiple,
            onCancel: properties.cancelHandler,
            onSelect: (cards) => {
                this.addTargetToContext(cards, context, properties.name);

                const updatedAdditionalProperties = { ...properties.innerSystemProperties(cards), ...additionalProperties };

                this.addOnSelectEffectMessage(cards, context, properties, updatedAdditionalProperties);

                properties.innerSystem.queueGenerateEventGameSteps(
                    events,
                    context,
                    updatedAdditionalProperties
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

        let legalTargetWithEffect = false;
        if (properties.innerSystem) {
            for (const target of legalTargets) {
                const contextCopy = this.getContextCopy(target, context, properties.name);
                if (properties.innerSystem.hasLegalTarget(contextCopy, properties.innerSystemProperties(target), GameStateChangeRequired.MustFullyOrPartiallyResolve)) {
                    legalTargetWithEffect = true;
                    break;
                }
            }
        }

        if (!legalTargetWithEffect) {
            return;
        }

        const finalProperties = Object.assign(defaultProperties, properties, {
            activePromptTitle: typeof properties.activePromptTitle === 'function' ? properties.activePromptTitle(context) : properties.activePromptTitle
        });
        if (player.autoSingleTarget) {
            if (legalTargets.length === 1) {
                finalProperties.onSelect(legalTargets[0]);
                return;
            }
        }
        context.game.promptForSelect(player, finalProperties);
        return;
    }

    private addOnSelectEffectMessage(
        card: Card | Card[],
        context: TContext,
        properties: ISelectCardProperties<TContext>,
        additionalInnerSystemProperties: any
    ) {
        const cards = Helpers.asArray(card);

        if (properties.message) {
            context.game.addMessage(properties.message, ...properties.messageArgs(cards, properties));
            return;
        }

        const messageArgs = [context.player, ' uses ', context.source, ' to '];

        const [effectMessage, effectArgs] = properties.innerSystem.getEffectMessage(context, additionalInnerSystemProperties);

        context.game.addMessage('{0}{1}{2}{3}{4}{5}{6}{7}{8}', ...messageArgs, { message: context.game.gameChat.formatMessage(effectMessage, effectArgs) });
    }

    public override hasTargetsChosenByPlayer(context: TContext, player: Player = context.player, additionalProperties = {}): boolean {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);

        if (properties.player === EnumHelpers.asRelativePlayer(context.player, player)) {
            return true;
        }

        return properties.innerSystem.hasTargetsChosenByPlayer(context, player, properties.innerSystemProperties(context.target));
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

    private getContextCopy(card: Card | Card[], context: TContext, name: string): TContext {
        const contextCopy = context.copy() as TContext;
        this.addTargetToContext(card, contextCopy, name);

        return contextCopy;
    }

    private addTargetToContext(card: Card | Card[], context: TContext, name: string) {
        if (!context.target || (Array.isArray(context.target) && context.target.length === 0)) {
            context.target = card;
        }

        if (name) {
            context.targets[name] = Helpers.asArray(card);
        }
    }
}
