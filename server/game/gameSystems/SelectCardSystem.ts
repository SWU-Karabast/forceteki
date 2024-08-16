import type { AbilityContext } from '../core/ability/AbilityContext';
import type Card from '../core/card/Card';
import CardSelector from '../core/cardSelector/CardSelector';
import type BaseCardSelector from '../core/cardSelector/BaseCardSelector';
import { CardType, EffectName, Location, RelativePlayer, TargetMode } from '../core/Constants';
import type Player from '../core/Player';
import { type ICardTargetSystemProperties, CardTargetSystem } from '../core/gameSystem/CardTargetSystem';
import type { GameSystem } from '../core/gameSystem/GameSystem';
import type { GameEvent } from '../core/event/GameEvent';

export interface ISelectCardProperties extends ICardTargetSystemProperties {
    activePromptTitle?: string;
    player?: RelativePlayer;
    cardType?: CardType | CardType[];
    controller?: RelativePlayer;
    locationFilter?: Location | Location[];
    cardCondition?: (card: Card, context: AbilityContext) => boolean;
    targets?: boolean;
    message?: string;
    manuallyRaiseEvent?: boolean;
    messageArgs?: (card: Card, player: RelativePlayer, properties: ISelectCardProperties) => any[];
    innerSystem: GameSystem;
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
 * Only used for adding a selection effect to a system that is part of a cost.
 */
// TODO: why is this class needed for evaluating costs when systems already have target evaluation and selection built in?
export class SelectCardSystem extends CardTargetSystem {
    override defaultProperties: ISelectCardProperties = {
        cardCondition: () => true,
        innerSystem: null,
        innerSystemProperties: (card) => ({ target: card }),
        targets: false,
        hidePromptIfSingleCard: false,
        manuallyRaiseEvent: false
    };

    public constructor(properties: ISelectCardProperties | ((context: AbilityContext) => ISelectCardProperties)) {
        super(properties);
    }

    override getEffectMessage(context: AbilityContext): [string, any[]] {
        const { target, effect, effectArgs } = this.generatePropertiesFromContext(context) as ISelectCardProperties;
        if (effect) {
            return [effect, effectArgs(context) || []];
        }
        return ['choose a target for {0}', [target]];
    }

    override generatePropertiesFromContext(context: AbilityContext, additionalProperties = {}): ISelectCardProperties {
        const properties = super.generatePropertiesFromContext(context, additionalProperties) as ISelectCardProperties;
        properties.innerSystem.setDefaultTargetFn(() => properties.target);
        if (!properties.selector) {
            const cardCondition = (card, context) =>
                properties.innerSystem.allTargetsLegal(
                    context,
                    Object.assign({}, additionalProperties, properties.innerSystemProperties(card))
                ) && properties.cardCondition(card, context);
            properties.selector = CardSelector.for(Object.assign({}, properties, { cardCondition }));
        }
        return properties;
    }

    override canAffect(card: Card, context: AbilityContext, additionalProperties = {}): boolean {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);
        const player =
            (properties.targets && context.choosingPlayerOverride) ||
            (properties.player === RelativePlayer.Opponent && context.player.opponent) ||
            context.player;
        return properties.selector.canTarget(card, context, player);
    }

    override hasLegalTarget(context: AbilityContext, additionalProperties = {}): boolean {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);
        const player =
            (properties.targets && context.choosingPlayerOverride) ||
            (properties.player === RelativePlayer.Opponent && context.player.opponent) ||
            context.player;
        return properties.selector.hasEnoughTargets(context, player);
    }

    // TODO: this was previously accepting an event input and using it in the in 'OnSelect' method. not sure if changing that change broke anything
    override generateEventsForAllTargets(context: AbilityContext, additionalProperties = {}): GameEvent[] {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);
        if (properties.player === RelativePlayer.Opponent && !context.player.opponent) {
            return [];
        }
        let player = properties.player === RelativePlayer.Opponent ? context.player.opponent : context.player;
        let mustSelect = [];
        if (properties.targets) {
            player = context.choosingPlayerOverride || player;
            mustSelect = properties.selector
                .getAllLegalTargets(context, player)
                .filter((card) =>
                    card
                        .getEffectValues(EffectName.MustBeChosen)
                        .some((restriction) => restriction.isMatch('target', context))
                );
        }
        if (!properties.selector.hasEnoughTargets(context, player)) {
            return [];
        }
        const defaultProperties = {
            context: context,
            selector: properties.selector,
            mustSelect: mustSelect,
            buttons: properties.cancelHandler ? [{ text: 'Cancel', arg: 'cancel' }] : [],
            onCancel: properties.cancelHandler,
            onSelect: (player, cards) => {
                if (properties.message) {
                    context.game.addMessage(properties.message, ...properties.messageArgs(cards, player, properties));
                }
                const events = properties.innerSystem.generateEventsForAllTargets(
                    context,
                    Object.assign({ parentAction: this }, additionalProperties, properties.innerSystemProperties(cards))
                );
                if (properties.manuallyRaiseEvent) {
                    context.game.openEventWindow(events);
                }
                return true;
            }
        };
        const finalProperties = Object.assign(defaultProperties, properties);
        if (properties.hidePromptIfSingleCard) {
            const cards = properties.selector.getAllLegalTargets(context);
            if (cards.length === 1) {
                finalProperties.onSelect(player, cards[0]);
                return [];
            }
        }
        context.game.promptForSelect(player, finalProperties);
        return [];
    }

    override hasTargetsChosenByInitiatingPlayer(context: AbilityContext, additionalProperties = {}): boolean {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);
        return properties.targets && properties.player !== RelativePlayer.Opponent;
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    eventHandler(event): void { }
}
