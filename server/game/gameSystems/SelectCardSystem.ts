import type { AbilityContext } from '../core/ability/AbilityContext';
import type Card from '../core/card/Card';
import CardSelector from '../core/cardSelector/CardSelector';
import type BaseCardSelector from '../core/cardSelector/BaseCardSelector';
import { CardType, EffectName, Location, RelativePlayer, TargetMode } from '../core/Constants';
import type Player from '../core/Player';
import { type ICardTargetSystemProperties, CardTargetSystem } from '../core/gameSystem/CardTargetSystem';
import type { GameSystem } from '../core/gameSystem/GameSystem';

export interface ISelectCardProperties extends ICardTargetSystemProperties {
    activePromptTitle?: string;
    player?: RelativePlayer;
    cardType?: CardType | CardType[];
    controller?: RelativePlayer;
    location?: Location | Location[];
    cardCondition?: (card: Card, context: AbilityContext) => boolean;
    targets?: boolean;
    message?: string;
    manuallyRaiseEvent?: boolean;
    messageArgs?: (card: Card, player: RelativePlayer, properties: ISelectCardProperties) => any[];
    gameSystem: GameSystem;
    selector?: BaseCardSelector;
    mode?: TargetMode;
    numCards?: number;
    hidePromptIfSingleCard?: boolean;
    subActionProperties?: (card: Card) => any;
    cancelHandler?: () => void;
    effect?: string;
    effectArgs?: (context) => string[];
}

// TODO: figure out how this is supposed to work since it has an empty event handler method
export class SelectCardSystem extends CardTargetSystem {
    override defaultProperties: ISelectCardProperties = {
        cardCondition: () => true,
        gameSystem: null,
        subActionProperties: (card) => ({ target: card }),
        targets: false,
        hidePromptIfSingleCard: false,
        manuallyRaiseEvent: false
    };

    constructor(properties: ISelectCardProperties | ((context: AbilityContext) => ISelectCardProperties)) {
        super(properties);
    }

    override getEffectMessage(context: AbilityContext): [string, any[]] {
        let { target, effect, effectArgs } = this.generatePropertiesFromContext(context) as ISelectCardProperties;
        if (effect) {
            return [effect, effectArgs(context) || []];
        }
        return ['choose a target for {0}', [target]];
    }

    override generatePropertiesFromContext(context: AbilityContext, additionalProperties = {}): ISelectCardProperties {
        let properties = super.generatePropertiesFromContext(context, additionalProperties) as ISelectCardProperties;
        properties.gameSystem.setDefaultTargetEvaluator(() => properties.target);
        if (!properties.selector) {
            let cardCondition = (card, context) =>
                properties.gameSystem.allTargetsLegal(
                    context,
                    Object.assign({}, additionalProperties, properties.subActionProperties(card))
                ) && properties.cardCondition(card, context);
            properties.selector = CardSelector.for(Object.assign({}, properties, { cardCondition }));
        }
        return properties;
    }

    override canAffect(card: Card, context: AbilityContext, additionalProperties = {}): boolean {
        let properties = this.generatePropertiesFromContext(context, additionalProperties);
        let player =
            (properties.targets && context.choosingPlayerOverride) ||
            (properties.player === RelativePlayer.Opponent && context.player.opponent) ||
            context.player;
        return properties.selector.canTarget(card, context, player);
    }

    override hasLegalTarget(context: AbilityContext, additionalProperties = {}): boolean {
        let properties = this.generatePropertiesFromContext(context, additionalProperties);
        let player =
            (properties.targets && context.choosingPlayerOverride) ||
            (properties.player === RelativePlayer.Opponent && context.player.opponent) ||
            context.player;
        return properties.selector.hasEnoughTargets(context, player);
    }

    override addEventsToArray(events, context: AbilityContext, additionalProperties = {}): void {
        let properties = this.generatePropertiesFromContext(context, additionalProperties);
        if (properties.player === RelativePlayer.Opponent && !context.player.opponent) {
            return;
        }
        let player = properties.player === RelativePlayer.Opponent ? context.player.opponent : context.player;
        let mustSelect = [];
        if (properties.targets) {
            player = context.choosingPlayerOverride || player;
            mustSelect = properties.selector
                .getAllLegalTargets(context, player)
                .filter((card) =>
                    card
                        .getEffects(EffectName.MustBeChosen)
                        .some((restriction) => restriction.isMatch('target', context))
                );
        }
        if (!properties.selector.hasEnoughTargets(context, player)) {
            return;
        }
        let defaultProperties = {
            context: context,
            selector: properties.selector,
            mustSelect: mustSelect,
            buttons: properties.cancelHandler ? [{ text: 'Cancel', arg: 'cancel' }] : [],
            onCancel: properties.cancelHandler,
            onSelect: (player, cards) => {
                if (properties.message) {
                    context.game.addMessage(properties.message, ...properties.messageArgs(cards, player, properties));
                }
                properties.gameSystem.addEventsToArray(
                    events,
                    context,
                    Object.assign({ parentAction: this }, additionalProperties, properties.subActionProperties(cards))
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
                return;
            }
        }
        context.game.promptForSelect(player, finalProperties);
    }

    override hasTargetsChosenByInitiatingPlayer(context: AbilityContext, additionalProperties = {}): boolean {
        let properties = this.generatePropertiesFromContext(context, additionalProperties);
        return properties.targets && properties.player !== RelativePlayer.Opponent;
    }

    override eventHandler(event): void {}
}
