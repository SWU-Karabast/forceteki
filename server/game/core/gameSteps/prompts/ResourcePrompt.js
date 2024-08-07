const _ = require('underscore');
const { Location } = require('../../Constants.js');
const { AllPlayerPrompt } = require('./AllPlayerPrompt.js');
const { default: Contract } = require('../../utils/Contract.js');

class ResourcePrompt extends AllPlayerPrompt {
    constructor(game, minCardsToResource, maxCardsToResource) {
        super(game);
        this.selectedCards = {};
        this.selectableCards = {};
        this.minCardsToResource = minCardsToResource;
        this.maxCardsToResource = maxCardsToResource;
        _.each(game.getPlayers(), (player) => this.selectedCards[player.name] = []);
    }

    /** @override */
    completionCondition(player) {
        let nSelectedCards = this.selectedCards[player.name].length;
        return this.minCardsToResource <= nSelectedCards && nSelectedCards <= this.maxCardsToResource;
    }

    /** @override */
    continue() {
        if (!this.isComplete()) {
            this.highlightSelectableCards();
        }

        return super.continue();
    }

    highlightSelectableCards() {
        _.each(this.game.getPlayers(), (player) => {
            // cards are only selectable until we've selected as many as allowed
            if (!this.selectableCards[player.name] && this.selectedCards[player.name].length < this.maxCardsToResource) {
                this.selectableCards[player.name] = player.hand.toArray();
            } else {
                this.selectableCards[player.name] = [];
            }
            player.setSelectableCards(this.selectableCards[player.name]);
        });
    }

    /** @override */
    activePrompt() {
        let promptText = null;
        if (this.minCardsToResource !== this.maxCardsToResource) {
            promptText = `Select between ${this.minCardsToResource} and ${this.maxCardsToResource} cards to resource`;
        } else if (this.minCardsToResource !== 1) {
            promptText = `Select ${this.minCardsToResource} cards to resource`;
        } else {
            promptText = 'Select 1 card to resource';
        }

        return {
            selectCard: true,
            menuTitle: promptText,
            buttons: [{ text: 'Done', arg: 'done' }],
            promptTitle: 'Resource Step'
        };
    }

    /** @override */
    onCardClicked(player, card) {
        if (!Contract.assertNotNullLike(player)) {
            return false;
        }

        if (!Contract.assertNotNullLike(card)) {
            return false;
        }

        if (!this.activeCondition(player)) {
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

    /** @override */
    waitingPrompt() {
        return {
            menuTitle: 'Waiting for opponent to choose cards to resource'
        };
    }

    /** @override */
    menuCommand(player, arg) {
        if (arg === 'done') {
            if (!this.completionCondition(player)) {
                return false;
            }

            if (this.selectedCards[player.name].length > 0) {
                for (const card of this.selectedCards[player.name]) {
                    player.resourceCard(card);
                }
                this.game.addMessage('{0} has resourced {1} cards from hand', player, this.selectedCards[player.name].length);
            } else {
                this.game.addMessage('{0} has not resourced any cards', player);
            }
            player.clearSelectedCards();
            player.clearSelectableCards();
            return true;
        }
        return false;
    }
}

module.exports = ResourcePrompt;
