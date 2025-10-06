import type { IPlayerOrCardAbilityState } from './PlayerOrCardAbility.js';
import { PlayerOrCardAbility } from './PlayerOrCardAbility.js';
import { AbilityType, RelativePlayer, WildcardRelativePlayer, SubStepCheck, PlayType } from '../Constants.js';
import * as AttackHelper from '../attack/AttackHelpers.js';
import * as Helpers from '../utils/Helpers.js';
import * as Contract from '../utils/Contract.js';
import { TriggerHandlingMode } from '../event/EventWindow.js';
import type { Card } from '../card/Card.js';
import type { GameSystem } from '../gameSystem/GameSystem.js';
import type { GameEvent } from '../event/GameEvent.js';
import type { Player } from '../Player.js';
import type { AbilityContext } from './AbilityContext.js';
import type { IAbilityPropsWithSystems } from '../../Interfaces.js';
import type Game from '../Game.js';
import { GameCardMetric } from '../../../gameStatistics/GameStatisticsTracker.js';
import type { FormatMessage, MsgArg } from '../chat/GameChat.js';
import * as ChatHelpers from '../chat/ChatHelpers';

/**
 * Represents one step from a card's text ability. Checks are simpler than for a
 * full card ability, since it is assumed the ability is already resolving (see `CardAbility.js`).
 */
export class CardAbilityStep<T extends IPlayerOrCardAbilityState = IPlayerOrCardAbilityState> extends PlayerOrCardAbility<T> {
    private handler: (context: AbilityContext) => void;

    /** @param card The card this ability is attached to. */
    public constructor(game: Game, card: Card, properties, type = AbilityType.Action) {
        Contract.assertFalse(
            properties.targetResolvers != null && properties.initiateAttack != null,
            'Cannot create ability with targetResolvers and initiateAttack properties'
        );

        if (properties.initiateAttack) {
            AttackHelper.addInitiateAttackProperties(properties);
        }
        super(game, card, properties, type);

        this.handler = properties.handler || this.executeGameActions;
    }

    public override executeHandler(context: AbilityContext) {
        this.trackActivationMetric(context);
        this.handler(context);
        this.game.queueSimpleStep(() => this.game.resolveGameState(), 'resolveState');
    }

    public override hasAnyLegalEffects(context: AbilityContext, includeSubSteps = SubStepCheck.None) {
        if (this.immediateEffect && this.checkGameActionsForPotential(context)) {
            return true;
        }

        if (this.targetResolvers.length > 0 && this.canResolveSomeTarget(context)) {
            return true;
        }

        if (includeSubSteps === SubStepCheck.All || (includeSubSteps === SubStepCheck.ThenIfYouDo && (this.properties.then || this.properties.ifYouDo))) {
            const subAbilityStepContext = this.getSubAbilityStepContext(context);
            return subAbilityStepContext && subAbilityStepContext.ability.hasAnyLegalEffects(subAbilityStepContext);
        }

        return false;
    }

    public override meetsRequirements(context: AbilityContext, ignoredRequirements: string[] = [], thisStepOnly = false) {
        // if there is an ifYouDoNot clause, then lack of game state change just means we go down the "if you do not" path
        // (unless thisStepOnly is true, in which case we ignore sub-steps)
        if (this.properties.ifYouDoNot && !thisStepOnly) {
            ignoredRequirements.push('gameStateChange');
        }

        return super.meetsRequirements(context, ignoredRequirements, thisStepOnly);
    }

    public override checkGameActionsForPotential(context: AbilityContext) {
        if (super.checkGameActionsForPotential(context)) {
            return true;
        } else if (this.immediateEffect.isOptional(context) && this.properties.then) {
            const then =
                typeof this.properties.then === 'function' ? this.properties.then(context) : this.properties.then;
            const cardAbilityStep = this.buildSubAbilityStep(then);
            return cardAbilityStep.meetsRequirements(cardAbilityStep.createContext(context.player)) === '';
        }
        return false;
    }

