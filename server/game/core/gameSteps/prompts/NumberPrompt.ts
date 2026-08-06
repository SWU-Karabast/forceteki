import type { Card } from '../../card/Card';
import type { Game } from '../../Game';
import type { Player } from '../../Player';
import type { IPlayerPromptStateProperties } from '../../PlayerPromptState';
import { Contract } from '../../utils/Contract';
import { PromptType } from '../PromptInterfaces';
import type { IPromptPropertiesBase } from '../PromptInterfaces';
import { UiPrompt } from './UiPrompt';

export interface INumberPromptProperties extends IPromptPropertiesBase {
    min: number;
    max: number;
    source: Card;
    choiceHandler: (choice: string) => void;
}

/**
 * Prompt for selecting an integer from a bounded range.
 * Response data must be returned via {@link Game.menuButton}.
 */
export class NumberPrompt extends UiPrompt {
    private readonly _activePrompt: IPlayerPromptStateProperties;

    public constructor(
        game: Game,
        private readonly player: Player,
        private readonly properties: INumberPromptProperties
    ) {
        Contract.assertTrue(Number.isInteger(properties.min), `NumberPrompt min must be an integer, instead received ${properties.min}`);
        Contract.assertTrue(Number.isInteger(properties.max), `NumberPrompt max must be an integer, instead received ${properties.max}`);
        Contract.assertTrue(properties.max > properties.min, `NumberPrompt requires max to be greater than min, instead received min=${properties.min} max=${properties.max}`);

        super(game);

        if (!properties.waitingPromptTitle) {
            properties.waitingPromptTitle = 'Waiting for opponent to choose a number for ' + properties.source.name;
        }

        const activePromptTitle = typeof properties.activePromptTitle === 'string' ? properties.activePromptTitle : null;

        this._activePrompt = {
            menuTitle: activePromptTitle || 'Choose a number',
            promptTitle: this.properties.promptTitle || activePromptTitle || (this.properties.source ? this.properties.source.name : undefined),
            selectNumber: {
                min: this.properties.min,
                max: this.properties.max
            },
            promptUuid: this.uuid,
            promptType: PromptType.Number
        };
    }

    public override activeCondition(player) {
        return player === this.player;
    }

    public override activePromptInternal(): IPlayerPromptStateProperties {
        return this._activePrompt;
    }

    public override waitingPrompt(): IPlayerPromptStateProperties {
        return { menuTitle: this.properties.waitingPromptTitle, promptUuid: this.uuid };
    }

    public override menuCommand(player: Player, arg: string, uuid: string): boolean {
        this.checkPlayerAndUuid(player, uuid);

        const value = Number(arg);
        Contract.assertTrue(Number.isInteger(value), `Number prompt value must be an integer, instead received ${arg}`);
        Contract.assertTrue(value >= this.properties.min && value <= this.properties.max, `Number prompt value ${value} is outside range ${this.properties.min}-${this.properties.max}`);

        this.properties.choiceHandler(arg);
        this.complete();

        return true;
    }
}
