const { AbilityContext } = require('./AbilityContext.js');
const PlayerOrCardAbility = require('./PlayerOrCardAbility.js');
const { Stage, AbilityType, RelativePlayer } = require('../Constants.js');
const AttackHelper = require('../attack/AttackHelper.js');
const Helpers = require('../utils/Helpers.js');
const Contract = require('../utils/Contract.js');

/**
 * Represents one step from a card's text ability. Checks are simpler than for a
 * full card ability, since it is assumed the ability is already resolving (see `CardAbility.js`).
 */
class CardAbilityStep extends PlayerOrCardAbility {
    /** @param {import('../card/Card').Card} card - The card this ability is attached to */
    constructor(game, card, properties, type = AbilityType.Action) {
        Contract.assertFalse(
            properties.targetResolvers != null && properties.initiateAttack != null,
            'Cannot create ability with targetResolvers and initiateAttack properties'
        );

        if (properties.initiateAttack) {
            AttackHelper.addInitiateAttackProperties(properties);
        }
        super(properties, type);

        this.game = game;
        this.card = card;
        this.properties = properties;
        this.handler = properties.handler || this.executeGameActions;
        this.cannotTargetFirst = false;
    }

    /** @override */
    executeHandler(context) {
        this.handler(context);
        this.game.queueSimpleStep(() => this.game.resolveGameState(), 'resolveState');
    }

    createContext(player = this.card.controller, event = null) {
        return new AbilityContext({
            ability: this,
            game: this.game,
            player: player,
            source: this.card,
            stage: Stage.PreTarget
        });
    }

    /** @override */
    hasAnyLegalEffects(context, includeSubSteps = false) {
        if (this.immediateEffect && this.checkGameActionsForPotential(context)) {
            return true;
        }

        if (this.targetResolvers.length > 0 && this.canResolveSomeTarget(context)) {
            return true;
        }

        if (includeSubSteps) {
            const subAbilityStepContext = this.getSubAbilityStepContext(context);
            return subAbilityStepContext && subAbilityStepContext.ability.hasAnyLegalEffects(subAbilityStepContext);
        }

        return false;
    }

    /** @override */
    meetsRequirements(context, ignoredRequirements = [], thisStepOnly = false) {
        // if there is an ifYouDoNot clause, then lack of game state change just means we go down the "if you do not" path
        // (unless thisStepOnly is true, in which case we ignore sub-steps)
        if (this.properties.ifYouDoNot && !thisStepOnly) {
            ignoredRequirements.push('gameStateChange');
        }

        return super.meetsRequirements(context, ignoredRequirements, thisStepOnly);
    }

    /** @override */
    checkGameActionsForPotential(context) {
        if (super.checkGameActionsForPotential(context)) {
            return true;
        } else if (this.immediateEffect.isOptional(context) && this.properties.then) {
            const then =
                typeof this.properties.then === 'function' ? this.properties.then(context) : this.properties.then;
            const cardAbilityStep = new CardAbilityStep(this.game, this.card, then);
            return cardAbilityStep.meetsRequirements(cardAbilityStep.createContext(context.player)) === '';
        }
        return false;
    }

    /** @override */
    displayMessage(context) {
        let message = this.properties.message;
        if (typeof message === 'function') {
            message = message(context);
        }
        if (message) {
            let messageArgs = [context.player, context.source, context.target];
            if (this.properties.messageArgs) {
                let args = this.properties.messageArgs;
                if (typeof args === 'function') {
                    args = args(context);
                }
                messageArgs = messageArgs.concat(args);
            }
            this.game.addMessage(message, ...messageArgs);
        }
    }

    getGameSystems(context) {
        // if we are using target resolvers, get the legal system(s) and return them
        if (this.targetResolvers.length > 0) {
            return this.targetResolvers.reduce((array, target) => array.concat(target.getGameSystems(context)), []);
        }

        // otherwise, we're using a single game system with no target resolver - just return it as an array
        return Helpers.asArray(this.immediateEffect);
    }

    executeGameActions(context) {
        context.events = [];
        let systems = this.getGameSystems(context);
        for (const system of systems) {
            this.game.queueSimpleStep(() => {
                system.queueGenerateEventGameSteps(context.events, context);
            },
            `queue ${system.name} event generation steps for ${this}`);
        }
        this.game.queueSimpleStep(() => {
            let eventsToResolve = context.events.filter((event) => event.canResolve);
            if (eventsToResolve.length > 0) {
                let window = this.openEventWindow(eventsToResolve);
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

    openEventWindow(events) {
        return this.game.openEventWindow(events);
    }

    /** "Sub-ability-steps" are subsequent steps after the initial ability effect, such as "then" or "if you do" */
    getSubAbilityStepContext(context, resolvedAbilityEvents = []) {
        if (this.properties.then) {
            const then = this.getConcreteSubAbilityStepProperties(this.properties.then, context);
            const abilityController = this.getAbilityController(then, context);
            if (!then.thenCondition || then.thenCondition(context)) {
                return new CardAbilityStep(this.game, this.card, then).createContext(abilityController);
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
                    context
                );
            }

            ifAbility = this.properties.ifYouDoNot;
            effectShouldResolve = false;
        } else {
            return null;
        }

        const concreteIfAbility = this.getConcreteSubAbilityStepProperties(ifAbility, context);
        const abilityController = this.getAbilityController(concreteIfAbility, context);

        // the last of this ability step's events is the one used for evaluating the "if you do (not)" condition
        const conditionalEvent = resolvedAbilityEvents[resolvedAbilityEvents.length - 1];

        return conditionalEvent.isResolvedOrReplacementResolved === effectShouldResolve
            ? new CardAbilityStep(this.game, this.card, concreteIfAbility).createContext(abilityController)
            : null;
    }

    getConcreteSubAbilityStepProperties(subAbilityStep, context) {
        return typeof subAbilityStep === 'function' ? subAbilityStep(context) : subAbilityStep;
    }

    buildSubAbilityStepContext(subAbilityStepProps, context) {
        return new CardAbilityStep(this.game, this.card, subAbilityStepProps).createContext(context.player);
    }

    getAbilityController(subAbilityStep, context) {
        if (subAbilityStep.abilityController) {
            return subAbilityStep.abilityController === RelativePlayer.Self ? context.player : context.player.opponent;
        }

        return context.player;
    }

    /** @override */
    isCardAbility() {
        return true;
    }
}

module.exports = CardAbilityStep;