import type { AbilityContext } from '../AbilityContext';
import type BaseCard from '../basecard';
import { Players } from '../Constants';
import type Player from '../player';
import type { StatusToken } from '../StatusToken';
import type { GameAction } from './GameAction';
import { TokenAction, type TokenActionProperties } from './TokenAction';

export interface SelectTokenProperties extends TokenActionProperties {
    activePromptTitle?: string;
    card?: BaseCard;
    player?: Players;
    targets?: boolean;
    singleToken?: boolean;
    tokenCondition?: (token: StatusToken, context: AbilityContext) => boolean;
    cancelHandler?: () => void;
    subActionProperties?: (token: StatusToken | StatusToken[]) => any;
    message?: string;
    messageArgs?: (token: StatusToken | StatusToken[], player: Player) => any[];
    gameAction: GameAction;
    effect?: string;
    effectArgs?: (context) => string[];
}

export class SelectTokenAction extends TokenAction {
    name = 'selectToken';
    defaultProperties: SelectTokenProperties = {
        activePromptTitle: 'Which token do you wish to select?',
        tokenCondition: () => true,
        singleToken: true,
        subActionProperties: (token) => ({ target: token }),
        gameAction: null
    };

    constructor(properties: SelectTokenProperties | ((context: AbilityContext) => SelectTokenProperties)) {
        super(properties);
    }

    getEffectMessage(context: AbilityContext): [string, any[]] {
        let { target, effect, effectArgs } = this.getProperties(context) as SelectTokenProperties;
        if (effect) {
            return [effect, effectArgs(context) || []];
        }
        return ['choose a status token for {0}', [target]];
    }

    canAffect(token: StatusToken, context: AbilityContext, additionalProperties = {}): boolean {
        let properties = super.getProperties(context, additionalProperties) as SelectTokenProperties;
        if (properties.player === Players.Opponent && !context.player.opponent) {
            return false;
        }
        return (
            super.canAffect(token, context) &&
            properties.tokenCondition(token, context) &&
            properties.gameAction.hasLegalTarget(
                context,
                Object.assign({}, additionalProperties, properties.subActionProperties(token))
            )
        );
    }

    hasLegalTarget(context: AbilityContext, additionalProperties = {}): boolean {
        let properties = super.getProperties(context, additionalProperties) as SelectTokenProperties;
        return properties.card.statusTokens.some((token) => this.canAffect(token, context, additionalProperties));
    }

    addEventsToArray(events, context: AbilityContext, additionalProperties = {}): void {
        let properties = super.getProperties(context, additionalProperties) as SelectTokenProperties;
        if (properties.player === Players.Opponent && !context.player.opponent) {
            return;
        } else if (!properties.card.statusTokens.some((token) => properties.tokenCondition(token, context))) {
            return;
        } else if (!this.hasLegalTarget(context, additionalProperties)) {
            return;
        }
        let player = properties.player === Players.Opponent ? context.player.opponent : context.player;
        if (properties.targets && context.choosingPlayerOverride) {
            player = context.choosingPlayerOverride;
        }
        let validTokens = properties.card.statusTokens.filter((token) =>
            properties.gameAction.canAffect(token, context)
        );
        if (properties.singleToken && validTokens.length > 1) {
            const choices = validTokens.map((token) => token.name);
            const handlers = validTokens.map((token) => {
                return () => {
                    if (properties.message) {
                        context.game.addMessage(properties.message, ...properties.messageArgs(token, player));
                    }
                    context.tokens[this.name] = token;
                    properties.gameAction.addEventsToArray(
                        events,
                        context,
                        Object.assign({}, additionalProperties, properties.subActionProperties(token))
                    );
                };
            });
            context.game.promptWithHandlerMenu(player, {
                activePromptTitle: properties.activePromptTitle,
                choices: choices,
                handlers: handlers,
                context: context
            });
        } else {
            context.tokens[this.name] = validTokens;
            if (properties.message) {
                context.game.addMessage(properties.message, ...properties.messageArgs(validTokens, player));
            }
            properties.gameAction.addEventsToArray(
                events,
                context,
                Object.assign({}, additionalProperties, properties.subActionProperties(validTokens))
            );
        }
    }

    hasTargetsChosenByInitiatingPlayer(context: AbilityContext, additionalProperties = {}): boolean {
        let properties = super.getProperties(context, additionalProperties) as SelectTokenProperties;
        return properties.targets && properties.player !== Players.Opponent;
    }
}
