import type { AbilityContext } from '../AbilityContext';
import type BaseCard from '../card/basecard';
import CardSelector from '../cardSelector/CardSelector';
import type BaseCardSelector from '../cardSelector/BaseCardSelector';
import { CardTypes, EffectNames, Locations, Players, TargetModes } from '../Constants';
import type Player from '../player';
import { type CardActionProperties, CardGameAction } from './CardGameAction';
import type { GameAction } from './GameAction';

export interface SelectCardProperties extends CardActionProperties {
    activePromptTitle?: string;
    player?: Players;
    cardType?: CardTypes | CardTypes[];
    controller?: Players;
    location?: Locations | Locations[];
    cardCondition?: (card: BaseCard, context: AbilityContext) => boolean;
    targets?: boolean;
    message?: string;
    manuallyRaiseEvent?: boolean;
    messageArgs?: (card: BaseCard, player: Player, properties: SelectCardProperties) => any[];
    gameAction: GameAction;
    selector?: BaseCardSelector;
    mode?: TargetModes;
    numCards?: number;
    hidePromptIfSingleCard?: boolean;
    subActionProperties?: (card: BaseCard) => any;
    cancelHandler?: () => void;
    effect?: string;
    effectArgs?: (context) => string[];
}

export class SelectCardAction extends CardGameAction {
    defaultProperties: SelectCardProperties = {
        cardCondition: () => true,
        gameAction: null,
        subActionProperties: (card) => ({ target: card }),
        targets: false,
        hidePromptIfSingleCard: false,
        manuallyRaiseEvent: false
    };

    constructor(properties: SelectCardProperties | ((context: AbilityContext) => SelectCardProperties)) {
        super(properties);
    }

    getEffectMessage(context: AbilityContext): [string, any[]] {
        let { target, effect, effectArgs } = this.getProperties(context) as SelectCardProperties;
        if (effect) {
            return [effect, effectArgs(context) || []];
        }
        return ['choose a target for {0}', [target]];
    }

    getProperties(context: AbilityContext, additionalProperties = {}): SelectCardProperties {
        let properties = super.getProperties(context, additionalProperties) as SelectCardProperties;
        properties.gameAction.setDefaultTarget(() => properties.target);
        if (!properties.selector) {
            let cardCondition = (card, context) =>
                properties.gameAction.allTargetsLegal(
                    context,
                    Object.assign({}, additionalProperties, properties.subActionProperties(card))
                ) && properties.cardCondition(card, context);
            properties.selector = CardSelector.for(Object.assign({}, properties, { cardCondition }));
        }
        return properties;
    }

    canAffect(card: BaseCard, context: AbilityContext, additionalProperties = {}): boolean {
        let properties = this.getProperties(context, additionalProperties);
        let player =
            (properties.targets && context.choosingPlayerOverride) ||
            (properties.player === Players.Opponent && context.player.opponent) ||
            context.player;
        return properties.selector.canTarget(card, context, player);
    }

    hasLegalTarget(context: AbilityContext, additionalProperties = {}): boolean {
        let properties = this.getProperties(context, additionalProperties);
        let player =
            (properties.targets && context.choosingPlayerOverride) ||
            (properties.player === Players.Opponent && context.player.opponent) ||
            context.player;
        return properties.selector.hasEnoughTargets(context, player);
    }

    addEventsToArray(events, context: AbilityContext, additionalProperties = {}): void {
        let properties = this.getProperties(context, additionalProperties);
        if (properties.player === Players.Opponent && !context.player.opponent) {
            return;
        }
        let player = properties.player === Players.Opponent ? context.player.opponent : context.player;
        let mustSelect = [];
        if (properties.targets) {
            player = context.choosingPlayerOverride || player;
            mustSelect = properties.selector
                .getAllLegalTargets(context, player)
                .filter((card) =>
                    card
                        .getEffects(EffectNames.MustBeChosen)
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
                properties.gameAction.addEventsToArray(
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

    hasTargetsChosenByInitiatingPlayer(context: AbilityContext, additionalProperties = {}): boolean {
        let properties = this.getProperties(context, additionalProperties);
        return properties.targets && properties.player !== Players.Opponent;
    }
}
