const AbilityTargetResolver = require('./abilityTargets/AbilityTargetResolver.js');
const CardTargetResolver = require('./abilityTargets/CardTargetResolver.js');
const SelectTargetResolver = require('./abilityTargets/SelectTargetResolver.js');
const { Stage, TargetMode, AbilityType } = require('../Constants.js');
const { GameEvent } = require('../event/GameEvent.js');
const { default: Contract } = require('../utils/Contract.js');

// TODO: convert to TS and make this abstract
/**
 * Base class representing an ability that can be done by the player
 * or triggered by card text. This includes card actions, reactions,
 * interrupts, playing a card.
 *
 * Most of the methods take a context object. While the structure will vary from
 * inheriting classes, it is guaranteed to have at least the `game` object, the
 * `player` that is executing the action, and the `source` card object that the
 * ability is generated from.
 */
class PlayerOrCardAbility {
    /**
     * Creates an ability.
     *
     * @param {Object} properties - An object with ability related properties.
     * @param {Object|Array} [properties.cost] - optional property that specifies
     * the cost for the ability. Can either be a cost object or an array of cost
     * objects.
     * @param {Object} [properties.target] - Optional property that specifies
     * the target of the ability.
     * @param {Array} [properties.immediateEffect] - GameSystem[] optional array of game actions
     * @param {string} [properties.title] - Name to use for ability display and debugging
     * @param {string} [properties.cardName] - Optional property that specifies the name of the card, if any
     * @param {boolean} [properties.optional] - Optional property that indicates if resolution of the ability
     * is optional or required
     */
    constructor(properties, type = AbilityType.Action) {
        Contract.assertStringValue(properties.title);

        this.title = properties.title;
        this.limit = null;
        this.keyword = null;
        this.type = type;
        this.optional = !!properties.optional;
        this.gameSystem = properties.immediateEffect || [];
        if (!Array.isArray(this.gameSystem)) {
            this.gameSystem = [this.gameSystem];
        }
        this.buildTargetResolvers(properties);
        this.cost = this.buildCost(properties.cost);
        for (const cost of this.cost) {
            if (cost.dependsOn) {
                let dependsOnTarget = this.targetResolvers.find((target) => target.name === cost.dependsOn);
                dependsOnTarget.dependentCost = cost;
            }
        }
        this.nonDependentTargets = this.targetResolvers.filter((target) => !target.properties.dependsOn);
        this.toStringName = properties.cardName
            ? `'${properties.cardName} ability: ${this.title}'`
            : `'Ability: ${this.title}'`;
    }

    toString() {
        return this.toStringName;
    }

    buildCost(cost) {
        if (!cost) {
            return [];
        }

        if (!Array.isArray(cost)) {
            return [cost];
        }

        return cost;
    }

    buildTargetResolvers(properties) {
        this.targetResolvers = [];
        if (properties.targetResolver) {
            this.targetResolvers.push(this.buildTargetResolver('target', properties.targetResolver));
        } else if (properties.targetResolvers) {
            for (const key of Object.keys(properties.targetResolvers)) {
                this.targetResolvers.push(this.buildTargetResolver(key, properties.targetResolvers[key]));
            }
        }
    }

    buildTargetResolver(name, properties) {
        if (properties.immediateEffect) {
            if (!Array.isArray(properties.immediateEffect)) {
                properties.immediateEffect = [properties.immediateEffect];
            }
        } else {
            properties.immediateEffect = [];
        }
        if (properties.mode === TargetMode.Select) {
            return new SelectTargetResolver(name, properties, this);
        } else if (properties.mode === TargetMode.Ability) {
            return new AbilityTargetResolver(name, properties, this);
        }
        return new CardTargetResolver(name, properties, this);
    }

    /**
     * @param {*} context
     * @returns {String}
     */
    meetsRequirements(context, ignoredRequirements = []) {
        // check legal targets exist
        // check costs can be paid
        // check for potential to change game state
        if (!this.canPayCosts(context) && !ignoredRequirements.includes('cost')) {
            return 'cost';
        }
        if (this.targetResolvers.length === 0) {
            if (this.gameSystem.length > 0 && !this.checkGameActionsForPotential(context)) {
                return 'condition';
            }
            return '';
        }
        return this.canResolveTargets(context) ? '' : 'target';
    }

    checkGameActionsForPotential(context) {
        return this.gameSystem.some((gameSystem) => gameSystem.hasLegalTarget(context));
    }

