import { AbilityContext } from '../ability/AbilityContext';
import { GameSystem } from '../gameSystem/GameSystem';
import { TriggeredAbilityContext } from '../ability/TriggeredAbilityContext';
import { GameEvent } from '../event/GameEvent';
import Player from '../Player.js';

export interface Result {
    canCancel?: boolean;
    cancelled?: boolean;
}

export interface ICost {
    canPay(context: AbilityContext): boolean;

    gameSystem?: GameSystem;
    activePromptTitle?: string;

    selectCardName?(player: Player, cardName: string, context: AbilityContext): boolean;
    promptsPlayer?: boolean;
    dependsOn?: string;
    isPrintedResourceCost?: boolean;
    isPlayCost?: boolean;
    canIgnoreForTargeting?: boolean;

    getActionName?(context: AbilityContext): string;
    getCostMessage?(context: AbilityContext): unknown[];
    hasTargetsChosenByInitiatingPlayer?(context: AbilityContext): boolean;
    queueGenerateEventGameSteps?(events: GameEvent[], context: AbilityContext, result?: Result): void;
    resolve?(context: AbilityContext, result: Result): void;
    payEvent?(context: TriggeredAbilityContext): GameEvent | GameEvent[];
    pay?(context: TriggeredAbilityContext): void;
}
