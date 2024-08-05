import type { GamePipeline } from '../GamePipeline';
import type Card = require('../card/Card');
import type Player = require('../Player');

export interface Step {
    continue(): undefined | boolean;
    onCardClicked(player: Player, card: Card): boolean;
    onMenuCommand(player: Player, arg: string, uuid: string, method: string): boolean;
    getDebugInfo(): string;
    pipeline?: GamePipeline;
    queueStep?(step: Step): void;
    cancelStep?(): void;
    isComplete?(): boolean;
}
