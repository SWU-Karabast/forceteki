import type Player from "../../Player";
import { UiPrompt } from "./UiPrompt";

export class AllPlayerPrompt extends UiPrompt {
    activeCondition(player: Player) {
        return !this.completionCondition(player);
    }

    completionCondition(player: Player) {
        return false;
    }

    isComplete() {
        return this.game.getPlayers().every(player => this.completionCondition(player))
    }
}