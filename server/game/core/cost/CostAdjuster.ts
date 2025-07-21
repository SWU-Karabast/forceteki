import type { AbilityContext } from '../ability/AbilityContext';
import type { AbilityLimit } from '../ability/AbilityLimit';
import type { Card } from '../card/Card';
import type { Aspect, CardTypeFilter } from '../Constants';
import { CardType, PlayType, WildcardCardType } from '../Constants';
import type Game from '../Game';
import type { Player } from '../Player';
import * as Contract from '../../core/utils/Contract';
import type { ExploitCostAdjuster } from '../../abilities/keyword/exploit/ExploitCostAdjuster';
import type { ICostResult } from './ICost';
import * as EnumHelpers from '../utils/EnumHelpers';
import type { ResourceCost } from '../../costs/ResourceCost';
import type { GameObjectRef, IGameObjectBaseState } from '../GameObjectBase';
import { GameObjectBase } from '../GameObjectBase';

export enum CostAdjustType {
    Increase = 'increase',
    Decrease = 'decrease',
    Free = 'free',
    IgnoreAllAspects = 'ignoreAllAspects',
    IgnoreSpecificAspects = 'ignoreSpecificAspect',
    ModifyPayStage = 'modifyPayStage'
}

/**
 * Technically there are two stages of the cost step in SWU: calculating and paying.
 * Almost all cost adjustments happen at the calculate stage, but some (like Starhawk) happen at the pay stage.
 */
export enum CostStage {
    Calculate = 'calculate',
    Pay = 'pay'
}

// TODO: refactor so we can add TContext for attachTargetCondition
export interface ICostAdjusterPropertiesBase {

    /** The type of cards that can be reduced */
    cardTypeFilter?: CardTypeFilter;

    /** The type of cost adjustment */
    costAdjustType: CostAdjustType;

    /** The number of cost reductions permitted. Defaults to unlimited. */
    limit?: AbilityLimit;

    /** Conditional card matching for things like aspects, traits, etc. */
    match?: (card: Card, adjusterSource: Card) => boolean;

    /** Whether the cost adjuster should adjust activation costs for abilities. Defaults to false. */
    matchAbilityCosts?: boolean;

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
  | IModifyPayStageCostAdjusterProperties;

export interface ICanAdjustProperties {
    attachTarget?: Card;
    penaltyAspect?: Aspect;
    costStage?: CostStage;
    isAbilityCost?: boolean;
}

export interface ICostAdjusterState extends IGameObjectBaseState {
    source: GameObjectRef<Card>;
    limit: GameObjectRef<AbilityLimit> | null;
}

export class CostAdjuster extends GameObjectBase<ICostAdjusterState> {
    public readonly costAdjustType: CostAdjustType;
    public readonly ignoredAspect: Aspect;
    private readonly amount?: number | ((card: Card, player: Player, context: AbilityContext, currentAmount?: number) => number);
    private readonly match?: (card: Card, adjusterSource: Card) => boolean;
    private readonly cardTypeFilter?: CardTypeFilter;
    private readonly attachTargetCondition?: (attachTarget: Card, adjusterSource: Card, context: AbilityContext<any>) => boolean;
    private readonly costStage: CostStage;
    private readonly matchAbilityCosts: boolean;

    protected get source(): Card {
        return this.game.getFromRef(this.state.source);
    }

    private get limit(): AbilityLimit | null {
        return this.state.limit ? this.game.getFromRef(this.state.limit) : null;
    }

    public constructor(
        game: Game,
        source: Card,
        properties: ICostAdjusterProperties
    ) {
        super(game);

        this.state.source = source.getRef();

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
        this.attachTargetCondition = properties.attachTargetCondition;

        this.state.limit = properties.limit?.getRef();
        if (this.limit) {
            this.limit.registerEvents();
        }

        this.matchAbilityCosts = !!properties.matchAbilityCosts;
    }

    public isExploit(): this is ExploitCostAdjuster {
        return false;
    }

    public canAdjust(card: Card, context: AbilityContext, adjustParams?: ICanAdjustProperties): boolean {
        if (this.limit && this.limit.isAtMax(this.source.controller)) {
            return false;
        } else if (this.ignoredAspect && this.ignoredAspect !== adjustParams?.penaltyAspect) {
            return false;
        }

        if (adjustParams?.isAbilityCost && !this.matchAbilityCosts) {
            return false;
        }

        const cardType = context.playType === PlayType.Piloting ? CardType.NonLeaderUnitUpgrade : card.type;

        return EnumHelpers.cardTypeMatches(cardType, this.cardTypeFilter) &&
          this.checkMatch(card) &&
          this.checkAttachTargetCondition(context, adjustParams?.attachTarget);
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    public queueGenerateEventGameSteps(events: any[], context: AbilityContext, resourceCost: ResourceCost, result?: ICostResult): void {}

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

    private checkAttachTargetCondition(context: AbilityContext, target?: Card) {
        return !this.attachTargetCondition || (target && this.attachTargetCondition(target, this.source, context));
    }
}
