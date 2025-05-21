import type { AbilityContext } from '../core/ability/AbilityContext';
import type { Card } from '../core/card/Card';
import * as CardSelectorFactory from '../core/cardSelector/CardSelectorFactory';
import type { MetaEventName, RelativePlayerFilter } from '../core/Constants';
import { EffectName, GameStateChangeRequired, RelativePlayer, TargetMode, WildcardRelativePlayer } from '../core/Constants';
import { CardTargetSystem, type ICardTargetSystemProperties } from '../core/gameSystem/CardTargetSystem';
import type { GameEvent } from '../core/event/GameEvent';
import * as Contract from '../core/utils/Contract';
import { CardTargetResolver } from '../core/ability/abilityTargets/CardTargetResolver';
import type { ISelectCardPromptProperties } from '../core/gameSteps/PromptInterfaces';
import { SelectCardMode } from '../core/gameSteps/PromptInterfaces';
import * as Helpers from '../core/utils/Helpers';
import type { Player } from '../core/Player';
import * as EnumHelpers from '../core/utils/EnumHelpers';
import type { ICardTargetResolver } from '../TargetInterfaces';
import type { AggregateSystem } from '../core/gameSystem/AggregateSystem';
import type { BaseCardSelector } from '../core/cardSelector/BaseCardSelector';

export type ISelectCardProperties<TContext extends AbilityContext = AbilityContext> = ICardTargetSystemProperties & ICardTargetResolver<TContext> & {
    player?: RelativePlayer;
    controller?: RelativePlayerFilter;
    innerSystem: CardTargetSystem<TContext> | AggregateSystem<TContext>;
    innerSystemProperties?: (card: Card | Card[]) => any;
    checkTarget?: boolean;
    manuallyRaiseEvent?: boolean;
    selector?: BaseCardSelector<TContext>;
    cancelHandler?: () => void;
    optional?: boolean;
    name?: string;
    effect?: string;
    effectArgs?: (context) => string[];
    message?: string;
    messageArgs?: (cards: Card[], properties: ISelectCardProperties<TContext>) => any[];
};

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
            return [effect, effectArgs ? effectArgs(context) : []];
        }
        return ['choose a target for {0}', [target]];
    }

    public override generatePropertiesFromContext(context: TContext, additionalProperties: Partial<ISelectCardProperties<TContext>> = {}) {
        const properties = super.generatePropertiesFromContext(context, additionalProperties);
        properties.innerSystem.setDefaultTargetFn(() => properties.target);
        if (!properties.selector) {
            const cardCondition = (card: Card, context: TContext) => {
                const contextCopy = this.getContextCopy(card, context, properties.name);

                return properties.cardCondition(card, contextCopy) &&
                  properties.innerSystem.allTargetsLegal(
                      contextCopy,
                      Object.assign({}, additionalProperties, properties.innerSystemProperties(card)));
            };

            properties.selector = CardSelectorFactory.create(Object.assign({}, properties, { cardCondition, optional: this.selectionIsOptional(properties, context) }));
        }

        if (properties.mode === TargetMode.UpTo || properties.mode === TargetMode.UpToVariable || properties.mode === TargetMode.Unlimited) {
            properties.canChooseNoCards = properties.canChooseNoCards ?? true;
        } else {
            if (properties.mode !== TargetMode.BetweenVariable && properties.canChooseNoCards != null) {
                Contract.fail('Cannot use canChooseNoCards if mode is not UpTo, UpToVariable or Unlimited');
            }
        }

        return properties;
    }

    public override canAffectInternal(card: Card, context: TContext, additionalProperties: Partial<ISelectCardProperties<TContext>> = {}, mustChangeGameState = GameStateChangeRequired.None): boolean {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);
        return properties.selector.canTarget(card, context);
    }

    public override hasLegalTarget(context: TContext, additionalProperties: Partial<ISelectCardProperties<TContext>> = {}): boolean {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);
        return properties.selector.hasEnoughTargets(context);
    }

    protected override targets(context: TContext, additionalProperties?: Partial<ISelectCardProperties<TContext>>): Card[] {
        this.validateContext(context);

        const properties = this.generatePropertiesFromContext(context, additionalProperties);
        return properties.selector.getAllLegalTargets(context);
    }

    public override queueGenerateEventGameSteps(events: GameEvent[], context: TContext, additionalProperties: Partial<ISelectCardProperties<TContext>> = {}): void {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);

        let player = properties.player === RelativePlayer.Opponent ? context.player.opponent : context.player;
        let mustSelect = [];
        if (properties.checkTarget) {
            player = context.choosingPlayerOverride || player;
            mustSelect = properties.selector
                .getAllLegalTargets(context)
                .filter((card) =>
                    card
                        .getOngoingEffectValues(EffectName.MustBeChosen)
                        .some((restriction) => restriction.isMatch('target', context))
                );
        }
        if (!properties.selector.hasEnoughTargets(context)) {
            return;
        }

        let buttons = [];
        buttons = properties.cancelHandler ? buttons.concat({ text: 'Cancel', arg: 'cancel' }) : buttons;

        const legalTargets = properties.selector.getAllLegalTargets(context);

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

        const finalProperties: ISelectCardPromptProperties = {
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
            },
            ...properties,
            activePromptTitle: typeof properties.activePromptTitle === 'function' ? properties.activePromptTitle(context) : properties.activePromptTitle,
            isOpponentEffect: player === context.player.opponent,
        };

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

    public override hasTargetsChosenByPlayer(context: TContext, player: Player = context.player, additionalProperties: Partial<ISelectCardProperties<TContext>> = {}): boolean {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);

        if (properties.player === EnumHelpers.asRelativePlayer(context.player, player)) {
            return true;
        }

        return properties.innerSystem.hasTargetsChosenByPlayer(context, player, properties.innerSystemProperties(context.target));
    }

    private selectionIsOptional(properties: ISelectCardProperties<TContext>, context: TContext): boolean {
        if (properties.optional || properties.innerSystem.isOptional(context) || properties.mode === TargetMode.UpTo) {
            return true;
        }

        if (properties.isCost === true) {
            return false;
        }

        if (properties.mode === TargetMode.Exactly || properties.mode === TargetMode.ExactlyVariable || properties.mode === TargetMode.Single) {
            return false;
        }

        const controller = properties.controller;
        const hasAnyCardFilter = this.hasAnyCardFilter(properties);
        return (properties.mode !== TargetMode.BetweenVariable && properties.canChooseNoCards) || (controller !== WildcardRelativePlayer.Any && CardTargetResolver.allZonesAreHidden(properties.zoneFilter, controller) && hasAnyCardFilter);
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
