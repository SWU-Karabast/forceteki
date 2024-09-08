const { AbilityContext } = require('./AbilityContext.js');
const PlayerOrCardAbility = require('./PlayerOrCardAbility.js');
const { Stage, AbilityType } = require('../Constants.js');

/**
 * Represents one step from a card's text ability. Checks are simpler than for a
 * full card ability, since it is assumed the ability is already resolving (see `CardAbility.js`).
 *
 * The default handler for this will resolve the ability using a `ThenEventWindow` so that any triggered
 * effects will not resolve until after the entire "Then" chain is done (see `ThenEventWindow` or SWU 8.29 for details)
 */
class CardAbilityStep extends PlayerOrCardAbility {
    /** @param {import('../card/Card').Card} card - The card this ability is attached to */
    constructor(game, card, properties, type = AbilityType.Action) {
        super(properties, type);

        this.game = game;
        this.card = card;
        this.properties = properties;
        this.handler = properties.handler || this.executeGameActions;
        this.cannotTargetFirst = true;
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
    checkGameActionsForPotential(context) {
        if (super.checkGameActionsForPotential(context)) {
            return true;
        } else if (this.gameSystem.every((gameSystem) => gameSystem.isOptional(context)) && this.properties.then) {
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
        // if there are any targets, look for gameActions attached to them
        let actions = this.targetResolvers.reduce((array, target) => array.concat(target.getGameSystem(context)), []);
        // look for a gameSystem on the ability itself, on an attachment execute that action on its parent, otherwise on the card itself
        return actions.concat(this.gameSystem);
    }

    executeGameActions(context) {
        context.events = [];
        let systems = this.getGameSystems(context);
        let then = this.properties.then;
        if (then && typeof then === 'function') {
            then = then(context);
        }
        for (const system of systems) {
            this.game.queueSimpleStep(() => {
                system.queueGenerateEventGameSteps(context.events, context);
            },
            `queue ${system.name} event generation steps for ${this}`);
        }
        this.game.queueSimpleStep(() => {
            let eventsToResolve = context.events.filter((event) => !event.cancelled && !event.resolved);
            if (eventsToResolve.length > 0) {
                let window = this.openEventWindow(eventsToResolve);
                if (then) {
                    window.addCardAbilityStep(new CardAbilityStep(this.game, this.card, then), context, then.thenCondition);
                }
            } else if (then && then.thenCondition && then.thenCondition(context)) {
                let cardAbilityStep = new CardAbilityStep(this.game, this.card, then);
                this.game.resolveAbility(cardAbilityStep.createContext(context.player));
            }
        }, `resolve events for ${this}`);
    }

    openEventWindow(events) {
        return this.game.openThenEventWindow(events);
    }

    /** @override */
    isCardAbility() {
        return true;
    }
}

module.exports = CardAbilityStep;
