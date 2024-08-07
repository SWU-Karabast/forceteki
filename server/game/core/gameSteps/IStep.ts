import type { GamePipeline } from '../GamePipeline';
import type Card from '../card/Card';
import type Player from '../Player';

export interface IStep {
    continue(): undefined | boolean;
    onCardClicked(player: Player, card: Card): boolean;
    onMenuCommand(player: Player, arg: string, uuid: string, method: string): boolean;
    getDebugInfo(): string;
    pipeline?: GamePipeline;
    queueStep?(step: IStep): void;
    cancelStep?(): void;
    isComplete?(): boolean;
}
