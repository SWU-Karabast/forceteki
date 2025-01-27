import type { Card } from '../../card/Card';
import type Game from '../../Game';
import type Player from '../../Player';
import type { IPlayerPromptStateProperties } from '../../PlayerPromptState';
import * as Contract from '../../utils/Contract';
import type { IPromptPropertiesBase } from '../PromptInterfaces';
import { UiPrompt } from './UiPrompt';

export interface IDropdownListPromptProperties extends IPromptPropertiesBase {
    options: string[];
    source: Card;
    choiceHandler: (choice: string) => void;
}

/**
 * Prompt for distributing presenting the player with a dropdown list of string options.
 * Response data must be returned via {@link Game.menuButton}.
 *
 * Result will be passed to `properties.choiceHandler`.
 */
export class DropdownListPrompt extends UiPrompt {
    private readonly _activePrompt: IPlayerPromptStateProperties;

    public constructor(
        game: Game,
        private readonly player: Player,
        private readonly properties: IDropdownListPromptProperties
    ) {
        Contract.assertTrue(properties.options?.length > 1, `DropdownListPrompt requires at least two options, instead received ${properties.options?.length}`);

        super(game);

        if (!properties.waitingPromptTitle) {
            properties.waitingPromptTitle = 'Waiting for opponent to choose an option for ' + properties.source.name;
        }

        const menuTitle = 'Choose an option from the list';

        this._activePrompt = {
            menuTitle,
            promptTitle: this.properties.promptTitle || (this.properties.source ? this.properties.source.name : undefined),
            dropdownListOptions: this.properties.options,
            promptUuid: this.uuid
        };
    }

    public override activeCondition(player) {
        return player === this.player;
    }

    public override activePrompt(): IPlayerPromptStateProperties {
        return this._activePrompt;
    }

    public override waitingPrompt(): IPlayerPromptStateProperties {
        return { menuTitle: this.properties.waitingPromptTitle, promptUuid: this.uuid };
    }

    /** Selected list option is returned via this call */
    public override menuCommand(player: Player, arg: string, uuid: string): boolean {
        this.checkPlayerAndUuid(player, uuid);
        Contract.assertArrayIncludes(this.properties.options, arg);

        this.properties.choiceHandler(arg);
        this.complete();

        return true;
    }
}
