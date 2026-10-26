import type { AbilityContext } from '../ability/AbilityContext';
import type { GameSystem } from '../gameSystem/GameSystem';
import type { GameEvent } from '../event/GameEvent';
import type { Player } from '../Player.js';
import type { ResourceCost } from '../../costs/ResourceCost';
import type { MetaActionCost } from './MetaActionCost';
import type { ICostAdjustEvaluationResult } from './CostInterfaces';

export interface ICostResult {
    canCancel: boolean;
    cancelled: boolean;
    costAdjustments?: ICostAdjustEvaluationResult;

    /**
     * Set if payment was started but the cost could no longer be paid due to a change in game state (see `CostPaymentRecovery`).
     * Unless the player undoes, the payment is abandoned: the ability doesn't resolve, but costs already paid are not refunded, so
     * the ability's resolution is still committed. `cancelled` is also set so that the remaining payment steps are skipped.
     */
    unpayable?: boolean;
}

export interface ICost<TContext extends AbilityContext = AbilityContext> {
    canPay(context: TContext): boolean;

    gameSystem?: GameSystem<TContext>;
    activePromptTitle?: string | ((context: TContext) => string);

    selectCardName?(player: Player, cardName: string, context: TContext): boolean;
    promptsPlayer?: boolean;
    canIgnoreForTargeting?: boolean;

    getName(): string;

    getActionName?(context: TContext): string;
    getCostMessage?(context: TContext): [string, any[]];
    hasTargetsChosenByInitiatingPlayer?(context: TContext): boolean;
    queueGameStepsForAdjustmentsAndPayment(events: GameEvent[], context: TContext, result?: ICostResult): void;
    resolve?(context: TContext, result: ICostResult): void;

    isResourceCost(): this is ResourceCost;
    isMetaActionCost(): this is MetaActionCost;
}
