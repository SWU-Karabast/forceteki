import type { AbilityContext } from '../ability/AbilityContext';
import type { Player } from '../Player';
import { TextHelper } from '../utils/TextHelper';
import type { ICostResult } from './ICost';

/**
 * Cost payment recovery
 *
 * When a player starts paying a cost, some of their choices change the game state before payment is finished (e.g. Exploit
 * defeating units, or Marauder dealing damage to them). If a change can't be predicted when the cost is evaluated (e.g. a
 * replacement effect defeating a unit that was providing a cost reduction), the player may end up unable to finish paying.
 *
 * Per SWU Comp Rules 6.2.4a, if a cost can't be paid the game state is returned to how it was before the card was played.
 * The engine can only snapshot at the start of each action, so the player is offered an **undo** back to the start of the
 * current action. If they don't undo (e.g. it isn't possible, or the opponent denies it), the payment is **abandoned**: the
 * ability doesn't resolve, but costs already paid are not refunded.
 *
 * Whether the undo is offered, whether it requires approval, and whether abandoning is offered are all decided by an
 * {@link ICostPaymentRecoveryPolicy}, which can be replaced on the game via `Game.costPaymentRecoveryPolicy`.
 */

export interface ICostPaymentRecoveryRequest {

    /** The player who can no longer pay the cost */
    player: Player;

    /** Context of the ability or card play that the cost is being paid for */
    context: AbilityContext;

    /** How many recovery undos the player has already used to return to the start of the current action */
    previousRecoveryRollbacks: number;

    /**
     * Whether information has been revealed since the start of the current action (e.g. a draw, a deck search, or an opponent's
     * choice), which the player would be able to act on after undoing
     */
    informationRevealedSinceRollbackPoint: boolean;
}

export interface ICostPaymentRecoveryPolicy {

    /** Whether the player may undo to the start of the current action (only possible if a snapshot for it exists) */
    allowRollback(request: ICostPaymentRecoveryRequest): boolean;

    /**
     * If true, the undo goes through the standard undo flow, which may require the opponent's approval and uses up the player's
     * free undo. Otherwise, the undo happens immediately and doesn't count against the player's free undo.
     */
    rollbackRequiresApproval(request: ICostPaymentRecoveryRequest): boolean;

    /** Whether the player may abandon the payment instead, keeping any costs already paid */
    allowAbandon(request: ICostPaymentRecoveryRequest, rollbackAvailable: boolean): boolean;
}

/**
 * By default, undoing is free unless information has been revealed during the action, in which case it goes through the
 * standard undo flow. Abandoning is only offered if undoing isn't possible.
 */
export const defaultCostPaymentRecoveryPolicy: ICostPaymentRecoveryPolicy = {
    allowRollback: (_request) => true,
    rollbackRequiresApproval: (request) => request.informationRevealedSinceRollbackPoint,
    allowAbandon: (_request, rollbackAvailable) => !rollbackAvailable
};

/**
 * Stops payment of a cost that can no longer be paid and prompts `player` to recover, either by undoing to the start of the
 * current action or by abandoning the payment. Any remaining payment steps are skipped.
 *
 * @param reason Explains why the cost can't be paid (see {@link buildInsufficientResourcesReason}). Worded to make sense
 * without a subject, e.g. "remaining cost after discounts: 4 resources, ready resources: 3".
 */
export function queueUnpayableCostRecovery(context: AbilityContext, abilityCostResult: ICostResult, player: Player, reason: string): void {
    abilityCostResult.cancelled = true;
    abilityCostResult.unpayable = true;

    context.game.queueCostPaymentRecovery(player, context, reason);
}

/** e.g. "remaining cost after discounts: 4 resources, ready resources: 2" */
export function buildInsufficientResourcesReason(requiredResources: number, readyResources: number): string {
    return `remaining cost after discounts: ${TextHelper.resource(requiredResources)}, ready resources: ${readyResources}`;
}
