import type { GamePipeline } from '../GamePipeline';
import type { Card } from '../card/Card';
import type Player from '../Player';

export interface IStep {
    onCardClicked(player: Player, card: Card): boolean;
    onMenuCommand(player: Player, arg: string, uuid: string, method: string): boolean;
    getDebugInfo(): string;
    pipeline?: GamePipeline;
    queueStep?(step: IStep): void;
    cancelStep?(): void;
    isComplete?(): boolean;

    /**
     * Resolve the pipeline step
     * @returns {boolean} True if step has finished resolving upon return, false if it has not (typically because new steps have been queued that need to be resolved first)
     */
    continue(): undefined | boolean;
}
