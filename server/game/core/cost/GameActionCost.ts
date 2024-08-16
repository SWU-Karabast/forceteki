import type { AbilityContext } from '../ability/AbilityContext';
import type { ICost, Result } from './ICost';
import type { GameSystem } from '../gameSystem/GameSystem';
import type { GameEvent } from '../event/GameEvent';

/**
 * Class that wraps a {@link GameSystem} so it can be represented as an action cost
 */
export class GameActionCost implements ICost {
    public constructor(public gameSystem: GameSystem) {}

    public getActionName(context: AbilityContext): string {
        return this.gameSystem.name;
    }

    /**
     * Determine whether this cost can be paid in the current context by evaluating whether the
     * underlying {@link GameSystem} has any legal targets
     * @param context Context of ability being executed
     * @returns True if this cost can be paid, false otherwise
     */
    public canPay(context: AbilityContext): boolean {
        return this.gameSystem.hasLegalTarget(context);
    }

    public generateEventsForAllTargets(context: AbilityContext, result: Result): GameEvent[] {
        context.costs[this.gameSystem.name] = this.gameSystem.generatePropertiesFromContext(context).target;
        return this.gameSystem.generateEventsForAllTargets(context);
    }

    public getCostMessage(context: AbilityContext): [string, any[]] {
        return this.gameSystem.getCostMessage(context);
    }
}
