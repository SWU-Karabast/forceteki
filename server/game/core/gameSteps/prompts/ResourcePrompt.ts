import { Card } from '../../card/Card';
import type Game from '../../Game';
import type Player from '../../Player';
import { IPlayerPromptStateProperties } from '../../PlayerPromptState';
import * as Contract from '../../utils/Contract';
import { AllPlayerPrompt } from './AllPlayerPrompt';

export class ResourcePrompt extends AllPlayerPrompt {
    protected selectedCards = new Map<string, Card[]>();
    protected selectableCards = new Map<string, Card[]>();
    protected playersDone = new Map<string, boolean>();

    public constructor(
        game: Game,
        private readonly nCardsToResource: number
    ) {
        super(game);
        for (const player of game.getPlayers()) {
            this.selectedCards[player.name] = [];
            this.playersDone[player.name] = false;
        }
    }

    public override completionCondition(player: Player) {
        return this.playersDone[player.name];
    }

    public override continue() {
        if (!this.isComplete()) {
            this.highlightSelectableCards();
        } else {
            this.complete();
        }

        return super.continue();
    }

    public highlightSelectableCards() {
        this.game.getPlayers().forEach((player) => {
            // cards are only selectable until we've selected as many as allowed
            if (!this.selectableCards[player.name] && !this.completionCondition(player)) {
                this.selectableCards[player.name] = player.hand;
            } else if (this.completionCondition(player)) {
                this.selectableCards[player.name] = [];
            }
            player.setSelectableCards(this.selectableCards[player.name]);
        });
    }

    public override activePrompt(): IPlayerPromptStateProperties {
        let promptText = null;
        if (this.nCardsToResource !== 1) {
            promptText = `Select ${this.nCardsToResource} cards to resource`;
        } else {
            promptText = 'Select 1 card to resource';
        }

        return {
            selectCard: true,
            menuTitle: promptText,
            buttons: [{ text: 'Done', arg: 'done' }],
            promptTitle: 'Resource Step',
            promptUuid: this.uuid
        };
    }

    public override onCardClicked(player: Player, card: Card) {
        Contract.assertNotNullLike(player);
        Contract.assertNotNullLike(card);

        if (
            !this.activeCondition(player) || !player.hand.includes(card) ||
            this.selectedCards[player.name].length === this.nCardsToResource
        ) {
            return false;
        }

        if (!this.selectedCards[player.name].includes(card)) {
            this.selectedCards[player.name].push(card);
        } else {
            this.selectedCards[player.name] = this.selectedCards[player.name].filter((c) => c !== card);
        }

        player.setSelectedCards(this.selectedCards[player.name]);
        return true;
    }

    public override waitingPrompt() {
        return {
            menuTitle: 'Waiting for opponent to choose cards to resource'
        };
    }

    public override menuCommand(player, arg): boolean {
        if (arg === 'done') {
            if (this.completionCondition(player)) {
                return false;
            }
            if (this.selectedCards[player.name].length < this.nCardsToResource) {
                return false;
            }
            this.playersDone[player.name] = true;
            return true;
        }
        // in the case the command comes as an invalid one
        Contract.fail(`Unexpected menu command: '${arg}'`);
    }

    protected resourceSelectedCards(player: Player) {
        if (this.selectedCards[player.name].length > 0) {
            for (const card of this.selectedCards[player.name]) {
                player.resourceCard(card, false);
            }
            this.game.addMessage('{0} has resourced {1} cards from hand', player, this.selectedCards[player.name].length);
        } else {
            this.game.addMessage('{0} has not resourced any cards', player);
        }
    }

    public override complete() {
        this.game.getPlayers().forEach((player) => this.resourceSelectedCards(player));

        for (const player of this.game.getPlayers()) {
            player.clearSelectedCards();
            player.clearSelectableCards();
        }

        return super.complete();
    }
}
