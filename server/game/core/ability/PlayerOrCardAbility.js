const AbilityTargetAbility = require('./abilityTargets/AbilityTargetAbility.js');
const AbilityTargetCard = require('./abilityTargets/AbilityTargetCard.js');
const AbilityTargetSelect = require('./abilityTargets/AbilityTargetSelect.js');
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
     * @param {Object} [properties.target] - optional property that specifies
     * the target of the ability.
     * @param {Array} [properties.gameSystem] - GameSystem[] optional array of game actions
     * @param {string} [properties.title] - Name to use for ability display and debugging
     */
    constructor(properties, abilityType = AbilityType.Action) {
        // Contract.assertStringValue(properties.title);

        this.title = properties.title;
        this.limit = null;
        this.abilityType = abilityType;
        this.gameSystem = properties.gameSystem || [];
        if (!Array.isArray(this.gameSystem)) {
            this.gameSystem = [this.gameSystem];
        }
        this.buildTargets(properties);
        this.cost = this.buildCost(properties.cost);
        for (const cost of this.cost) {
            if (cost.dependsOn) {
                let dependsOnTarget = this.targets.find((target) => target.name === cost.dependsOn);
                dependsOnTarget.dependentCost = cost;
            }
        }
        this.nonDependentTargets = this.targets.filter((target) => !target.properties.dependsOn);
    }

    toString() {
        return `'Ability: ${this.title}'`;
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

    // UP NEXT TARGET: better naming and general clarification for the target construction pipeline
    buildTargets(properties) {
        this.targets = [];
        if (properties.target) {
            this.targets.push(this.getAbilityTarget('target', properties.target));
        } else if (properties.targets) {
            for (const key of Object.keys(properties.targets)) {
                this.targets.push(this.getAbilityTarget(key, properties.targets[key]));
            }
        }
    }

    // UP NEXT TARGET: definition / interface for the properties object here
    getAbilityTarget(name, properties) {
        if (properties.gameSystem) {
            if (!Array.isArray(properties.gameSystem)) {
                properties.gameSystem = [properties.gameSystem];
            }
        } else {
            properties.gameSystem = [];
        }
        if (properties.mode === TargetMode.Select) {
            return new AbilityTargetSelect(name, properties, this);
        } else if (properties.mode === TargetMode.Ability) {
            return new AbilityTargetAbility(name, properties, this);
        }
        return new AbilityTargetCard(name, properties, this);
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
        if (this.targets.length === 0) {
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
                    if (cost.generateEventsForAllTargets) {
                        results.events.push(...cost.generateEventsForAllTargets(context, results));
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
                        }, this.buildCostEventStepName(cost));
                    }
                }
            }, this.buildResolveCostStepName(cost));
        }
    }

    buildResolveCostStepName(cost) {
        if (cost.gameSystem) {
            return `Resolve cost ${cost.gameSystem} for ${this}`;
        }
        return `Resolve cost for ${this}`;
    }

    buildCostEventStepName(cost) {
        if (cost.gameSystem) {
            return `Generate cost events for ${cost.gameSystem} for ${this}`;
        }
        return `Generate cost events for ${this}`;
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
        for (let target of this.targets) {
            context.game.queueSimpleStep(() => target.resolve(context, targetResults, passHandler), `Resolve target '${target.name}' for ${this}`);
        }
        return targetResults;
    }

    resolveRemainingTargets(context, nextTarget, passHandler = null) {
        const index = this.targets.indexOf(nextTarget);
        let targets = this.targets.slice();
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
            this.targets.some((target) => target.hasTargetsChosenByInitiatingPlayer(context)) ||
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
        return this.abilityType === AbilityType.Action;
    }

    /** Indicates whether this ability is an ability represents a card being played */
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
