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

    public override activePromptInternal(player: Player): IPlayerPromptStateProperties {
        const promptText = `Select between ${this.minCardsToResource} and ${this.maxCardsToResource} cards to resource`;

        const hasEnoughSelected = this.hasEnoughSelected(player);

        return {
            selectCardMode: SelectCardMode.Multiple,
            menuTitle: promptText,
            buttons: [{ text: 'Done', arg: 'done', disabled: !hasEnoughSelected }],
            promptTitle: VariableResourcePrompt.title,
            promptUuid: this.uuid,
            promptType: PromptType.Resource
        };
    }

    protected override hasEnoughSelected(player: Player): boolean {
        return this.selectedCards[player.name].length >= this.minCardsToResource;
    }
}
