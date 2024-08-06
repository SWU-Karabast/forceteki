import type { GamePipeline } from '../GamePipeline';
import type BaseCard = require('../basecard');
import type Player = require('../player');
import type Ring = require('../ring');

export interface Step {
    continue(): undefined | boolean;
    onCardClicked(player: Player, card: BaseCard): boolean;
    onRingClicked(player: Player, ring: Ring): boolean;
    onMenuCommand(player: Player, arg: string, uuid: string, method: string): boolean;
    getDebugInfo(): string;
    pipeline?: GamePipeline;
    queueStep?(step: Step): void;
    cancelStep?(): void;
    isComplete?(): boolean;
}
