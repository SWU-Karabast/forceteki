import type Player from '../../Player';
import { UiPrompt } from './UiPrompt';

export abstract class AllPlayerPrompt extends UiPrompt {
    public abstract completionCondition(player: Player): boolean;

    public override activeCondition(player: Player) {
        return !this.completionCondition(player);
    }

    public override isComplete() {
        return this.game.getPlayers().every((player) => this.completionCondition(player));
    }
}
