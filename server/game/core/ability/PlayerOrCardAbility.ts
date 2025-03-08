import { CardTargetResolver } from './abilityTargets/CardTargetResolver.js';
import { SelectTargetResolver } from './abilityTargets/SelectTargetResolver.js';
import { Stage, TargetMode, AbilityType, RelativePlayer, SubStepCheck } from '../Constants.js';
import { GameEvent } from '../event/GameEvent.js';
import * as Contract from '../utils/Contract.js';
import { PlayerTargetResolver } from './abilityTargets/PlayerTargetResolver.js';
import { DropdownListTargetResolver } from './abilityTargets/DropdownListTargetResolver.js';
import { TriggerHandlingMode } from '../event/EventWindow.js';
import * as Helpers from '../utils/Helpers.js';
import { AbilityContext } from './AbilityContext.js';
import { GameObjectBase } from '../GameObjectBase.js';
import type { Card } from '../card/Card.js';

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
export default class PlayerOrCardAbility extends GameObjectBase {
    public title: any;
    public limit: any;
    public keyword: any;
    public type: AbilityType;
    public optional: boolean;
    public immediateEffect: any;
    public canResolveWithoutLegalTargets: boolean;
    public canBeTriggeredBy: any;
    public playerChoosingOptional: any;
    public optionalButtonTextOverride: any;
    public card: Card;
    public properties: any;
    public triggerHandlingMode: any;
    public cost: any;
    public nonDependentTargets: any;
    public targetResolvers: any;
    public toStringName: string;

    /**
     * Creates an ability.
     */
    public constructor(game, card: Card, properties, type = AbilityType.Action) {
        super(game);
        Contract.assertStringValue(properties.title);

        const hasImmediateEffect = properties.immediateEffect != null;
        const hasTargetResolver = properties.targetResolver != null;
        const hasTargetResolvers = properties.targetResolvers != null;

        const systemTypesCount = [hasImmediateEffect, hasTargetResolver, hasTargetResolvers].reduce(
            (acc, val) => acc + (val ? 1 : 0), 0,
        );

        Contract.assertFalse(systemTypesCount > 1, 'Cannot create ability with multiple system initialization properties');

        this.title = properties.title;
        this.limit = null;
        this.keyword = null;
        this.type = type;
        this.optional = !!properties.optional;
        this.immediateEffect = properties.immediateEffect;
        this.canResolveWithoutLegalTargets = false;
        this.canBeTriggeredBy = properties.canBeTriggeredBy ?? RelativePlayer.Self;

        Contract.assertFalse(
            !this.optional && (properties.playerChoosingOptional || properties.optionalButtonTextOverride),
            'Do not set playerChoosingOptional or optionalButtonTextOverride for non-optional abilities'
        );
        this.playerChoosingOptional = properties.playerChoosingOptional ?? RelativePlayer.Self;
        this.optionalButtonTextOverride = properties.optionalButtonTextOverride;

        this.card = card;
        this.properties = properties;

        // TODO: Ensure that nested abilities(triggers resolving during a trigger resolution) are resolving as expected.

        if (properties.triggerHandlingMode != null) {
            this.triggerHandlingMode = properties.triggerHandlingMode;
        } else {
            this.triggerHandlingMode = [AbilityType.Triggered, AbilityType.Action].includes(this.type)
                ? TriggerHandlingMode.ResolvesTriggers
                : TriggerHandlingMode.PassesTriggersToParentWindow;
        }

        this.buildTargetResolvers(properties);

        this.cost = this.buildCost(properties.cost);

        // TODO: do we still need dependsOn for costs? what would be the use case?
        // for (const cost of this.cost) {
        //     if (cost.dependsOn) {
        //         let dependsOnTarget = this.targetResolvers.find((target) => target.name === cost.dependsOn);
        //         dependsOnTarget.dependentCost = cost;
        //     }
        // }

        this.nonDependentTargets = this.targetResolvers.filter((target) => !target.properties.dependsOn);
        this.toStringName = properties.cardName
            ? `'${properties.cardName} ability: ${this.title}'`
            : `'Ability: ${this.title}'`;
    }

