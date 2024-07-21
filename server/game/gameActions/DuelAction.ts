import type { AbilityContext } from '../AbilityContext';
import { CardTypes, Durations, EventNames, Locations, type DuelTypes } from '../Constants';
import type DrawCard from '../drawcard';
import { Duel } from '../Duel';
import { DuelFlow } from '../gamesteps/DuelFlow';
import type { TriggeredAbilityContext } from '../TriggeredAbilityContext';
import { CardGameAction, type CardActionProperties } from './CardGameAction';
import { type GameAction } from './GameAction';

export interface DuelProperties extends CardActionProperties {
    type: DuelTypes;
    challenger?: DrawCard;
    challengerCondition?: (card: DrawCard, context: TriggeredAbilityContext) => boolean;
    requiresConflict?: boolean;
    gameAction: GameAction | ((duel: Duel, context: AbilityContext) => GameAction);
    message?: string;
    messageArgs?: (duel: Duel, context: AbilityContext) => any | any[];
    costHandler?: (context: AbilityContext, prompt: any) => void;
    statistic?: (card: DrawCard, duelRules: 'currentSkill' | 'printedSkill' | 'skirmish') => number;
    challengerEffect?: any;
    targetEffect?: any;
    refuseGameAction?: GameAction;
    refusalMessage?: string;
    refusalMessageArgs?: (context: AbilityContext) => any | any[];
}

export class DuelAction extends CardGameAction {
    name = 'duel';
    eventName = EventNames.OnDuelInitiated;
    targetType = [CardTypes.Character];

    defaultProperties: DuelProperties = {
        type: undefined,
        gameAction: null
    };

    getProperties(context: AbilityContext, additionalProperties = {}): DuelProperties {
        const properties = super.getProperties(context, additionalProperties) as DuelProperties;
        if (!properties.challenger) {
            properties.challenger = context.source;
        }
        return properties;
    }

    getEffectMessage(context: AbilityContext): [string, any[]] {
        const properties = this.getProperties(context);
        if (!Array.isArray(properties.target)) {
            return [
                'initiate a ' + properties.type.toString() + ' duel : {0} vs. {1}',
                [properties.challenger, properties.target]
            ];
        }

        const indices = properties.target.map((_, idx) => `{${idx + 1}}`);
        return [
            'initiate a ' + properties.type.toString() + ' duel : {0} vs. ' + indices.join(' and '),
            [properties.challenger, ...properties.target]
        ];
    }

    canAffect(card: DrawCard, context: AbilityContext, additionalProperties = {}): boolean {
        if (!context.player.opponent) {
            return false;
        }

        const properties = this.getProperties(context, additionalProperties);
        if (!super.canAffect(card, context)) {
            return false;
        }
        if (card.hasNoDuels() || properties.challenger.hasNoDuels()) {
            return false;
        }
        if (card === properties.challenger) {
            return false; //cannot duel yourself
        }
        if (!card.checkRestrictions('duel', context)) {
            return false;
        }

        return (
            properties.challenger &&
            !properties.challenger.hasDash(properties.type) &&
            card.location === Locations.PlayArea &&
            !card.hasDash(properties.type)
        );
    }

    resolveDuel(duel: Duel, context: AbilityContext, additionalProperties = {}): void {
        const properties = this.getProperties(context, additionalProperties);
        const gameAction =
            typeof properties.gameAction === 'function' ? properties.gameAction(duel, context) : properties.gameAction;
        if (gameAction && gameAction.hasLegalTarget(context)) {
            const [message, messageArgs] = properties.message
                ? [properties.message, properties.messageArgs ? [].concat(properties.messageArgs(duel, context)) : []]
                : gameAction.getEffectMessage(context);
            context.game.addMessage('Duel Effect: ' + message, ...messageArgs);
            gameAction.resolve(null, context);
        } else {
            context.game.addMessage('The duel has no effect');
        }
    }

    honorCosts(prompt, context: AbilityContext, additionalProperties = {}): void {
        const properties = this.getProperties(context, additionalProperties);
        properties.costHandler(context, prompt);
    }

