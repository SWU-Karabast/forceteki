import type { AbilityContext } from '../ability/AbilityContext';
import type { ICost, ICostResult } from './ICost';
import type { GameSystem } from '../gameSystem/GameSystem';
import type { GameEvent } from '../event/GameEvent';

/**
 * Class that wraps a {@link GameSystem} so it can be represented as an action cost
 */
export class GameSystemCost<TContext extends AbilityContext = AbilityContext> implements ICost<TContext> {
    public readonly gameSystem: GameSystem<TContext>;

    private readonly ifPossible: boolean;

    /** @param ifPossible Indicates that the cost should be paid if possible, but don't fail the action if not */
    public constructor(gameSystem: GameSystem<TContext>, ifPossible: boolean = false) {
        this.gameSystem = gameSystem;
        this.ifPossible = ifPossible;
    }

    public getActionName(context: TContext): string {
        return this.gameSystem.name;
    }

    /**
     * Determine whether this cost can be paid in the current context by evaluating whether the
     * underlying {@link GameSystem} has any legal targets
     * @param context Context of ability being executed
     * @returns True if this cost can be paid, false otherwise
     */
    public canPay(context: TContext): boolean {
        return this.ifPossible || this.gameSystem.hasLegalTarget(context);
    }

    public queueGenerateEventGameSteps(events: GameEvent[], context: TContext, result: ICostResult): void {
        // if the game system has no target but payment is optional, just return
        if (!this.gameSystem.hasLegalTarget(context) && this.ifPossible) {
            return;
        }

        context.costs[this.gameSystem.name] = this.gameSystem.generatePropertiesFromContext(context).target;
        this.gameSystem.queueGenerateEventGameSteps(events, context);
    }

    public getCostMessage(context: TContext): [string, any[]] {
        return this.gameSystem.getCostMessage(context);
    }
}
