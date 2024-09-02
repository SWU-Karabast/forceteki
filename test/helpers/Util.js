function convertNonDuplicateCardNamesToProperties(players, cardNames) {
    // let cardNames = this.player1.findCardsByName(namedCards1);
    // cardNames = cardNames.concat(this.player2.findCardsByName(namedCards2));

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

module.exports = { convertNonDuplicateCardNamesToProperties, internalNameToPropertyName };
