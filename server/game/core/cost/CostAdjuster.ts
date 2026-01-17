import type { AbilityContext } from '../ability/AbilityContext';
import type { AbilityLimit } from '../ability/AbilityLimit';
import type { Card } from '../card/Card';
import type { Aspect, CardTypeFilter } from '../Constants';
import { CardType, PlayType, Stage, WildcardCardType } from '../Constants';
import type Game from '../Game';
import type { Player } from '../Player';
import * as Contract from '../../core/utils/Contract';
import type { ExploitCostAdjuster } from '../../abilities/keyword/exploit/ExploitCostAdjuster';
import * as EnumHelpers from '../utils/EnumHelpers';
import type { GameObjectRef, IGameObjectBaseState } from '../GameObjectBase';
import { GameObjectBase } from '../GameObjectBase';
import { registerState, undoObject, undoState } from '../GameObjectUtils';
import { ResourceCostType, type ICostAdjustEvaluationIntermediateResult, type ICostAdjustTriggerResult } from './CostInterfaces';
import type { ICostAdjusterEvaluationTarget, ICostAdjustmentResolutionProperties, ICostAdjustResult, IEvaluationOpportunityCost } from './CostInterfaces';
import type { CostAdjustStage } from './CostInterfaces';
import * as CostHelpers from './CostHelpers';
import type { TargetedCostAdjuster } from './TargetedCostAdjuster';
import type { IUnitCard } from '../card/propertyMixins/UnitProperties';
import type { CostAdjusterWithGameSteps } from './CostAdjusterWithGameSteps';
import type { DefeatCreditTokensCostAdjuster } from './DefeatCreditTokensCostAdjuster';

// TODO: move all these enums + interfaces to CostInterfaces.ts

export enum CostAdjustType {
    Increase = 'increase',
    Decrease = 'decrease',
    Free = 'free',
    IgnoreAllAspects = 'ignoreAllAspects',
    IgnoreSpecificAspects = 'ignoreSpecificAspect',
    IgnoreWildcardAspects = 'ignoreWildcardAspects',
    ModifyPayStage = 'modifyPayStage',
    Exploit = 'exploit',
    ExhaustUnits = 'exhaustUnits',
    DefeatCreditTokens = 'defeatCreditTokens'
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
    match?: (card: Card, adjusterSource?: Card) => boolean;

    /** Whether the cost adjuster should adjust activation costs for abilities. Defaults to false. */
    matchAbilityCosts?: boolean;

    /** Whether the cost adjuster should adjust card effect resource payments (e.g. Blue Leader). Defaults to false. */
    matchCardEffectResourcePayments?: boolean;

    /** If the cost adjustment is related to a specific PlayType, this will ensure it only applies to that playType */
    playType?: PlayType;

    /** If the cost adjustment is related to upgrades, this creates a condition for the card that the upgrade is being attached to */
    attachTargetCondition?: (attachTarget: Card, context: AbilityContext, adjusterSource?: Card) => boolean;

    /**
     * The relative priority of the cost adjuster, compared to other adjusters within the same stage.
     *
     * Higher priority adjusters are applied first, lower priority adjusters are applied later.
     * */
    relativePriority?: CostAdjusterRelativePriority;
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

export interface IIgnoreWildcardAspectsCostAdjusterProperties extends ICostAdjusterPropertiesBase {
    costAdjustType: CostAdjustType.IgnoreWildcardAspects;

    /** The aspects to ignore the cost of */
    wildcardAspects: Set<Aspect>;

    /** How many aspects can be ignored from the wildcards */
    ignoreCount: number;
}

export interface IModifyPayStageCostAdjusterProperties extends ICostAdjusterPropertiesBase {
    costAdjustType: CostAdjustType.ModifyPayStage;

