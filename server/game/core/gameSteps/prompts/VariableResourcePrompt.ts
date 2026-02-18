import type Game from '../../Game';
import type { Player } from '../../Player';
import type { IPlayerPromptStateProperties } from '../../PlayerPromptState';
import * as Contract from '../../utils/Contract';
import { ResourcePrompt } from './ResourcePrompt';
import { PhaseName } from '../../Constants';
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
        const promptText = this.getPromptText(player);

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

    private getPromptText(player: Player): string {
        const basePrompt = `Select between ${this.minCardsToResource} and ${this.maxCardsToResource} cards to resource`;
        const initiativePlayer = this.game.initiativePlayer;
        const initiativeDone = initiativePlayer ? this.completionCondition(initiativePlayer) : true;

        if ( initiativePlayer && initiativePlayer !== player && !initiativeDone) {
            return `${basePrompt}. The initiative player is choosing whether to resource; you may choose now or wait until they've finished.`;
        }

        return basePrompt;
    }

    protected override hasEnoughSelected(player: Player): boolean {
        return this.selectedCards[player.name].length >= this.minCardsToResource;
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
