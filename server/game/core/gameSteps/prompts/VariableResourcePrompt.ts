import Game from '../../Game';
import type Player from '../../Player';
import Contract from '../../utils/Contract';
import { ResourcePrompt } from './ResourcePrompt';

export class VariableResourcePrompt extends ResourcePrompt {
    private readonly minCardsToResource: number;
    private readonly maxCardsToResource: number;
    private playersDone = new Map<string, boolean>();

    public constructor(game: Game, minCardsToResource: number, maxCardsToResource: number) {
        Contract.assertTrue(maxCardsToResource > minCardsToResource, 'VariableResourcePrompt requires different min and max card counts. For fixed card count, use ResourcePrompt.');

        super(game, maxCardsToResource);

        this.minCardsToResource = minCardsToResource;
        this.maxCardsToResource = maxCardsToResource;
        game.getPlayers().forEach((player) => this.playersDone[player.name] = false);
    }

    public override completionCondition(player: Player) {
        return this.playersDone[player.name];
    }

    public override activePrompt() {
        const promptText = `Select between ${this.minCardsToResource} and ${this.maxCardsToResource} cards to resource`;

        return {
            selectCard: true,
            menuTitle: promptText,
            buttons: [{ text: 'Done', arg: 'done' }],
            promptTitle: 'Resource Step'
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

            this.resourceSelectedCards(player);

            this.playersDone[player.name] = true;
            player.clearSelectedCards();
            player.clearSelectableCards();
            return true;
        }
        return false;
    }
}

