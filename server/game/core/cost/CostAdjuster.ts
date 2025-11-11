import type { AbilityContext } from '../ability/AbilityContext';
import type { AbilityLimit } from '../ability/AbilityLimit';
import type { Card } from '../card/Card';
import type { Aspect, CardTypeFilter } from '../Constants';
import { CardType, PlayType, Stage, WildcardCardType } from '../Constants';
import type Game from '../Game';
import type { Player } from '../Player';
import * as Contract from '../../core/utils/Contract';
import type { ExploitCostAdjuster } from '../../abilities/keyword/exploit/ExploitCostAdjuster';
import type { ICostResult } from './ICost';
import * as EnumHelpers from '../utils/EnumHelpers';
import type { GameObjectRef, IGameObjectBaseState } from '../GameObjectBase';
import { GameObjectBase } from '../GameObjectBase';
import { registerState, undoObject } from '../GameObjectUtils';
import { ResourceCostType, type ICostAdjustEvaluationResult, type ICostAdjustTriggerResult } from './CostInterfaces';
import type { CostAdjustStage, ICostAdjustmentResolutionProperties } from './CostInterfaces';
import * as CostHelpers from './CostHelpers';
import type { IUnitCard } from '../card/propertyMixins/UnitProperties';

// TODO: move all these enums + interfaces to CostInterfaces.ts

export enum CostAdjustType {
    Increase = 'increase',
    Decrease = 'decrease',
    Free = 'free',
    IgnoreAllAspects = 'ignoreAllAspects',
    IgnoreSpecificAspects = 'ignoreSpecificAspect',
    ModifyPayStage = 'modifyPayStage',
    Exploit = 'exploit',
    ExhaustUnits = 'exhaustUnits'
}

// TODO: refactor so we can add TContext for attachTargetCondition
export interface ICostAdjusterPropertiesBase {

    /** The type of cards that can be reduced */
    cardTypeFilter?: CardTypeFilter | CardTypeFilter[];

    /** The type of cost adjustment */
    costAdjustType: CostAdjustType;

    /** The number of cost reductions permitted. Defaults to unlimited. */
    limit?: AbilityLimit;

    /** Conditional card matching for things like aspects, traits, etc. */
    match?: (card: Card, adjusterSource: Card) => boolean;

    /** Whether the cost adjuster should adjust activation costs for abilities. Defaults to false. */
    matchAbilityCosts?: boolean;

    /** If the cost adjustment is related to a specific PlayType, this will ensure it only applies to that playType */
    playType?: PlayType;

    /** If the cost adjustment is related to upgrades, this creates a condition for the card that the upgrade is being attached to */
    attachTargetCondition?: (attachTarget: Card, adjusterSource: Card, context: AbilityContext) => boolean;
}

export interface IIncreaseOrDecreaseCostAdjusterProperties extends ICostAdjusterPropertiesBase {
    costAdjustType: CostAdjustType.Increase | CostAdjustType.Decrease;

    /** The amount to adjust the cost by */
    amount?: number | ((card: Card, player: Player, context: AbilityContext) => number);
}

export interface IForFreeCostAdjusterProperties extends ICostAdjusterPropertiesBase {
    costAdjustType: CostAdjustType.Free;
}

export interface IExploitCostAdjusterProperties extends ICostAdjusterPropertiesBase {
    costAdjustType: CostAdjustType.Exploit;
    exploitKeywordAmount: number;
}

export interface IExhaustUnitsCostAdjusterProperties extends ICostAdjusterPropertiesBase {
    costAdjustType: CostAdjustType.ExhaustUnits;
    canExhaustUnitCondition: (card: IUnitCard, context: AbilityContext) => boolean;
}

export interface IIgnoreAllAspectsCostAdjusterProperties extends ICostAdjusterPropertiesBase {
    costAdjustType: CostAdjustType.IgnoreAllAspects;
}

export interface IIgnoreSpecificAspectsCostAdjusterProperties extends ICostAdjusterPropertiesBase {
    costAdjustType: CostAdjustType.IgnoreSpecificAspects;

    /** The aspect to ignore the cost of */
    ignoredAspect: Aspect;
}

export interface IModifyPayStageCostAdjusterProperties extends ICostAdjusterPropertiesBase {
    costAdjustType: CostAdjustType.ModifyPayStage;

