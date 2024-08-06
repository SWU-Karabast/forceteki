import type { AbilityContext } from '../AbilityContext';
import type { Cost, Result } from '../Costs';
import type { GameAction } from '../GameActions/GameAction';

export class GameActionCost implements Cost {
    constructor(public action: GameAction) {}

    getActionName(context: AbilityContext): string {
        return this.action.name;
    }

    canPay(context: AbilityContext): boolean {
        return this.action.hasLegalTarget(context);
    }

    addEventsToArray(events: any[], context: AbilityContext, result: Result): void {
        context.costs[this.action.name] = this.action.getProperties(context).target;
        this.action.addEventsToArray(events, context);
    }

    getCostMessage(context: AbilityContext): [string, any[]] {
        return this.action.getCostMessage(context);
    }
}
