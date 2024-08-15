import type { AbilityContext } from '../ability/AbilityContext';
import type { ICost, Result } from './ICost';
import type { GameSystem } from '../gameSystem/GameSystem';
import type { Event } from '../event/Event';

/**
 * Class that wraps a {@link GameSystem} so it can be represented as an action cost
 */
export class GameActionCost implements ICost {
    constructor(public gameSystem: GameSystem) {}

    getActionName(context: AbilityContext): string {
        return this.gameSystem.name;
    }

    /**
     * Determine whether this cost can be paid in the current context by evaluating whether the
     * underlying {@link GameSystem} has any legal targets
     * @param context Context of ability being executed
     * @returns True if this cost can be paid, false otherwise
     */
    canPay(context: AbilityContext): boolean {
        return this.gameSystem.hasLegalTarget(context);
    }

    generateEvents(context: AbilityContext, result: Result): Event[] {
        context.costs[this.gameSystem.name] = this.gameSystem.generatePropertiesFromContext(context).target;
        return this.gameSystem.generateEvents(context);
    }

    getCostMessage(context: AbilityContext): [string, any[]] {
        return this.gameSystem.getCostMessage(context);
    }
}
