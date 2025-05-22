import { PlayerOrCardAbility } from './PlayerOrCardAbility.js';
import { AbilityType, RelativePlayer, WildcardRelativePlayer, SubStepCheck } from '../Constants.js';
import * as AttackHelper from '../attack/AttackHelpers.js';
import * as Helpers from '../utils/Helpers.js';
import * as Contract from '../utils/Contract.js';
import { TriggerHandlingMode } from '../event/EventWindow.js';
import type Game from '../Game.js';
import type { Card } from '../card/Card.js';
import type { GameSystem } from '../gameSystem/GameSystem.js';
import type { GameEvent } from '../event/GameEvent.js';
import type { Player } from '../Player.js';
import type { AbilityContext } from './AbilityContext.js';

/**
 * Represents one step from a card's text ability. Checks are simpler than for a
 * full card ability, since it is assumed the ability is already resolving (see `CardAbility.js`).
 */
export class CardAbilityStep extends PlayerOrCardAbility {
    public cannotTargetFirst: boolean;

    private handler: (context: AbilityContext) => void;

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
        this.cannotTargetFirst = false;
    }

    public override executeHandler(context: AbilityContext) {
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

    public override displayMessage(context: AbilityContext) {
        if ('message' in this.properties) {
            let message = this.properties.message;
            if (typeof message === 'function') {
                message = message(context);
            }
            if (message) {
                let messageArgs = [context.player, context.source, context.target];
                if ('messageArgs' in this.properties && this.properties.messageArgs) {
                    let args = this.properties.messageArgs;
                    if (typeof args === 'function') {
                        args = args(context);
                    }
                    messageArgs = messageArgs.concat(args);
                }
                this.game.addMessage(message, ...messageArgs);
            }
        }
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
                system.queueGenerateEventGameSteps(context.events, context);
            },
            `queue ${system.name} event generation steps for ${this}`);
        }
    }

    private openEventWindow(events: GameEvent[]) {
        return this.game.openEventWindow(events);
    }

    /** "Sub-ability-steps" are subsequent steps after the initial ability effect, such as "then" or "if you do" */
    private getSubAbilityStepContext(context: AbilityContext, resolvedAbilityEvents: GameEvent[] = []) {
        if (this.properties.then) {
            const then = this.getConcreteSubAbilityStepProperties(this.properties.then, context);
            const canBeTriggeredBy = this.getCanBeTriggeredBy(then, context);
            if (!then.thenCondition || then.thenCondition(context)) {
                return this.buildSubAbilityStepContext(then, canBeTriggeredBy);
            }

            return null;
        }

        let ifAbility;
        let effectShouldResolve;

        if (this.properties.ifYouDo) {
            // if there are no resolved events, we can skip past evaluating "if you do" conditions
            if (resolvedAbilityEvents.length === 0) {
                return null;
            }
            ifAbility = this.properties.ifYouDo;
            effectShouldResolve = true;
        } else if (this.properties.ifYouDoNot) {
            // if there are no resolved events, "if you do not" check automatically succeeds
            if (resolvedAbilityEvents.length === 0) {
                return this.buildSubAbilityStepContext(
                    this.getConcreteSubAbilityStepProperties(this.properties.ifYouDoNot, context),
                    context.player
                );
            }

            ifAbility = this.properties.ifYouDoNot;
            effectShouldResolve = false;
        } else {
            return null;
        }

        const concreteIfAbility = this.getConcreteSubAbilityStepProperties(ifAbility, context);
        const canBeTriggeredBy = this.getCanBeTriggeredBy(concreteIfAbility, context);

        // the last of this ability step's events is the one used for evaluating the "if you do (not)" condition
        const conditionalEvent = resolvedAbilityEvents[resolvedAbilityEvents.length - 1];

        if (conditionalEvent.isResolvedOrReplacementResolved === effectShouldResolve && (!concreteIfAbility.ifYouDoCondition || concreteIfAbility.ifYouDoCondition(context))) {
            return this.buildSubAbilityStepContext(concreteIfAbility, canBeTriggeredBy);
        }

        return null;
    }

    private getConcreteSubAbilityStepProperties(subAbilityStep, context: AbilityContext) {
        const properties = typeof subAbilityStep === 'function' ? subAbilityStep(context) : subAbilityStep;

        // sub-steps will always pass to a parent window
        return { ...properties, triggerHandlingMode: TriggerHandlingMode.PassesTriggersToParentWindow };
    }

    private buildSubAbilityStepContext(subAbilityStepProps, canBeTriggeredBy: Player) {
        return this.buildSubAbilityStep(subAbilityStepProps).createContext(canBeTriggeredBy);
    }

    private buildSubAbilityStep(subAbilityStepProps) {
        return new CardAbilityStep(this.game, this.card, subAbilityStepProps, this.type);
    }

    private getCanBeTriggeredBy(subAbilityStep, context: AbilityContext) {
        Contract.assertFalse(subAbilityStep.canBeTriggeredBy === WildcardRelativePlayer.Any, 'Cannot use WildcardRelativePlayer.Any in a then/ifYouDo');
        if (subAbilityStep.canBeTriggeredBy) {
            return subAbilityStep.canBeTriggeredBy === RelativePlayer.Self ? context.player : context.player.opponent;
        }

        return context.player;
    }

    public override isCardAbility(): this is CardAbilityStep {
        return true;
    }
}