    public override displayMessage(context: AbilityContext, messageVerb = 'uses') {
        if ('message' in this.properties && this.properties.message) {
            let messageArgs = 'messageArgs' in this.properties ? this.properties.messageArgs : [];
            if (typeof messageArgs === 'function') {
                messageArgs = messageArgs(context);
            }
            if (!Array.isArray(messageArgs)) {
                messageArgs = [messageArgs];
            }
            this.game.addMessage(this.properties.message, ...(messageArgs as any[]));
            return;
        }

        const gainAbilitySource = context.ability && context.ability.isCardAbility() && context.ability.gainAbilitySource;

        const messageArgs: MsgArg[] = [context.player, ` ${messageVerb} `, context.source];
        if (gainAbilitySource) {
            if (gainAbilitySource !== context.source) {
                messageArgs.push('\'s gained ability from ', gainAbilitySource);
            }
        } else if (messageVerb === 'plays' && context.playType === PlayType.Smuggle) {
            messageArgs.push(' using Smuggle');
        }
        const costMessages = this.getCostsMessages(context);

        if (costMessages.length > 0) {
            // ,
            messageArgs.push(', ');
            // paying 3 honor
            messageArgs.push(costMessages);
        }

        let effectMessage = this.properties.effect;
        let effectArgs = [];
        let extraArgs = null;
        if (!effectMessage) {
            const gameActions: GameSystem[] = this.getGameSystems(context).filter((gameSystem: GameSystem) => gameSystem.hasLegalTarget(context));
            if (gameActions.length === 1) {
                [effectMessage, extraArgs] = gameActions[0].getEffectMessage(context);
            } else if (gameActions.length > 1) {
                effectMessage = ChatHelpers.formatWithLength(gameActions.length, 'to ');
                extraArgs = gameActions.map((gameAction): FormatMessage => {
                    const [message, args] = gameAction.getEffectMessage(context);
                    return { format: message, args: Helpers.asArray(args) };
                });
            }
        } else {
            effectArgs.push(context.target || context.source);
            extraArgs = this.properties.effectArgs;
        }

        if (extraArgs) {
            if (typeof extraArgs === 'function') {
                extraArgs = extraArgs(context);
            }
            effectArgs = effectArgs.concat(extraArgs);
        }

        if (effectMessage) {
            // to
            messageArgs.push(' to ');
            // discard Stoic Gunso
            messageArgs.push({ format: effectMessage, args: effectArgs });
        } else if (messageVerb === 'uses' && costMessages.length === 0) {
            // If verb is "uses" and there's no effect or cost message, don't log anything
            return;
        }

        this.game.addMessage(`{${[...Array(messageArgs.length).keys()].join('}{')}}`, ...messageArgs);
    }

    protected getGameSystems(context: AbilityContext): GameSystem[] {
        // if we are using target resolvers, get the legal system(s) and return them
        if (this.targetResolvers.length > 0) {
            return this.targetResolvers.reduce((array, target) => array.concat(target.getGameSystems(context)), []);
        }

        // otherwise, we're using a single game system with no target resolver - just return it as an array
        return Helpers.asArray(this.immediateEffect);
    }

    private executeGameActions(context: AbilityContext) {
        context.events = [];

        this.queueEventsForSystems(context);

        this.game.queueSimpleStep(() => {
            const eventsToResolve = context.events.filter((event) => event.canResolve);
            if (eventsToResolve.length > 0) {
                const window = this.openEventWindow(eventsToResolve);
                window.setSubAbilityStep(() => this.getSubAbilityStepContext(context, eventsToResolve));
                // if no events for the current step, skip directly to the "then" step (if any)
            } else {
                const subAbilityStep = this.getSubAbilityStepContext(context, []);
                if (!!subAbilityStep) {
                    this.game.resolveAbility(subAbilityStep);
                }
            }
        }, `resolve events for ${this}`);
    }

    public queueEventsForSystems(context: AbilityContext) {
        const systems = this.getGameSystems(context);

        for (const system of systems) {
            this.game.queueSimpleStep(() => {
                if (system.hasLegalTarget(context)) {
                    system.queueGenerateEventGameSteps(context.events, context);
                }
            },
            `queue ${system.name} event generation steps for ${this}`);
        }
    }

    private openEventWindow(events: GameEvent[]) {
        return this.game.openEventWindow(events);
    }