    public override toString() {
        return this.toStringName;
    }

    public buildCost(cost) {
        if (typeof cost !== 'function') {
            return Helpers.asArray(cost);
        }

        return cost;
    }

    public buildTargetResolvers(properties) {
        this.targetResolvers = [];
        if (properties.targetResolver) {
            this.targetResolvers.push(this.buildTargetResolver('target', properties.targetResolver));
        } else if (properties.targetResolvers) {
            for (const key of Object.keys(properties.targetResolvers)) {
                this.targetResolvers.push(this.buildTargetResolver(key, properties.targetResolvers[key]));
            }
        }
    }

    public buildTargetResolver(name, properties) {
        switch (properties.mode) {
            case TargetMode.Select:
                return new SelectTargetResolver(name, properties, this);
            case TargetMode.DropdownList:
                return new DropdownListTargetResolver(name, properties, this);
            case TargetMode.Player:
            case TargetMode.MultiplePlayers:
                return new PlayerTargetResolver(name, properties, this);
            case TargetMode.AutoSingle:
            case TargetMode.Exactly:
            case TargetMode.ExactlyVariable:
            case TargetMode.MaxStat:
            case TargetMode.Single:
            case TargetMode.Unlimited:
            case TargetMode.UpTo:
            case TargetMode.UpToVariable:
            case null:
            case undefined: // CardTargetResolver contains behavior that defaults the mode to TargetMode.Single if it is not defined yet.
                return new CardTargetResolver(name, properties, this);
            default:
                Contract.fail(`Attempted to create a TargetResolver with unsupported mode ${properties.mode}`);
        }
    }

    /**
     * @param {*} context
     * @returns {String}
     */
    public meetsRequirements(context: AbilityContext, ignoredRequirements: string[] = [], thisStepOnly = false): string {
        // check legal targets exist
        // check costs can be paid
        // check for potential to change game state
        if (!ignoredRequirements.includes('cost') && !this.canPayCosts(context)) {
            return 'cost';
        }

        // we don't check whether a triggered ability has legal targets at the trigger stage, that's evaluated at ability resolution
        if (context.stage === Stage.Trigger && this.isTriggeredAbility()) {
            return '';
        }

        // for actions, the only requirement to be legal to activate is that something changes game state. so if there's a resolvable cost, that's enough (see SWU 6.2.C)
        // TODO: add a card with an action that has no cost (e.g. Han red or Fennec) and confirm that the action is not legal to activate when there are no targets
        if (this.isAction()) {
            if (this.getCosts(context).length > 0) {
                return '';
            }
        }

        if (!ignoredRequirements.includes('gameStateChange') && !this.hasAnyLegalEffects(context, SubStepCheck.ThenIfYouDo)) {
            return 'gameStateChange';
        }

        return '';
    }

    hasAnyLegalEffects(context, includeSubSteps = SubStepCheck.None) {
        return true;
    }

    public checkGameActionsForPotential(context) {
        return this.immediateEffect.hasLegalTarget(context);
    }

    /**
     * Return whether all costs are capable of being paid for the ability.
     *
     * @returns {Boolean}
     */
    public canPayCosts(context) {
        const contextCopy = context.copy({ stage: Stage.Cost });
        return this.getCosts(context).every((cost) => cost.canPay(contextCopy));
    }


    public getCosts(context, playCosts = true, triggerCosts = true) {
        let costs = typeof this.cost === 'function' ? Helpers.asArray(this.cost(context)) : this.cost;

        costs = costs.map((a) => a);

        if (!playCosts) {
            costs = costs.filter((cost) => !cost.isPlayCost);
        }

        return costs;
    }

