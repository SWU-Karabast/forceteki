const AbilityTargetAbility = require('./abilityTargets/AbilityTargetAbility.js');
const AbilityTargetCard = require('./abilityTargets/AbilityTargetCard.js');
const AbilityTargetSelect = require('./abilityTargets/AbilityTargetSelect.js');
const AbilityTargetToken = require('./abilityTargets/AbilityTargetToken.js');
const { Stage, TargetMode } = require('../Constants.js');

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
     */
    constructor(properties) {
        this.abilityType = 'action';
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

    buildCost(cost) {
        if (!cost) {
            return [];
        }

        if (!Array.isArray(cost)) {
            return [cost];
        }

        return cost;
    }

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

    // TODO: definition / interface for the properties object here
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
        } else if (properties.mode === TargetMode.Token) {
            return new AbilityTargetToken(name, properties, this);
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

    // eslint-disable-next-line no-unused-vars
    getCosts(context, playCosts = true, triggerCosts = true) {
        let costs = this.cost.map((a) => a);
        if (context.ignoreResourceCost) {
            costs = costs.filter((cost) => !cost.isPrintedFateCost);
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
                    if (cost.addEventsToArray) {
                        cost.addEventsToArray(results.events, context, results);
                    } else {
                        if (cost.resolve) {
                            cost.resolve(context, results);
                        }
                        context.game.queueSimpleStep(() => {
                            if (!results.cancelled) {
                                let newEvents = cost.payEvent
                                    ? cost.payEvent(context)
                                    : context.game.getEvent('payCost', {}, () => cost.pay(context));
                                if (Array.isArray(newEvents)) {
                                    for (let event of newEvents) {
                                        results.events.push(event);
                                    }
                                } else {
                                    results.events.push(newEvents);
                                }
                            }
                        });
                    }
                }
            });
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
    resolveTargets(context) {
        let targetResults = {
            canIgnoreAllCosts:
                context.stage === Stage.PreTarget ? this.cost.every((cost) => cost.canIgnoreForTargeting) : false,
            cancelled: false,
            payCostsFirst: false,
            delayTargeting: null
        };
        for (let target of this.targets) {
            context.game.queueSimpleStep(() => target.resolve(context, targetResults));
        }
        return targetResults;
    }

    resolveRemainingTargets(context, nextTarget) {
        const index = this.targets.indexOf(nextTarget);
        let targets = this.targets.slice();
        if (targets.slice(0, index).every((target) => target.checkTarget(context))) {
            targets = targets.slice(index);
        }
        let targetResults = {};
        for (const target of targets) {
            context.game.queueSimpleStep(() => target.resolve(context, targetResults));
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

    // eslint-disable-next-line no-unused-vars
    displayMessage(context) {}

    /**
     * Executes the ability once all costs have been paid. Inheriting classes
     * should override this method to implement their behavior; by default it
     * does nothing.
     */
    // eslint-disable-next-line no-unused-vars
    executeHandler(context) {}

    isAction() {
        return false;
    }

    isCardPlayed() {
        return false;
    }

    isCardAbility() {
        return false;
    }

    isTriggeredAbility() {
        return false;
    }

    isKeywordAbility() {
        return false;
    }
}

module.exports = PlayerOrCardAbility;