    /** The amount to adjust the cost by */
    amount?: number | ((card: Card, player: Player, context: AbilityContext, currentAmount: number) => number);
}

export type ICostAdjusterProperties =
  | IIgnoreAllAspectsCostAdjusterProperties
  | IIncreaseOrDecreaseCostAdjusterProperties
  | IForFreeCostAdjusterProperties
  | IIgnoreSpecificAspectsCostAdjusterProperties
  | IModifyPayStageCostAdjusterProperties
  | IExploitCostAdjusterProperties
  | IExhaustUnitsCostAdjusterProperties;

export interface ICanAdjustProperties {
    attachTargets?: Card[];
    penaltyAspect?: Aspect;
    isAbilityCost?: boolean;
}

export interface ICostAdjusterState extends IGameObjectBaseState {
    source: GameObjectRef<Card>;
}

@registerState()
export abstract class CostAdjuster extends GameObjectBase<ICostAdjusterState> {
    public readonly costAdjustStage: CostAdjustStage;
    public readonly costAdjustType: CostAdjustType;
    public readonly ignoredAspect: Aspect;

    protected readonly limit: AbilityLimit | null;

    private readonly amount?: number | ((card: Card, player: Player, context: AbilityContext, currentAmount?: number) => number);
    private readonly match?: (card: Card, adjusterSource: Card) => boolean;
    private readonly cardTypeFilter?: CardTypeFilter | CardTypeFilter[];
    private readonly playType?: PlayType;
    private readonly attachTargetCondition?: (attachTarget: Card, adjusterSource: Card, context: AbilityContext<any>) => boolean;
    private readonly matchAbilityCosts: boolean;

    @undoObject()
    protected accessor source: Card;

    public constructor(
        game: Game,
        source: Card,
        properties: ICostAdjusterProperties
    ) {
        super(game);

        this.source = source;

        this.costAdjustStage = this.getCostStage(properties.costAdjustType);
        this.costAdjustType = properties.costAdjustType;
        if (properties.costAdjustType === CostAdjustType.Increase ||
          properties.costAdjustType === CostAdjustType.Decrease ||
          properties.costAdjustType === CostAdjustType.ModifyPayStage) {
            this.amount = properties.amount || 1;
        }

        if (properties.costAdjustType === CostAdjustType.IgnoreSpecificAspects) {
            if (Array.isArray(properties.ignoredAspect)) {
                Contract.assertTrue(properties.ignoredAspect.length > 0, 'Ignored Aspect array is empty');
            }
            this.ignoredAspect = properties.ignoredAspect;
        }

        this.match = properties.match;
        this.cardTypeFilter = properties.cardTypeFilter ?? WildcardCardType.Any;
        this.playType = properties.playType ?? null;
        this.attachTargetCondition = properties.attachTargetCondition;

        this.limit = properties.limit;
        if (this.limit) {
            this.limit.registerEvents();
        }

        this.matchAbilityCosts = !!properties.matchAbilityCosts;
    }

    protected abstract getCostStage(costAdjustType: CostAdjustType): CostAdjustStage;
    protected abstract applyMaxAdjustmentAmount(card: Card, context: AbilityContext, result: ICostAdjustmentResolutionProperties): void;

    public isExploit(): this is ExploitCostAdjuster {
        return false;
    }

    protected canAdjust(card: Card, context: AbilityContext, evaluationResult: ICostAdjustmentResolutionProperties): boolean {
        if (this.limit && this.limit.isAtMax(this.source.controller)) {
            return false;
        } else if (this.ignoredAspect && !evaluationResult.penaltyAspects?.includes(this.ignoredAspect)) {
            return false;
        }

        if (evaluationResult.resourceCostType === ResourceCostType.Ability && !this.matchAbilityCosts) {
            return false;
        }

        if (this.playType && this.playType !== context.playType) {
            return false;
        }

        const cardType = context.playType === PlayType.Piloting ? CardType.NonLeaderUnitUpgrade : card.type;

        return EnumHelpers.cardTypeMatches(cardType, this.cardTypeFilter) &&
          this.checkMatch(card) &&
          this.checkAttachTargetCondition(context);
    }

