import type Player from "../../Player";
import { UiPrompt } from "./UiPrompt";

export abstract class AllPlayerPrompt extends UiPrompt {
    override activeCondition(player: Player) {
        return !this.completionCondition(player);
    }

    abstract completionCondition(player: Player): boolean;

    override isComplete() {
        return this.game.getPlayers().every(player => this.completionCondition(player))
    }
}