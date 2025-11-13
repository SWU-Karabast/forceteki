import type { AbilityContext } from '../ability/AbilityContext';
import type { GameSystem } from '../gameSystem/GameSystem';
import type { GameEvent } from '../event/GameEvent';
import type { Player } from '../Player.js';
import type { ResourceCost } from '../../costs/ResourceCost';
import type { IAbilityCostAdjustmentProperties } from './CostInterfaces';
import type { MetaActionCost } from './MetaActionCost';

export interface ICostResult {
    canCancel: boolean;
    cancelled: boolean;
    costAdjustments?: IAbilityCostAdjustmentProperties;
}

export interface ICost<TContext extends AbilityContext = AbilityContext> {
    canPay(context: TContext): boolean;

    gameSystem?: GameSystem<TContext>;
    activePromptTitle?: string;

    selectCardName?(player: Player, cardName: string, context: TContext): boolean;
    promptsPlayer?: boolean;
    // TODO: do we still need dependsOn for costs? what would be the use case?
    // dependsOn?: string;
    // isPrintedResourceCost?: boolean;
    isPlayCost?: boolean;
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
