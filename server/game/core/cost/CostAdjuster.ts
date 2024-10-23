import type { AbilityContext } from '../ability/AbilityContext';
import type { IAbilityLimit } from '../ability/AbilityLimit';
import type { Card } from '../card/Card';
import { PlayType, Aspect, CardTypeFilter, AspectFilter } from '../Constants';
import type Game from '../Game';
import type Player from '../Player';
import * as EnumHelpers from '../utils/EnumHelpers';
import * as Contract from '../../core/utils/Contract';

export enum CostAdjustType {
    Increase = 'increase',
    Decrease = 'decrease',

    /** @deprecated Not yet implemented: TODO with Hera */
    IgnoreAllAspects = 'ignoreAllAspects',

    /** @deprecated Not yet implemented: TODO with Kylo/Rey */
    IgnoreSpecificAspects = 'ignoreSpecificAspect'
}

// TODO: refactor so we can add TContext for attachTargetCondition
export interface ICostAdjusterProperties {

    /** The type of cards that can be reduced */
    cardTypeFilter: CardTypeFilter;

    /** The amount to adjust the cost by */
    amount?: number | ((card: Card, player: Player) => number);

    /** The type of cost adjustment */
    costAdjustType: CostAdjustType;

    /** The cost floor (for minimum costs) */
    costFloor?: number;

    /** The number of cost reductions permitted */
    limit?: IAbilityLimit;

    /** Which playType this reduction is active for */
    playingTypes?: PlayType;

    /** Conditional card matching for things like aspects, traits, etc. */
    match?: (card: Card, adjusterSource: Card) => boolean;

    /** @deprecated (not yet fully implemented) For IgnoreSpecificAspects only: the aspects to ignore the cost of */
    ignoredAspects?: AspectFilter;

    /** If the cost adjustment is related to upgrades, this creates a condition for the card that the upgrade is being attached to */
    attachTargetCondition?: (attachTarget: Card, adjusterSource: Card, context: AbilityContext) => boolean;
}

export class CostAdjuster {
    public readonly costFloor: number;
    public readonly costAdjustType: CostAdjustType;
    public readonly ignoredAspects: AspectFilter;
    private amount?: number | ((card: Card, player: Player) => number);
    private match?: (card: Card, adjusterSource: Card) => boolean;
    private cardTypeFilter?: CardTypeFilter;
    private attachTargetCondition?: (attachTarget: Card, adjusterSource: Card, context: AbilityContext<any>) => boolean;
    private limit?: IAbilityLimit;
    private playingTypes?: PlayType[];

    public constructor(
        private game: Game,
        private source: Card,
        properties: ICostAdjusterProperties
    ) {
        this.costAdjustType = properties.costAdjustType;
        if (this.costAdjustType === CostAdjustType.Increase || this.costAdjustType === CostAdjustType.Decrease) {
            Contract.assertNotNullLike(properties.amount, 'Amount is required for Increase and Decrease.');
        }
        this.amount = properties.amount || 1;
        this.costFloor = properties.costFloor || 0;
        // TODO: Implement this further for Rey/Kylo
        if (this.costAdjustType === CostAdjustType.IgnoreSpecificAspects) {
            Contract.assertNotNullLike(this.ignoredAspects, 'Ignored Aspect list is required for IgnoreSpecificAspects');
            this.ignoredAspects = properties.ignoredAspects;
        }
        this.match = properties.match;
        this.cardTypeFilter = properties.cardTypeFilter;
        this.attachTargetCondition = properties.attachTargetCondition;
        this.playingTypes =
            properties.playingTypes &&
            (Array.isArray(properties.playingTypes) ? properties.playingTypes : [properties.playingTypes]);
        this.limit = properties.limit;
        if (this.limit) {
            this.limit.registerEvents(game);
        }
    }

    public canAdjust(playingType: PlayType, card: Card, attachTarget?: Card, ignoreType = false, ignoredAspects?: Aspect): boolean {
        if (this.limit && this.limit.isAtMax(this.source.controller)) {
            return false;
        } else if (!ignoreType && this.cardTypeFilter && !EnumHelpers.cardTypeMatches(card.type, this.cardTypeFilter)) {
            return false;
        } else if (this.playingTypes && !this.playingTypes.includes(playingType)) {
            return false;
        } else if (this.ignoredAspects && this.ignoredAspects !== ignoredAspects) {
            return false;
        }
        const context = this.game.getFrameworkContext(card.controller);
        return this.checkMatch(card) && this.checkAttachTargetCondition(context, attachTarget);
    }

    public getAmount(card: Card, player: Player): number {
        return typeof this.amount === 'function' ? this.amount(card, player) : this.amount;
    }

    public markUsed(): void {
        this.limit?.increment(this.source.controller);
    }

    public isExpired(): boolean {
        return !!this.limit && this.limit.isAtMax(this.source.controller) && !this.limit.isRepeatable();
    }

    public unregisterEvents(): void {
        this.limit?.unregisterEvents(this.game);
    }

    private checkMatch(card: Card) {
        return !this.match || this.match(card, this.source);
    }

    private checkAttachTargetCondition(context: AbilityContext, target?: Card) {
        return !this.attachTargetCondition || (target && this.attachTargetCondition(target, this.source, context));
    }
}