    public resolveCostAdjustment(card: Card, context: AbilityContext, evaluationResult: ICostAdjustEvaluationResult) {
        if (!this.canAdjust(card, context, evaluationResult)) {
            return;
        }

        // this adjuster is eligible to be triggered, add it to the list for the current stage
        evaluationResult.matchingAdjusters.get(this.costAdjustStage).push(this);

        if (evaluationResult.remainingCost === 0) {
            return;
        }

        this.applyMaxAdjustmentAmount(card, context, evaluationResult);
    }

    public checkApplyCostAdjustment(card: Card, context: AbilityContext, triggerResult: ICostAdjustTriggerResult) {
        Contract.assertFalse(CostHelpers.isTargetedCostAdjusterStage(this.costAdjustStage), `Targeted cost adjuster stages should not use checkApplyCostAdjustment: '${this.costAdjustStage}'`);

        if (!this.canAdjust(card, context, triggerResult)) {
            return;
        }

        // track that this adjuster has been triggered for limit purposes
        this.checkAddAdjusterToTriggerList(card, triggerResult);

        this.applyMaxAdjustmentAmount(card, context, triggerResult);
    }

    protected checkAddAdjusterToTriggerList(card: Card, triggerResult: ICostAdjustTriggerResult) {
        Contract.assertFalse(triggerResult.triggeredAdjusters.has(this), `Cost adjuster has already been triggered for cost adjustment of '${card.internalName}'`);
        triggerResult.triggeredAdjusters.add(this);
    }

    protected subtractCostZeroFloor(currentCost: number, amountToSubtract: number): number {
        return Math.max(currentCost - amountToSubtract, 0);
    }

    protected getMinimumPossibleRemainingCost(context: AbilityContext, adjustResult: ICostAdjustTriggerResult): number {
        const adjustResultCopy = { ...adjustResult };

        const triggerStages = CostHelpers.getCostAdjustStagesInTriggerOrder();
        const remainingStages = triggerStages.slice(triggerStages.indexOf(adjustResult.adjustStage) + 1);

        for (const stage of remainingStages) {
            const adjustersForStage = adjustResultCopy.matchingAdjusters.get(stage) || [];
            for (const adjuster of adjustersForStage) {
                adjuster.applyMaxAdjustmentAmount(context.source, context, adjustResultCopy);

                if (adjustResultCopy.remainingCost === 0) {
                    break;
                }
            }
        }

        return adjustResultCopy.remainingCost;
    }

    // TODO: move this to subclasses
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    public queueGenerateEventGameSteps(events: any[], context: AbilityContext, costAdjustTriggerResult: ICostAdjustTriggerResult, result?: ICostResult): void {}

    // protected
    public getAmount(card: Card, player: Player, context: AbilityContext, currentAmount: number = null): number {
        Contract.assertFalse(this.costAdjustType === CostAdjustType.ModifyPayStage && currentAmount === null, 'currentAmount must be provided for ModifyPayStage cost adjusters');

        return typeof this.amount === 'function' ? this.amount(card, player, context, currentAmount) : this.amount;
    }

    public markUsed(): void {
        this.limit?.increment(this.source.controller);
    }

    public isExpired(): boolean {
        return !!this.limit && this.limit.isAtMax(this.source.controller) && !this.limit.isRepeatable();
    }

    public unregisterEvents(): void {
        this.limit?.unregisterEvents();
    }

    private checkMatch(card: Card) {
        return !this.match || this.match(card, this.source);
    }

    private checkAttachTargetCondition(context: AbilityContext) {
        if (!this.attachTargetCondition) {
            return true;
        }

        const upgrade = context.source;
        Contract.assertTrue(upgrade.isUpgrade(), `attachTargetCondition can only be used with upgrade cards, attempting to use with '${upgrade.title}'`);

        if (context.stage === Stage.Cost && context.target != null) {
            return this.attachTargetCondition(context.target, this.source, context);
        }

        // if we're not yet at the "pay cost" stage, evaluate whether any unit on the field meets the attach condition
        for (const unit of context.game.getArenaUnits()) {
            if (
                upgrade.canAttach(unit, context, context.player) &&
                this.attachTargetCondition(unit, this.source, context)
            ) {
                return true;
            }
        }

        return false;
    }
}