    /** The amount to adjust the cost by */
    payStageAmount: (currentAmount: number) => number;
}

export interface IDefeatCreditTokensCostAdjusterProperties extends ICostAdjusterPropertiesBase {
    costAdjustType: CostAdjustType.DefeatCreditTokens;
}

export type ICostAdjusterProperties =
  | IIgnoreAllAspectsCostAdjusterProperties
  | IIncreaseOrDecreaseCostAdjusterProperties
  | IForFreeCostAdjusterProperties
  | IIgnoreSpecificAspectsCostAdjusterProperties
  | IIgnoreWildcardAspectsCostAdjusterProperties
  | IModifyPayStageCostAdjusterProperties
  | IExploitCostAdjusterProperties
  | IExhaustUnitsCostAdjusterProperties
  | IDefeatCreditTokensCostAdjusterProperties;

export type ITargetedCostAdjusterProperties =
  | IExploitCostAdjusterProperties
  | IExhaustUnitsCostAdjusterProperties;

export interface ICanAdjustProperties {
    attachTargets?: Card[];
    penaltyAspect?: Aspect;
    isAbilityCost?: boolean;
}

export interface ICostAdjusterState extends IGameObjectBaseState {
    source: GameObjectRef<Card>;
    isCancelled: boolean;
}

export interface ITriggerStageTargetSelection {
    card: Card;
    stage: CostAdjustStage;
}


export enum CostAdjustResolutionMode {
    Evaluate = 'evaluate',
    Trigger = 'trigger'
}

export enum CostAdjusterRelativePriority {
    Low = 0,
    Normal = 100,
    High = 200
}

@registerState()
export abstract class CostAdjuster extends GameObjectBase<ICostAdjusterState> {
    public readonly costAdjustStage: CostAdjustStage;
    public readonly costAdjustType: CostAdjustType;
    public readonly relativePriority: CostAdjusterRelativePriority;

    protected readonly limit?: AbilityLimit;

    private readonly amount?: number | ((card: Card, player: Player, context: AbilityContext) => number);
    private readonly match?: (card: Card, adjusterSource?: Card) => boolean;
    private readonly cardTypeFilter?: CardTypeFilter | CardTypeFilter[];
    private readonly playType?: PlayType;
    private readonly attachTargetCondition?: (attachTarget: Card, context: AbilityContext<any>, adjusterSource?: Card,) => boolean;
    private readonly matchAbilityCosts: boolean;
    private readonly matchCardEffectResourcePayments: boolean;

    @undoObject()
    protected accessor sourceCard: Card | null;

    @undoObject()
    protected accessor sourcePlayer: Player;

    @undoState()
    protected accessor isCancelled: boolean;

