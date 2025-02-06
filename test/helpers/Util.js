const Util = require('../../server/Util.js');
const TestSetupError = require('./TestSetupError.js');

// card can be a single or an array
function checkNullCard(card, prefix = 'Card list contains one more null elements') {
    if (Array.isArray(card)) {
        if (card.some((cardInList) => cardInList == null)) {
            throw new TestSetupError(`${prefix}: ${card.map((cardInList) => getCardName(cardInList)).join(', ')}`);
        }
    }

    if (card == null) {
        throw new TestSetupError('Null card value passed to test method');
    }
}

function getCardName(card) {
    if (card == null) {
        return 'null';
    }
    if (typeof card === 'string') {
        return card;
    }
    return card.internalName;
}

function formatPrompt(prompt, currentActionTargets) {
    if (!prompt) {
        return 'no prompt active';
    }

    return (
        prompt.menuTitle + '\n' +
        prompt.buttons.map((button) => '[ ' + button.text + (button.disabled ? ' (disabled)' : '') + ' ]').join('\n') + '\n' +
        formatSelectableCardsPromptData(prompt, currentActionTargets) + '\n' +
        formatDropdownListOptions(prompt.dropdownListOptions)
    );
}

function formatSelectableCardsPromptData(prompt, currentActionTargets) {
    if (prompt.displayCards?.length !== 0) {
        return prompt.perCardButtons?.length === 0
            ? formatSelectableDisplayCardsPromptData(prompt)
            : formatPerCardButtonDisplayCardsPromptData(prompt);
    }

    if (currentActionTargets?.length !== 0) {
        return formatCurrentActionTargets(currentActionTargets);
    }

    return '';
}

function formatCurrentActionTargets(currentActionTargets) {
    return currentActionTargets.map((obj) => obj['name']).join('\n');
}

function formatSelectableDisplayCardsPromptData(prompt) {
    let result = '';
    for (const displayCard of prompt.displayCards) {
        const selectionOrderStr = displayCard.selectionOrder ? `, selectionOrder: ${displayCard.selectionOrder}` : '';
        result += `[${displayCard.selectionState}${selectionOrderStr}]${displayCard.internalName}\n`;
    }
    return result;
}

function formatPerCardButtonDisplayCardsPromptData(prompt) {
    let result = '';
    for (const card of prompt.displayCards) {
        result += `${card.internalName}: ${prompt.perCardButtons.map((button) => `[${button.text}]`).join('')}\n`;
    }
    return result;
}

function formatBothPlayerPrompts(testContext) {
    if (!testContext) {
        throw new TestSetupError('Null context passed to format method');
    }

    var result = '';
    for (const player of [testContext.player1, testContext.player2]) {
        result += `\n******* ${player.name.toUpperCase()} PROMPT *******\n${formatPrompt(player.currentPrompt(), player.currentActionTargets)}\n`;
    }

    return result;
}

function getPlayerPromptState(player) {
    return {
        selectableCards: copySelectionArray(player.promptState.selectableCards),
        selectedCards: copySelectionArray(player.promptState.selectedCards),
        distributeAmongTargets: player.currentPrompt().distributeAmongTargets,
        dropdownListOptions: player.currentPrompt().dropdownListOptions,
        menuTitle: player.currentPrompt().menuTitle,
        promptTitle: player.currentPrompt().promptTitle
    };
}

function cardNamesToString(cards) {
    return cards.map((card) => card.internalName).join(', ');
}

function copySelectionArray(ara) {
    return ara == null ? [] : [...ara];
}

function promptStatesEqual(promptState1, promptState2) {
    if (
        promptState1.menuTitle !== promptState2.menuTitle ||
        promptState1.promptTitle !== promptState2.promptTitle ||
        promptState1.distributeAmongTargets !== promptState2.distributeAmongTargets ||
        promptState1.dropdownListOptions.length !== promptState2.dropdownListOptions.length ||
        promptState1.selectableCards.length !== promptState2.selectableCards.length ||
        promptState1.selectedCards.length !== promptState2.selectedCards.length
    ) {
        return false;
    }

    return Util.stringArraysEqual(promptState1.selectedCards, promptState2.selectedCards) &&
      Util.stringArraysEqual(promptState1.selectableCards, promptState2.selectableCards) &&
      Util.stringArraysEqual(promptState1.dropdownListOptions, promptState2.dropdownListOptions);
}

function formatDropdownListOptions(options) {
    return options.length > 10 ? options.slice(0, 10).join(', ') + ', ...' : options.join(', ');
}

function isTokenUnit(cardName) {
    return ['battle-droid', 'clone-trooper'].includes(cardName);
}

function isTokenUpgrade(cardName) {
    return ['shield', 'experience'].includes(cardName);
}

function refreshGameState(game) {
    game.resolveGameState(true);

    // if there is currently a prompt open, update the list of selectable cards in case it was changed
    if (game.currentOpenPrompt) {
        game.currentOpenPrompt.highlightSelectableCards();
    }
}

module.exports = {
    checkNullCard,
    formatPrompt,
    getPlayerPromptState,
    promptStatesEqual,
    formatDropdownListOptions,
    formatBothPlayerPrompts,
    isTokenUnit,
    isTokenUpgrade,
    refreshGameState,
    cardNamesToString
};
