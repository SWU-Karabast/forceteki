import { AbilityContext } from '../ability/AbilityContext';
import { GameSystem } from '../gameSystem/GameSystem';
import { TriggeredAbilityContext } from '../ability/TriggeredAbilityContext';
import { GameEvent } from '../event/GameEvent';
import Player from '../Player.js';

export interface Result {
    canCancel?: boolean;
    cancelled?: boolean;
}

export interface ICost<TContext extends AbilityContext = AbilityContext> {
    canPay(context: TContext): boolean;

    gameSystem?: GameSystem<TContext>;
    activePromptTitle?: string;

    selectCardName?(player: Player, cardName: string, context: TContext): boolean;
    promptsPlayer?: boolean;
    // TODO: do we still need dependsOn for costs? what would be the use case?
    // dependsOn?: string;
    isPrintedResourceCost?: boolean;
    isPlayCost?: boolean;
    canIgnoreForTargeting?: boolean;

    getActionName?(context: TContext): string;
    getCostMessage?(context: TContext): unknown[];
    hasTargetsChosenByInitiatingPlayer?(context: TContext): boolean;
    queueGenerateEventGameSteps?(events: GameEvent[], context: TContext, result?: Result): void;
    resolve?(context: TContext, result: Result): void;
    payEvent?(context: TContext): GameEvent | GameEvent[];
    pay?(context: TContext): void;
}