    public constructor(
        game: Game,
        sourcePlayerOrCard: Card | Player,
        costStage: CostAdjustStage,
        properties: ICostAdjusterProperties
    ) {
        super(game);

        if (sourcePlayerOrCard.isCard()) {
            this.sourceCard = sourcePlayerOrCard;
            this.sourcePlayer = sourcePlayerOrCard.controller;
        } else {
            this.sourceCard = null;
            this.sourcePlayer = sourcePlayerOrCard;
        }

        this.costAdjustStage = costStage;
        this.costAdjustType = properties.costAdjustType;

        if (
            properties.costAdjustType === CostAdjustType.Increase ||
            properties.costAdjustType === CostAdjustType.Decrease
        ) {
            this.amount = properties.amount;
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
        this.relativePriority = properties.relativePriority ?? CostAdjusterRelativePriority.Normal;
        this.matchCardEffectResourcePayments = !!properties.matchCardEffectResourcePayments;
    }

    protected abstract applyMaxAdjustmentAmount(card: Card, context: AbilityContext, result: ICostAdjustResult, previousTargetSelections?: ITriggerStageTargetSelection[]): void;

    public isExploit(): this is ExploitCostAdjuster {
        return false;
    }

    public isTargeted(): this is TargetedCostAdjuster {
        return false;
    }

    public requiresGameSteps(): this is CostAdjusterWithGameSteps {
        return false;
    }

    public isCreditTokenAdjuster(): this is DefeatCreditTokensCostAdjuster {
        return false;
    }

    protected canAdjust(card: Card, context: AbilityContext, evaluationResult: ICostAdjustmentResolutionProperties): boolean {
        if (this.limit && this.limit.isAtMax(this.sourcePlayer)) {
            return false;
        }

        if (evaluationResult.resourceCostType === ResourceCostType.Ability && !this.matchAbilityCosts) {
            return false;
        }

        if (evaluationResult.resourceCostType === ResourceCostType.CardEffectPayment && !this.matchCardEffectResourcePayments) {
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

    public resolveCostAdjustment(card: Card, context: AbilityContext, evaluationResult: ICostAdjustEvaluationIntermediateResult) {
        if (!this.canAdjust(card, context, evaluationResult)) {
            return;
        }

        // this adjuster is eligible to be triggered, add it to the list for the current stage
        evaluationResult.matchingAdjusters.get(this.costAdjustStage).push(this);

        if (evaluationResult.adjustedCost.value === 0) {
            return;
        }

        this.resolveCostAdjustmentInternal(card, context, evaluationResult);
    }

    public checkApplyCostAdjustment(card: Card, context: AbilityContext, triggerResult: ICostAdjustTriggerResult) {
        if (
            this.isCancelled ||
            !this.canAdjust(card, context, triggerResult)
        ) {
            return;
        }

        // track that this adjuster has been triggered for limit purposes
        this.checkAddAdjusterToTriggerList(card, triggerResult);

        this.applyMaxAdjustmentAmount(card, context, triggerResult);
    }

    protected resolveCostAdjustmentInternal(card: Card, context: AbilityContext, evaluationResult: ICostAdjustEvaluationIntermediateResult) {
        this.applyMaxAdjustmentAmount(card, context, evaluationResult);
    }

    protected checkAddAdjusterToTriggerList(card: Card, triggerResult: ICostAdjustTriggerResult) {
        Contract.assertFalse(triggerResult.triggeredAdjusters.has(this), `Cost adjuster has already been triggered for cost adjustment of '${card.internalName}'`);
        triggerResult.triggeredAdjusters.add(this);
    }

    protected setOrAddOpportunityCost(
        target: ICostAdjusterEvaluationTarget,
        additionalOpportunityCost: IEvaluationOpportunityCost,
        stage: CostAdjustStage
    ) {
        let opportunityCostForSource = target.opportunityCost;
        if (!opportunityCostForSource) {
            opportunityCostForSource = new Map<CostAdjustStage, IEvaluationOpportunityCost>();
            target.opportunityCost = opportunityCostForSource;
        }

        const currentOpportunityCost = opportunityCostForSource.get(stage);
        if (!currentOpportunityCost) {
            opportunityCostForSource.set(stage, additionalOpportunityCost);
            return;
        }

        Contract.assertIsNullLike(additionalOpportunityCost.dynamic, 'Cannot add DynamicOpportunityCost on top of existing opportunity cost');
        Contract.assertIsNullLike(currentOpportunityCost.dynamic, 'Cannot add opportunity cost on top of existing dynamic opportunity cost');

        currentOpportunityCost.max += additionalOpportunityCost.max;
    }

    protected subtractCostZeroFloor(currentCost: number, amountToSubtract: number): number {
        return Math.max(currentCost - amountToSubtract, 0);
    }

    protected getMinimumPossibleRemainingCost(
        context: AbilityContext,
        adjustResult: ICostAdjustTriggerResult,
        thisStageDiscount: number = 0,
        previousTargetSelections?: ITriggerStageTargetSelection[]
    ): number {
        const adjustResultCopy = { ...adjustResult, adjustedCost: adjustResult.adjustedCost.copy() };
        adjustResultCopy.adjustedCost.applyStaticDecrease(thisStageDiscount);

        const triggerStages = CostHelpers.getCostAdjustStagesInTriggerOrder();
        const remainingStages = triggerStages.slice(triggerStages.indexOf(adjustResult.adjustStage) + 1);

        for (const stage of remainingStages) {
            const adjustersForStage = adjustResultCopy.matchingAdjusters.get(stage) || [];
            for (const adjuster of adjustersForStage) {
                adjuster.applyMaxAdjustmentAmount(context.source, context, adjustResultCopy, previousTargetSelections);

                if (adjustResultCopy.adjustedCost.value === 0) {
                    break;
                }
            }
        }

        return adjustResultCopy.adjustedCost.value;
    }

    protected getAmount(card: Card, player: Player, context: AbilityContext): number {
        return typeof this.amount === 'function' ? this.amount(card, player, context) : this.amount;
    }

    public markUsed(): void {
        this.limit?.increment(this.sourcePlayer);
    }

    public isExpired(): boolean {
        return !!this.limit && this.limit.isAtMax(this.sourcePlayer) && !this.limit.isRepeatable();
    }

    public cancel(): void {
        this.isCancelled = true;
        this.limit?.unregisterEvents();
    }

    private checkMatch(card: Card) {
        return !this.match || this.match(card, this.sourceCard);
    }

    private checkAttachTargetCondition(context: AbilityContext) {
        if (!this.attachTargetCondition) {
            return true;
        }

        const upgrade = context.source;
        Contract.assertTrue(upgrade.isUpgrade(), `attachTargetCondition can only be used with upgrade cards, attempting to use with '${upgrade.title}'`);

        if (context.stage === Stage.Cost && context.target != null) {
            return this.attachTargetCondition(context.target, context, this.sourceCard);
        }

        // if we're not yet at the "pay cost" stage, evaluate whether any unit on the field meets the attach condition
        for (const unit of context.game.getArenaUnits()) {
            if (
                upgrade.canAttach(unit, context, context.player) &&
                this.attachTargetCondition(unit, context, this.sourceCard)
            ) {
                return true;
            }
        }

        return false;
    }
}