    /** "Sub-ability-steps" are subsequent steps after the initial ability effect, such as "then" or "if you do" */
    public getSubAbilityStepContext(context: AbilityContext, resolvedAbilityEvents: GameEvent[] = []) {
        if (this.properties.then) {
            return this.buildThenSubAbilityStepContext(context);
        }

        if (this.properties.ifYouDo || this.properties.ifYouDoNot) {
            return this.buildIfYouDoOrIfYouDoNotSubAbilityStepContext(context, resolvedAbilityEvents);
        }

        return null;
    }

    private buildThenSubAbilityStepContext(context: AbilityContext) {
        if (!this.properties.then) {
            return null;
        }

        const then = this.getConcreteSubAbilityStepProperties(this.properties.then, context);
        const canBeTriggeredBy = this.getCanBeTriggeredBy(then, context);
        if (!then.thenCondition || then.thenCondition(context)) {
            return this.buildSubAbilityStepContext(then, canBeTriggeredBy);
        }

        return null;
    }

    private buildIfYouDoOrIfYouDoNotSubAbilityStepContext(context: AbilityContext, resolvedAbilityEvents: GameEvent[] = []) {
        if (resolvedAbilityEvents.length === 0) {
            // if there are no resolved events, "if you do not" check automatically succeeds
            if (this.properties.ifYouDoNot) {
                return this.buildSubAbilityStepContext(
                    this.getConcreteSubAbilityStepProperties(this.properties.ifYouDoNot, context),
                    context.player
                );
            }

            // if there are no resolved events, we can skip past evaluating "if you do" conditions
            return null;
        }

        // the last of this ability step's events is the one used for evaluating the "if you do (not)" condition
        const conditionalEvent = resolvedAbilityEvents[resolvedAbilityEvents.length - 1];

        if (this.properties.ifYouDo) {
            const concreteIfAbility = this.getConcreteSubAbilityStepProperties(this.properties.ifYouDo, context);
            const canBeTriggeredBy = this.getCanBeTriggeredBy(concreteIfAbility, context);

            if (conditionalEvent.isResolvedOrReplacementResolved && (!concreteIfAbility.ifYouDoCondition || concreteIfAbility.ifYouDoCondition(context))) {
                return this.buildSubAbilityStepContext(concreteIfAbility, canBeTriggeredBy);
            }
        }

        if (this.properties.ifYouDoNot) {
            const concreteIfAbility = this.getConcreteSubAbilityStepProperties(this.properties.ifYouDoNot, context);
            const canBeTriggeredBy = this.getCanBeTriggeredBy(concreteIfAbility, context);

            if (!conditionalEvent.isResolvedOrReplacementResolved) {
                return this.buildSubAbilityStepContext(concreteIfAbility, canBeTriggeredBy);
            }
        }

        return null;
    }

    private getConcreteSubAbilityStepProperties<TContext extends AbilityContext, TAbility extends IAbilityPropsWithSystems<TContext>>(subAbilityStep: ((context?: TContext) => TAbility) | TAbility, context: TContext) {
        const properties = typeof subAbilityStep === 'function' ? subAbilityStep(context) : subAbilityStep;

        // sub-steps will always pass to a parent window
        return { ...properties, triggerHandlingMode: TriggerHandlingMode.PassesTriggersToParentWindow };
    }

    private buildSubAbilityStepContext(subAbilityStepProps, canBeTriggeredBy: Player) {
        return this.buildSubAbilityStep(subAbilityStepProps).createContext(canBeTriggeredBy);
    }

    private buildSubAbilityStep(subAbilityStepProps) {
        return this.game.gameObjectManager.createWithoutRefsUnsafe(() => new CardAbilityStep(this.game, this.card, subAbilityStepProps, this.type));
    }

    private getCanBeTriggeredBy(subAbilityStep, context: AbilityContext) {
        Contract.assertFalse(subAbilityStep.canBeTriggeredBy === WildcardRelativePlayer.Any, 'Cannot use WildcardRelativePlayer.Any in a then/ifYouDo');
        if (subAbilityStep.canBeTriggeredBy) {
            return subAbilityStep.canBeTriggeredBy === RelativePlayer.Self ? context.player : context.player.opponent;
        }

        return context.player;
    }

    public override isCardAbilityStep(): this is CardAbilityStep {
        return true;
    }

    private trackActivationMetric(context: AbilityContext) {
        if (this.isActionAbility()) {
            this.game.statsTracker.trackCardMetric(
                GameCardMetric.Activated,
                this.card,
                context.player
            );
        }
    }
}
