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
        result += `[${displayCard.selectionState}]${displayCard.internalName}\n`;
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

    return stringArraysEqual(promptState1.selectedCards, promptState2.selectedCards) &&
      stringArraysEqual(promptState1.selectableCards, promptState2.selectableCards) &&
      stringArraysEqual(promptState1.dropdownListOptions, promptState2.dropdownListOptions);
}

function stringArraysEqual(ara1, ara2) {
    if (ara1 == null || ara2 == null) {
        throw new TestSetupError('Null array passed to stringArraysEqual');
    }

    if (ara1.length !== ara2.length) {
        return false;
    }

    ara1.sort();
    ara2.sort();

    for (let i = 0; i < ara1.length; i++) {
        if (ara1[i] !== ara2[i]) {
            return false;
        }
    }

    return true;
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

module.exports = {
    checkNullCard,
    formatPrompt,
    getPlayerPromptState,
    promptStatesEqual,
    stringArraysEqual,
    formatDropdownListOptions,
    formatBothPlayerPrompts,
    isTokenUnit,
    isTokenUpgrade,
    cardNamesToString
};
