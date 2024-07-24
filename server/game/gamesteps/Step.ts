import type { GamePipeline } from '../GamePipeline';
import type BaseCard = require('../card/basecard');
import type Player = require('../player');

export interface Step {
    continue(): undefined | boolean;
    onCardClicked(player: Player, card: BaseCard): boolean;
    onMenuCommand(player: Player, arg: string, uuid: string, method: string): boolean;
    getDebugInfo(): string;
    pipeline?: GamePipeline;
    queueStep?(step: Step): void;
    cancelStep?(): void;
    isComplete?(): boolean;
}