    addEventsToArray(events: any[], context: AbilityContext, additionalProperties = {}): void {
        const { target, refuseGameAction, refusalMessage, refusalMessageArgs } = this.getProperties(
            context,
            additionalProperties
        );
        const addDuelEventsHandler = () => {
            const cards = (target as DrawCard[]).filter((card) => this.canAffect(card, context));
            if (cards.length === 0) {
                return;
            }
            const event = this.createEvent(null, context, additionalProperties);
            this.updateEvent(event, cards, context, additionalProperties);
            events.push(event);
        };
        if (refuseGameAction && refuseGameAction.hasLegalTarget(context, additionalProperties)) {
            context.game.promptWithHandlerMenu(context.player.opponent, {
                activePromptTitle: 'Do you wish to refuse the duel?',
                context: context,
                choices: ['Yes', 'No'],
                handlers: [
                    () => {
                        if (refusalMessage) {
                            const refusalArgs = refusalMessageArgs ? [].concat(refusalMessageArgs(context)) : [];
                            context.game.addMessage(refusalMessage, ...refusalArgs);
                        } else {
                            context.game.addMessage(
                                '{0} chooses to refuse the duel and {1}',
                                context.player.opponent,
                                refuseGameAction.getEffectMessage(context)
                            );
                        }
                        refuseGameAction.addEventsToArray(events, context, additionalProperties);
                    },
                    addDuelEventsHandler
                ]
            });
        } else {
            addDuelEventsHandler();
        }
    }

    addPropertiesToEvent(event, cards, context: AbilityContext, additionalProperties): void {
        const properties = this.getProperties(context, additionalProperties);
        if (!cards) {
            cards = this.getProperties(context, additionalProperties).target;
        }
        if (!Array.isArray(cards)) {
            cards = [cards];
        }

        event.cards = cards;
        event.context = context;
        event.duelType = properties.type;
        event.challenger = properties.challenger;
        event.duelTarget = properties.target;

        const duel = new Duel(
            context.game,
            properties.challenger,
            cards,
            properties.type,
            properties,
            properties.statistic,
            context.player
        );
        event.duel = duel;
    }

    eventHandler(event, additionalProperties): void {
        const context = event.context;
        const cards = event.cards;
        const properties = this.getProperties(context, additionalProperties);
        if (
            properties.challenger.location !== Locations.PlayArea ||
            cards.every((card) => card.location !== Locations.PlayArea)
        ) {
            context.game.addMessage(
                'The duel cannot proceed as at least one participant for each side has to be in play'
            );
            return;
        }
        const duel = event.duel;
        // const duel = new Duel(context.game, properties.challenger, cards, properties.type, properties.statistic, context.player);
        if (properties.challengerEffect) {
            context.game.actions
                .cardLastingEffect({
                    effect: properties.challengerEffect,
                    duration: Durations.Custom,
                    until: {
                        onDuelFinished: (event) => event.duel === duel
                    }
                })
                .resolve(properties.challenger, context);
        }
        if (properties.targetEffect) {
            context.game.actions
                .cardLastingEffect({
                    effect: properties.targetEffect,
                    duration: Durations.Custom,
                    until: {
                        onDuelFinished: (event) => event.duel === duel
                    }
                })
                .resolve(properties.target, context);
        }
        context.game.queueStep(
            new DuelFlow(
                context.game,
                duel,
                (duel) => this.resolveDuel(duel, event.context, additionalProperties),
                properties.costHandler
                    ? (prompt) => this.honorCosts(prompt, event.context, additionalProperties)
                    : undefined
            )
        );
    }

    checkEventCondition(event, additionalProperties) {
        return event.cards.some((card) => this.canAffect(card, event.context, additionalProperties));
    }

    hasTargetsChosenByInitiatingPlayer(context: AbilityContext, additionalProperties): boolean {
        const properties = this.getProperties(context, additionalProperties);
        const mockDuel = new Duel(
            context.game,
            properties.challenger,
            [],
            properties.type,
            properties,
            properties.statistic,
            context.player
        );
        const gameAction =
            typeof properties.gameAction === 'function'
                ? properties.gameAction(mockDuel, context)
                : properties.gameAction;
        return gameAction && gameAction.hasTargetsChosenByInitiatingPlayer(context, additionalProperties);
    }
}