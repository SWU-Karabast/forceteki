import type { AbilityContext } from '../ability/AbilityContext';
import type { IAbilityLimit } from '../ability/AbilityLimit';
import type { Card } from '../card/Card';
import { CardType, PlayType, Aspect, CardTypeFilter } from '../Constants';
import type Game from '../Game';
import type Player from '../Player';
import * as EnumHelpers from '../utils/EnumHelpers';

export interface CostAdjusterProperties {
    penaltyAspect?: Aspect;
    cardTypeFilter?: CardType;
    costFloor?: number;
    limit?: IAbilityLimit;
    playingTypes?: PlayType;
    amount?: number | ((card: Card, player: Player) => number);
    match?: (card: Card, source: Card) => boolean;
    targetCondition?: (target: Card, source: Card, context: AbilityContext) => boolean;
}

export class CostAdjuster {
    private uses = 0; // TODO: is this needed?
    private amount: number | ((card: Card, player: Player) => number);
    private costFloor: number; // TODO: is this needed?
    private match?: (card: Card, source: Card) => boolean;
    private cardTypeFilter?: CardTypeFilter;
    private targetCondition?: (target: Card, source: Card, context: AbilityContext<any>) => boolean;
    private limit?: IAbilityLimit;
    private playingTypes?: PlayType[];

    public constructor(
        private game: Game,
        private source: Card,
        properties: CostAdjusterProperties,
        private penaltyAspect?: Aspect
    ) {
        this.amount = properties.amount || 1;
        this.costFloor = properties.costFloor || 0;
        this.match = properties.match;
        this.cardTypeFilter = properties.cardTypeFilter;
        this.targetCondition = properties.targetCondition;
        this.playingTypes =
            properties.playingTypes &&
            (Array.isArray(properties.playingTypes) ? properties.playingTypes : [properties.playingTypes]);
        this.limit = properties.limit;
        if (this.limit) {
            this.limit.registerEvents(game);
        }
    }

    public canAdjust(playingType: PlayType, card: Card, target?: Card, ignoreType = false, penaltyAspect?: Aspect): boolean {
        if (this.limit && this.limit.isAtMax(this.source.controller)) {
            return false;
        } else if (!ignoreType && this.cardTypeFilter && EnumHelpers.cardTypeMatches(card.type, this.cardTypeFilter)) {
            return false;
        } else if (this.playingTypes && !this.playingTypes.includes(playingType)) {
            return false;
        } else if (this.penaltyAspect && this.penaltyAspect !== penaltyAspect) {
            return false;
        }
        const context = this.game.getFrameworkContext(card.controller);
        return this.checkMatch(card) && this.checkTargetCondition(context, target);
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

    private checkTargetCondition(context: AbilityContext, target?: Card) {
        return !this.targetCondition || (target && this.targetCondition(target, this.source, context));
    }
}
