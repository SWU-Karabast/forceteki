import type Player from "../../Player";
import { UiPrompt } from "./UiPrompt";

export class AllPlayerPrompt extends UiPrompt {
    override activeCondition(player: Player) {
        return !this.completionCondition(player);
    }

    completionCondition(player: Player) {
        return false;
    }

    override isComplete() {
        return this.game.getPlayers().every(player => this.completionCondition(player))
    }
}