    /**
     * Return whether all costs are capable of being paid for the ability.
     *
     * @returns {Boolean}
     */
    canPayCosts(context) {
        let contextCopy = context.copy({ stage: Stage.Cost });
        return this.getCosts(context).every((cost) => cost.canPay(contextCopy));
    }


    getCosts(context, playCosts = true, triggerCosts = true) {
        let costs = this.cost.map((a) => a);
        if (context.ignoreResourceCost) {
            costs = costs.filter((cost) => !cost.isPrintedResourceCost);
        }

        if (!playCosts) {
            costs = costs.filter((cost) => !cost.isPlayCost);
        }
        return costs;
    }

    resolveCosts(context, results) {
        for (let cost of this.getCosts(context, results.playCosts, results.triggerCosts)) {
            context.game.queueSimpleStep(() => {
                if (!results.cancelled) {
                    if (cost.queueGenerateEventGameSteps) {
                        cost.queueGenerateEventGameSteps(results.events, context, results);
                    } else {
                        if (cost.resolve) {
                            cost.resolve(context, results);
                        }
                        context.game.queueSimpleStep(() => {
                            if (!results.cancelled) {
                                let newEvents = cost.payEvent
                                    ? cost.payEvent(context)
                                    : new GameEvent('payCost', {}, () => cost.pay(context));
                                if (Array.isArray(newEvents)) {
                                    for (let event of newEvents) {
                                        results.events.push(event);
                                    }
                                } else {
                                    results.events.push(newEvents);
                                }
                            }
                        }, `Generate cost events for ${cost.gameSystem ? cost.gameSystem : cost.constructor.name} for ${this}`);
                    }
                }
            }, `Resolve cost '${cost.gameSystem ? cost.gameSystem : cost.constructor.name}' for ${this}`);
        }
    }

    /**
     * Returns whether there are eligible cards available to fulfill targets.
     *
     * @returns {Boolean}
     */
    canResolveTargets(context) {
        return this.nonDependentTargets.every((target) => target.canResolve(context));
    }

    /**
     * Prompts the current player to choose each target defined for the ability.
     */
    resolveTargets(context, passHandler = null) {
        let targetResults = {
            canIgnoreAllCosts:
                context.stage === Stage.PreTarget ? this.cost.every((cost) => cost.canIgnoreForTargeting) : false,
            cancelled: false,
            payCostsFirst: false,
            delayTargeting: null
        };
        for (let target of this.targetResolvers) {
            context.game.queueSimpleStep(() => target.resolve(context, targetResults, passHandler), `Resolve target '${target.name}' for ${this}`);
        }
        return targetResults;
    }

    resolveRemainingTargets(context, nextTarget, passHandler = null) {
        const index = this.targetResolvers.indexOf(nextTarget);
        let targets = this.targetResolvers.slice();
        if (targets.slice(0, index).every((target) => target.checkTarget(context))) {
            targets = targets.slice(index);
        }
        let targetResults = {};
        for (const target of targets) {
            context.game.queueSimpleStep(() => target.resolve(context, targetResults, passHandler), `Resolve target '${target.name}' for ${this}`);
        }
        return targetResults;
    }

    hasLegalTargets(context) {
        return this.nonDependentTargets.every((target) => target.hasLegalTarget(context));
    }

    checkAllTargets(context) {
        return this.nonDependentTargets.every((target) => target.checkTarget(context));
    }

    hasTargetsChosenByInitiatingPlayer(context) {
        return (
            this.targetResolvers.some((target) => target.hasTargetsChosenByInitiatingPlayer(context)) ||
            this.gameSystem.some((action) => action.hasTargetsChosenByInitiatingPlayer(context)) ||
            this.cost.some(
                (cost) => cost.hasTargetsChosenByInitiatingPlayer && cost.hasTargetsChosenByInitiatingPlayer(context)
            )
        );
    }


    displayMessage(context) {}

    /**
     * Executes the ability once all costs have been paid. Inheriting classes
     * should override this method to implement their behavior; by default it
     * does nothing.
     */

    executeHandler(context) {}

    isAction() {
        return this.type === AbilityType.Action;
    }

    /** Indicates whether a card is played as part of the resolution this ability */
    isCardPlayed() {
        return false;
    }

    /** Indicates whether this ability is an ability from card text as opposed to other types of actions like playing a card */
    isCardAbility() {
        return false;
    }

    /** Indicates whether this ability is an "activated" ability on a card, as opposed to a constant ability */
    isActivatedAbility() {
        return false;
    }

    isKeywordAbility() {
        return false;
    }
}

module.exports = PlayerOrCardAbility;
