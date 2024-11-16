const { AbilityContext } = require('../../ability/AbilityContext.js');
const { OngoingEffectSource } = require('../../ongoingEffect/OngoingEffectSource.js');
const { UiPrompt } = require('./UiPrompt.js');

/**
 * General purpose menu prompt. Takes a choices object with menu options and
 * a handler for each. Handlers should return nothing or true in order to complete the prompt.
 *
 * The properties option object may contain the following:
 * choices            - an array of titles for menu buttons
 * handlers           - an array of handlers corresponding to the menu buttons
 * activePromptTitle  - the title that should be used in the prompt for the
 *                      choosing player.
 * waitingPromptTitle - the title to display for opponents.
 * source             - what is at the origin of the user prompt, usually a card;
 *                      used to provide a default waitingPromptTitle, if missing
 * cards              - a list of cards to display as buttons with mouseover support
 * cardCondition      - disables the prompt buttons for any cards which return false
 * cardHandler        - handler which is called when a card button is clicked
 */
class HandlerMenuPrompt extends UiPrompt {
    constructor(game, player, properties) {
        super(game);
        this.player = player;
        if (typeof properties.source === 'string') {
            properties.source = new OngoingEffectSource(game, properties.source);
        } else if (properties.context && properties.context.source) {
            properties.source = properties.context.source;
        }
        if (properties.source && !properties.waitingPromptTitle) {
            properties.waitingPromptTitle = 'Waiting for opponent to use ' + properties.source.name;
        } else if (!properties.source) {
            properties.source = new OngoingEffectSource(game);
        }
        this.properties = properties;
        this.cardCondition = properties.cardCondition || (() => true);
        this.context = properties.context || new AbilityContext({ game: game, player: player, source: properties.source });
        game.getPlayers().forEach((player) => player.clearSelectableCards());
    }

    /** @override */
    activeCondition(player) {
        return player === this.player;
    }

    /** @override */
    activePrompt() {
        let buttons = [];
        if (this.properties.cards) {
            let cardQuantities = {};
            this.properties.cards.forEach((card) => {
                if (cardQuantities[card.id]) {
                    cardQuantities[card.id] += 1;
                } else {
                    cardQuantities[card.id] = 1;
                }
            });
            let cards = this.getUniqueCardsById(this.properties.cards);
            buttons = cards.map((card) => {
                let text = card.name;
                if (cardQuantities[card.id] > 1) {
                    text = text + ' (' + cardQuantities[card.id].toString() + ')';
                }
                return { text: text, arg: card.id, card: card, disabled: !this.cardCondition(card, this.context) };
            });
        }
        buttons = buttons.concat(this.properties.choices.map((choice, index) => {
            return { text: choice, arg: index };
        }));
        if (this.game.manualMode && (!this.properties.choices || this.properties.choices.every((choice) => choice !== 'Cancel'))) {
            buttons = buttons.concat({ text: 'Cancel Prompt', arg: 'cancel' });
        }
        return {
            menuTitle: this.properties.activePromptTitle || 'Select one',
            buttons: buttons,
            controls: this.getAdditionalPromptControls(),
            promptTitle: this.properties.source.name,
            promptUuid: this.uuid
        };
    }

    getUniqueCardsById(cards) {
        const filteredCards = [];
        const seenIds = new Set();

        for (let card of cards) {
            if (seenIds.has(card.id)) {
                continue;
            }

            filteredCards.push(card);

            seenIds.add(card.id);
        }

        return filteredCards;
    }

    getAdditionalPromptControls() {
        if (this.properties.controls && this.properties.controls.type === 'targeting') {
            return [{
                type: 'targeting',
                source: this.properties.source.getShortSummary(),
                targets: this.properties.controls.targets.map((target) => target.getShortSummaryForControls(this.player))
            }];
        }
        if (this.context.source.type === '') {
            return [];
        }
        let targets = this.context.targets ? Object.values(this.context.targets) : [];
        targets = targets.reduce((array, target) => array.concat(target), []);
        if (this.properties.target) {
            targets = Array.isArray(this.properties.target) ? this.properties.target : [this.properties.target];
        }
        if (targets.length === 0 && this.context.event && this.context.event.card) {
            targets = [this.context.event.card];
        }
        return [{
            type: 'targeting',
            source: this.context.source.getShortSummary(),
            targets: targets.map((target) => target.getShortSummaryForControls(this.player))
        }];
    }

    /** @override */
    waitingPrompt() {
        return { menuTitle: this.properties.waitingPromptTitle || 'Waiting for opponent' };
    }

    /** @override */
    // @ts-ignore
    menuCommand(player, arg) {
        if (typeof arg === 'string') {
            if (arg === 'cancel') {
                this.complete();
                return true;
            }
            let card = this.properties.cards.find((card) => card.id === arg);
            if (card && this.properties.cardHandler) {
                this.properties.cardHandler(card);
                this.complete();
                return true;
            }
            return false;
        }

        if (!this.properties.handlers[arg]) {
            return false;
        }

        if (this.properties.handlers[arg]() === false) {
            return false;
        }
        this.complete();
        return true;
    }
}

module.exports = HandlerMenuPrompt;