    public resolveCosts(context, results) {
        for (const cost of this.getCosts(context, results.playCosts, results.triggerCosts)) {
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
                                const newEvents = cost.payEvents
                                    ? cost.payEvents(context)
                                    : [new GameEvent('payCost', context, {}, () => cost.pay(context))];

                                results.events = results.events.concat(newEvents);
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
    public canResolveSomeTarget(context) {
        return this.nonDependentTargets.some((target) => target.canResolve(context));
    }

    /**
     * Prompts the current player to choose each target defined for the ability.
     */
    public resolveTargets(context, passHandler = null, canCancel = false) {
        const targetResults = {
            canIgnoreAllCosts:
                context.stage === Stage.PreTarget ? this.getCosts(context).every((cost) => cost.canIgnoreForTargeting) : false,
            cancelled: false,
            payCostsFirst: false,
            delayTargeting: null,
            canCancel
        };
        for (const target of this.targetResolvers) {
            context.game.queueSimpleStep(() => target.resolve(context, targetResults, passHandler), `Resolve target '${target.name}' for ${this}`);
        }
        return targetResults;
    }

    public resolveRemainingTargets(context, nextTarget, passHandler = null) {
        const index = this.targetResolvers.indexOf(nextTarget);
        let targets = this.targetResolvers.slice();
        if (targets.slice(0, index).every((target) => target.checkTarget(context))) {
            targets = targets.slice(index);
        }
        const targetResults = {};
        for (const target of targets) {
            context.game.queueSimpleStep(() => target.resolve(context, targetResults, passHandler), `Resolve target '${target.name}' for ${this}`);
        }
        return targetResults;
    }

    public hasTargets() {
        return this.nonDependentTargets.length > 0;
    }

    public hasSomeLegalTarget(context) {
        return this.nonDependentTargets.some((target) => target.hasLegalTarget(context));
    }

    public checkAllTargets(context) {
        return this.nonDependentTargets.every((target) => target.checkTarget(context));
    }

    public hasTargetsChosenByInitiatingPlayer(context) {
        return (
            this.targetResolvers.some((target) => target.hasTargetsChosenByInitiatingPlayer(context)) ||
            this.immediateEffect.hasTargetsChosenByInitiatingPlayer(context) ||
            this.getCosts(context).some(
                (cost) => cost.hasTargetsChosenByInitiatingPlayer && cost.hasTargetsChosenByInitiatingPlayer(context)
            )
        );
    }

    public createContext(player = this.card.controller, event?) {
        return new AbilityContext(this.getContextProperties(player, event));
    }

    public getContextProperties(player, event?) {
        return {
            ability: this,
            game: this.game,
            player,
            source: this.card,
            stage: Stage.PreTarget
        };
    }

    public displayMessage(context) {}

    /**
     * Executes the ability once all costs have been paid. Inheriting classes
     * should override this method to implement their behavior; by default it
     * does nothing.
     */

    public executeHandler(context) {}

    public isAction() {
        return this.type === AbilityType.Action;
    }

    public isTriggeredAbility() {
        return this.type === AbilityType.Triggered || this.type === AbilityType.ReplacementEffect;
    }

    // TODO: refactor the other methods to also be type predicates
    /**
     * Indicates whether a card is played as part of the resolution this ability
     * @returns {this is import('./PlayCardAction.js').PlayCardAction}
     */
    public isPlayCardAbility() {
        return false;
    }

    /** Indicates whether this ability is an ability from card text as opposed to other types of actions like playing a card */
    public isCardAbility() {
        return false;
    }

    /** Indicates whether this ability is an "activated" ability on a card, as opposed to a constant ability */
    public isActivatedAbility() {
        return false;
    }

    public isKeywordAbility() {
        return false;
    }

    /** @returns {this is import('../../actions/InitiateAttackAction.js').InitiateAttackAction} */
    public isAttackAction() {
        return false;
    }

    /** Return the controller of ability, can be different from card's controller (with bounty for exemple)
     * @returns {import('../Player.js')} */
    public get controller() {
        return this.canBeTriggeredBy === RelativePlayer.Self ? this.card.controller : this.card.controller.opponent;
    }
}