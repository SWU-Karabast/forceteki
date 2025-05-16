import { CardTargetResolver } from './abilityTargets/CardTargetResolver.js';
import { SelectTargetResolver } from './abilityTargets/SelectTargetResolver.js';
import type { RelativePlayerFilter } from '../Constants.js';
import { Stage, TargetMode, AbilityType, RelativePlayer, SubStepCheck } from '../Constants.js';
import { GameEvent } from '../event/GameEvent.js';
import * as Contract from '../utils/Contract.js';
import { PlayerTargetResolver } from './abilityTargets/PlayerTargetResolver.js';
import { DropdownListTargetResolver } from './abilityTargets/DropdownListTargetResolver.js';
import { TriggerHandlingMode } from '../event/EventWindow.js';
import * as Helpers from '../utils/Helpers.js';
import { AbilityContext } from './AbilityContext.js';
import type Game from '../Game.js';
import type { Player } from '../Player.js';
import type { PlayCardAction } from './PlayCardAction.js';
import type { InitiateAttackAction } from '../../actions/InitiateAttackAction.js';
import type { EpicActionAbility } from '../../abilities/EpicActionAbility.js';
import type { CardAbilityStep } from './CardAbilityStep.js';
import type { Card } from '../card/Card.js';
import { v4 as uuidv4 } from 'uuid';
import type { IAbilityPropsWithSystems } from '../../Interfaces.js';
import type { GameSystem } from '../gameSystem/GameSystem.js';
import type { IActionTargetResolver } from '../../TargetInterfaces.js';
import type { IAbilityLimit } from './AbilityLimit.js';
import type { ICost } from '../cost/ICost.js';

export type IPlayerOrCardAbilityProps<TContext extends AbilityContext> = IAbilityPropsWithSystems<TContext> & {
    triggerHandlingMode?: TriggerHandlingMode;
};

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
export abstract class PlayerOrCardAbility {
    public title: string;
    public limit?: IAbilityLimit;
    public canResolveWithoutLegalTargets: boolean;
    public targetResolvers: any[];  // TargetResolver[]

    public readonly uuid: string;
    public readonly game: Game;
    public readonly type: AbilityType;
    public readonly optional: boolean;
    public readonly immediateEffect?: GameSystem;
    public readonly canBeTriggeredBy: RelativePlayerFilter;
    public readonly playerChoosingOptional: RelativePlayer;
    public readonly optionalButtonTextOverride?: string;
    public readonly card: Card;
    public readonly properties: IPlayerOrCardAbilityProps<AbilityContext>;
    public readonly triggerHandlingMode: TriggerHandlingMode;
    protected readonly cost: ICost<AbilityContext>[] | ((context: AbilityContext) => ICost<AbilityContext> | ICost<AbilityContext>[]);
    public readonly nonDependentTargets: any[]; // TargetResolver[]

    /** Return the controller of ability, can be different from card's controller (with bounty for example) */
    public get controller(): Player {
        return this.canBeTriggeredBy === RelativePlayer.Self ? this.card.controller : this.card.controller.opponent;
    }

    public constructor(game: Game, card: Card, properties: IPlayerOrCardAbilityProps<AbilityContext>, type = AbilityType.Action) {
        Contract.assertStringValue(properties.title);

        const hasImmediateEffect = properties.immediateEffect != null;
        const hasTargetResolver = properties.targetResolver != null;
        const hasTargetResolvers = properties.targetResolvers != null;

        const systemTypesCount = [hasImmediateEffect, hasTargetResolver, hasTargetResolvers].reduce(
            (acc, val) => acc + (val ? 1 : 0), 0,
        );

        Contract.assertFalse(systemTypesCount > 1, 'Cannot create ability with multiple system initialization properties');

        this.uuid = uuidv4();
        this.title = properties.title;
        this.type = type;
        this.optional = !!properties.optional;
        this.immediateEffect = properties.immediateEffect;
        this.canResolveWithoutLegalTargets = false;
        this.canBeTriggeredBy = properties.canBeTriggeredBy ?? RelativePlayer.Self;

        Contract.assertFalse(
            !this.optional && (properties.playerChoosingOptional !== undefined || properties.optionalButtonTextOverride !== undefined),
            'Do not set playerChoosingOptional or optionalButtonTextOverride for non-optional abilities'
        );
        this.playerChoosingOptional = properties.playerChoosingOptional ?? RelativePlayer.Self;
        this.optionalButtonTextOverride = properties.optionalButtonTextOverride;

        this.game = game;
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

        this.cost = 'cost' in properties ? this.buildCost(properties.cost as any) : [];

        // TODO: do we still need dependsOn for costs? what would be the use case?
        // for (const cost of this.cost) {
        //     if (cost.dependsOn) {
        //         let dependsOnTarget = this.targetResolvers.find((target) => target.name === cost.dependsOn);
        //         dependsOnTarget.dependentCost = cost;
        //     }
        // }

        this.nonDependentTargets = this.targetResolvers.filter((target) => !target.properties.dependsOn);
    }

    public toString() {
        return this.properties.cardName
            ? `'${this.properties.cardName} ability: ${this.title}'`
            : `'Ability: ${this.title}'`;
    }

    protected buildCost(cost: ICost<AbilityContext> | ICost<AbilityContext>[] | ((context: AbilityContext) => ICost<AbilityContext> | ICost<AbilityContext>[])) {
        if (typeof cost !== 'function') {
            return Helpers.asArray(cost);
        }

        return cost;
    }

