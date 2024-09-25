/**
 * helper for generating a list of property names and card objects to add to the test context.
 * this is so that we can access things as "this.<cardName>"
 */
function convertNonDuplicateCardNamesToProperties(players, cardNames) {
    let mapToPropertyNamesWithCards = (cardNames, player) => cardNames.map((cardName) =>
        internalNameToPropertyNames(cardName).map((propertyName) => {
            return {
                propertyName: propertyName,
                cardObj: player.findCardByName(cardName)
            };
        })
    ).flat();

    let propertyNamesWithCards = mapToPropertyNamesWithCards(cardNames[0], players[0])
        .concat(mapToPropertyNamesWithCards(cardNames[1], players[1]));

    // remove all instances of any names that are duplicated
    propertyNamesWithCards.sort((a, b) => {
        if (a.propertyName === b.propertyName) {
            return 0;
        }
        return a.propertyName > b.propertyName ? 1 : -1;
    });

    let nonDuplicateCards = [];
    for (let i = 0; i < propertyNamesWithCards.length; i++) {
        if (propertyNamesWithCards[i].propertyName === propertyNamesWithCards[i - 1]?.propertyName ||
            propertyNamesWithCards[i].propertyName === propertyNamesWithCards[i + 1]?.propertyName
        ) {
            continue;
        }
        nonDuplicateCards.push(propertyNamesWithCards[i]);
    }

    return nonDuplicateCards;
}

/** Converts an internalName into one or two property names, depending on whether there is a subtitle */
function internalNameToPropertyNames(internalName) {
    const [title, subtitle] = internalName.split('#');

    const internalNames = subtitle ? [title, title + '-' + subtitle] : [title];

    const propertyNames = [];
    for (const internalName of internalNames) {
        const internalNameWords = internalName.split('-');

        let propertyName = internalNameWords[0];
        if (propertyName[0] >= '0' && propertyName[0] <= '9') {
            propertyName = '_' + propertyName;
        }

        for (const word of internalNameWords.slice(1)) {
            const uppercasedWord = word[0].toUpperCase() + word.slice(1);
            propertyName += uppercasedWord;
        }

        propertyNames.push(propertyName);
    }

    return propertyNames;
}

// card can be a single or an array
function checkNullCard(card, testContext) {
    if (Array.isArray(card)) {
        if (card.some((cardInList) => cardInList == null)) {
            throw new Error(`Card list contains one more null elements: ${card.map((cardInList) => getCardName(cardInList)).join(', ')}`);
        }
    }

    if (card == null) {
        throw new Error('Null card value passed to test method');
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
        prompt.menuTitle +
        '\n' +
        prompt.buttons.map((button) => '[ ' + button.text + (button.disabled ? ' (disabled)' : '') + ' ]').join(
            '\n'
        ) +
        '\n' +
        currentActionTargets.map((obj) => obj['name']).join('\n')
    );
}

function getPlayerPromptState(player) {
    return {
        selectableCards: copySelectionArray(player.promptState.selectableCards),
        selectedCards: copySelectionArray(player.promptState.selectedCards),
        menuTitle: player.currentPrompt().menuTitle,
        promptTitle: player.currentPrompt().promptTitle
    };
}

function copySelectionArray(ara) {
    return ara == null ? [] : [...ara];
}

function promptStatesEqual(promptState1, promptState2) {
    if (
        promptState1.menuTitle !== promptState2.menuTitle ||
        promptState1.promptTitle !== promptState2.promptTitle ||
        promptState1.selectableCards.length !== promptState2.selectableCards.length ||
        promptState1.selectedCards.length !== promptState2.selectedCards.length
    ) {
        return false;
    }

    return stringArraysEqual(promptState1.selectedCards, promptState2.selectedCards) &&
        stringArraysEqual(promptState1.selectableCards, promptState2.selectableCards);
}

function stringArraysEqual(ara1, ara2) {
    ara1.sort();
    ara2.sort();

    for (let i = 0; i < ara1.length; i++) {
        if (ara1[i] !== ara2[i]) {
            return false;
        }
    }

    return true;
}

module.exports = {
    convertNonDuplicateCardNamesToProperties,
    checkNullCard,
    formatPrompt,
    getPlayerPromptState,
    promptStatesEqual,
    stringArraysEqual
};
