/**
 * helper for generating a list of property names and card objects to add to the test context.
 * this is so that we can access things as "this.<cardName>"
 */
function convertNonDuplicateCardNamesToProperties(players, cardNames) {
    let mapToPropertyNamesWithCards = (cardNames, player) => cardNames.map((cardName) => {
        return {
            propertyName: internalNameToPropertyName(cardName),
            cardObj: player.findCardByName(cardName)
        };
    });

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

function internalNameToPropertyName(internalName) {
    const [title, subtitle] = internalName.split('#');

    const titleWords = title.split('-');

    let propertyName = titleWords[0];
    for (const word of titleWords.slice(1)) {
        const uppercasedWord = word[0].toUpperCase() + word.slice(1);
        propertyName += uppercasedWord;
    }

    return propertyName;
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

module.exports = { convertNonDuplicateCardNamesToProperties, internalNameToPropertyName, checkNullCard };