    protected buildTargetResolvers(properties: IPlayerOrCardAbilityProps<AbilityContext>) {
        this.targetResolvers = [];
        if (properties.targetResolver) {
            this.targetResolvers.push(this.buildTargetResolver('target', properties.targetResolver));
        } else if (properties.targetResolvers) {
            for (const key of Object.keys(properties.targetResolvers)) {
                this.targetResolvers.push(this.buildTargetResolver(key, properties.targetResolvers[key]));
            }
        }
    }

    protected buildTargetResolver(name: string, properties: IActionTargetResolver) {
        const targetMode = properties.mode;
        switch (targetMode) {
            case TargetMode.Select:
                return new SelectTargetResolver(name, properties, this);
            case TargetMode.DropdownList:
                return new DropdownListTargetResolver(name, properties, this);
            case TargetMode.Player:
            case TargetMode.MultiplePlayers:
                return new PlayerTargetResolver(name, properties, this);
            case TargetMode.BetweenVariable:
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
                Contract.fail(`Attempted to create a TargetResolver with unsupported mode ${targetMode}`);
        }
    }

    public meetsRequirements(context = this.createContext(), ignoredRequirements: string[] = [], thisStepOnly = false): string {
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

    public hasAnyLegalEffects(context: AbilityContext, includeSubSteps = SubStepCheck.None) {
        return true;
    }

    public checkGameActionsForPotential(context) {
        return this.immediateEffect.hasLegalTarget(context);
    }

    /**
     * Return whether all costs are capable of being paid for the ability.
     */
    public canPayCosts(context: AbilityContext): boolean {
        const contextCopy = context.copy({ stage: Stage.Cost });
        return this.getCosts(context).every((cost) => cost.canPay(contextCopy));
    }


    public getCosts(context: AbilityContext, playCosts = true, triggerCosts = true) {
        let costs = typeof this.cost === 'function' ? Helpers.asArray(this.cost(context)) : this.cost;

        costs = costs.map((a) => a);

        if (!playCosts) {
            costs = costs.filter((cost) => !cost.isPlayCost);
        }

        return costs;
    }

    public resolveCosts(context: AbilityContext, results) {
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
     */
    public canResolveSomeTarget(context: AbilityContext): boolean {
        return this.nonDependentTargets.some((target) => target.canResolve(context));
    }

    public resolveEarlyTargets(context: AbilityContext, passHandler = null, canCancel = false) {
        return this.resolveTargetsInner(this.targetResolvers, context, passHandler, canCancel);
    }

    /**
     * Prompts the current player to choose each target defined for the ability.
     */
    public resolveTargets(context: AbilityContext, passHandler = null, canCancel = false) {
        return this.resolveTargetsInner(this.targetResolvers, context, passHandler, canCancel);
    }

    public resolveTargetsInner(targetResolvers, context: AbilityContext, passHandler, canCancel) {
        const targetResults = this.getDefaultTargetResults(context, canCancel);
        for (const target of targetResolvers) {
            context.game.queueSimpleStep(() => target.resolve(context, targetResults, passHandler), `Resolve target '${target.name}' for ${this}`);
        }
        return targetResults;
    }

    public getDefaultTargetResults(context: AbilityContext, canCancel = undefined) {
        return {
            canIgnoreAllCosts:
                context.stage === Stage.PreTarget ? this.getCosts(context).every((cost) => cost.canIgnoreForTargeting) : false,
            cancelled: false,
            payCostsFirst: false,
            delayTargeting: null,
            canCancel
        };
    }

    public resolveRemainingTargets(context: AbilityContext, nextTarget, passHandler = null) {
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

    public hasSomeLegalTarget(context: AbilityContext) {
        return this.nonDependentTargets.some((target) => target.hasLegalTarget(context));
    }

    public checkAllTargets(context: AbilityContext) {
        return this.nonDependentTargets.every((target) => target.checkTarget(context));
    }

    public hasTargetsChosenByPlayer(context: AbilityContext, player: Player = context.player) {
        return (
            this.targetResolvers.some((target) => !target.dependsOnOtherTarget && target.hasTargetsChosenByPlayer(context, player)) ||
            this.immediateEffect?.hasTargetsChosenByPlayer(context, player) ||
            this.getCosts(context).some(
                (cost) => cost.hasTargetsChosenByInitiatingPlayer && cost.hasTargetsChosenByInitiatingPlayer(context)
            )
        );
    }

    public createContext(player: Player = this.card.controller, event = undefined) {
        return new AbilityContext(this.getContextProperties(player, event));
    }

    public getContextProperties(player: Player, event) {
        return {
            ability: this,
            game: this.game,
            player,
            source: this.card,
            stage: Stage.PreTarget
        };
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    public displayMessage(context: AbilityContext) {}

    /**
     * Executes the ability once all costs have been paid. Inheriting classes
     * should override this method to implement their behavior; by default it
     * does nothing.
     */

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    public executeHandler(context: AbilityContext) {}

    public isAction() {
        return this.type === AbilityType.Action;
    }

    public isTriggeredAbility() {
        return this.type === AbilityType.Triggered || this.type === AbilityType.ReplacementEffect;
    }

    // TODO: refactor the other methods to also be type predicates
    /**
     * Indicates whether a card is played as part of the resolution this ability.
     */
    public isPlayCardAbility(): this is PlayCardAction {
        return false;
    }

    /** Indicates whether this ability is an ability from card text as opposed to other types of actions like playing a card */
    public isCardAbility(): this is CardAbilityStep {
        return false;
    }

    /** Indicates whether this ability is an "activated" ability on a card, as opposed to a constant ability */
    public isActivatedAbility() {
        return false;
    }

    public isKeywordAbility() {
        return false;
    }

    public isAttackAction(): this is InitiateAttackAction {
        return false;
    }

    public isEpicAction(): this is EpicActionAbility {
        return false;
    }
}