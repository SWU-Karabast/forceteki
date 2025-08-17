import type Game from '../../Game';
import type { Player } from '../../Player';
import type { IPlayerPromptStateProperties } from '../../PlayerPromptState';
import * as Contract from '../../utils/Contract';
import { ResourcePrompt } from './ResourcePrompt';
import { PromptType, SelectCardMode } from '../PromptInterfaces';

export class VariableResourcePrompt extends ResourcePrompt {
    public static readonly title = 'Resource Step';

    private readonly minCardsToResource: number;
    private readonly maxCardsToResource: number;

    public constructor(game: Game, minCardsToResource: number, maxCardsToResource: number) {
        Contract.assertTrue(maxCardsToResource > minCardsToResource, 'VariableResourcePrompt requires different min and max card counts. For fixed card count, use ResourcePrompt.');

        super(game, maxCardsToResource);

        this.minCardsToResource = minCardsToResource;
        this.maxCardsToResource = maxCardsToResource;
    }

    public override activePromptInternal(): IPlayerPromptStateProperties {
        const promptText = `Select between ${this.minCardsToResource} and ${this.maxCardsToResource} cards to resource`;

        return {
            selectCardMode: SelectCardMode.Multiple,
            menuTitle: promptText,
            buttons: [{ text: 'Done', arg: 'done' }],
            promptTitle: VariableResourcePrompt.title,
            promptUuid: this.uuid,
            promptType: PromptType.Resource
        };
    }

    public override menuCommand(player: Player, arg: string) {
        if (arg === 'done') {
            if (this.completionCondition(player)) {
                return false;
            }
            if (this.selectedCards[player.name].length < this.minCardsToResource) {
                return false;
            }

            this.playersDone[player.name] = true;
            return true;
        }
        return false;
    }
}
