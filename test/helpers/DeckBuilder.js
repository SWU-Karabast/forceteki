const fs = require('fs');
const path = require('path');

// defaults to fill in with if not explicitly provided by the test case
const defaultLeader = { 1: 'darth-vader#dark-lord-of-the-sith', 2: 'luke-skywalker#faithful-friend' };
const defaultBase = { 1: 'kestro-city', 2: 'administrators-tower' };
const deckFillerCard = 'underworld-thug';
const deckBufferSize = 8; // buffer decks to prevent re-shuffling

class DeckBuilder {
    constructor() {
        this.cards = this.loadCards('test/json/Card');
    }

    loadCards(directory) {
        var cards = {};

        if (!fs.existsSync(directory)) {
            throw new Error(`Json card definitions folder ${directory} not found, please run 'npm run get-cards'`);
        }

        var jsonCards = fs.readdirSync(directory).filter((file) => file.endsWith('.json'));
        jsonCards.forEach((cardPath) => {
            var card = require(path.join('../json/Card', cardPath))[0];
            cards[card.id] = card;
        });

        if (cards.length === 0) {
            throw new Error(`No json card definitions found in ${directory}, please run 'npm run get-cards'`);
        }

        return cards;
    }

    customDeck(playerNumber, playerCards = {}) {
        if (Array.isArray(playerCards.leader)) {
            throw new Error('Test leader must not be specified as an array');
        }
        if (Array.isArray(playerCards.base)) {
            throw new Error('Test base must not be specified as an array');
        }

        let allCards = [];
        let deckSize = deckBufferSize;
        let inPlayCards = [];

        allCards.push(playerCards.leader ? playerCards.leader : defaultLeader[playerNumber]);
        allCards.push(playerCards.base ? playerCards.base : defaultBase[playerNumber]);

        // if user didn't provide explicit resource cards, create default ones to be added to deck
        playerCards.resources = this.padCardListIfNeeded(playerCards.resources, 20);
        playerCards.deck = this.padCardListIfNeeded(playerCards.deck, 8);

        allCards.push(...playerCards.resources);
        allCards.push(...playerCards.deck);

        /**
         * Create the deck from cards in test - deck consists of cards in decks,
         * hand and discard
         */
        if (playerCards.discard) {
            allCards.push(...playerCards.discard);
        }
        if (playerCards.hand) {
            allCards.push(...playerCards.hand);
        }

        inPlayCards = inPlayCards.concat(this.getInPlayCardsForArena(playerCards.groundArena));
        inPlayCards = inPlayCards.concat(this.getInPlayCardsForArena(playerCards.spaceArena));

        //Collect all the cards together
        allCards = allCards.concat(inPlayCards);

        return this.buildDeck(allCards);
    }

    padCardListIfNeeded(cardList, defaultCount) {
        if (cardList == null) {
            return Array(defaultCount).fill(deckFillerCard);
        }
        if (typeof cardList === 'number') {
            return Array(cardList).fill(deckFillerCard);
        }
        return cardList;
    }

    getInPlayCardsForArena(arenaList) {
        if (!arenaList) {
            return [];
        }

        let inPlayCards = [];
        for (const card of arenaList) {
            if (typeof card === 'string') {
                inPlayCards.push(card);
            } else {
                //Add the card itself
                inPlayCards.push(card.card);
                //Add any upgrades
                if (card.upgrades) {
                    let nonTokenUpgrades = card.upgrades.filter((upgrade) =>
                        !['shield', 'experience'].includes(upgrade)
                    );

                    inPlayCards.push(...nonTokenUpgrades);
                }
            }
        }

        return inPlayCards;
    }

    buildDeck(cardInternalNames) {
        var cardCounts = {};
        cardInternalNames.forEach((internalName) => {
            var cardData = this.getCard(internalName);
            if (cardCounts[cardData.id]) {
                cardCounts[cardData.id].count++;
            } else {
                cardCounts[cardData.id] = {
                    count: 1,
                    card: cardData
                };
            }
        });

        return {
            leader: this.filterPropertiesToArray(cardCounts, (count) => count.card.types.includes('leader')),
            base: this.filterPropertiesToArray(cardCounts, (count) => count.card.types.includes('base')),
            deckCards: this.filterPropertiesToArray(cardCounts, (count) => !count.card.types.includes('leader') && !count.card.types.includes('base'))
        };
    }

    getTokenData() {
        return {
            shield: this.getCard('shield'),
            experience: this.getCard('experience')
        };
    }

    getCard(internalName) {
        if (this.cards[internalName]) {
            return this.cards[internalName];
        }

        var cardsByName = this.filterPropertiesToArray(this.cards, (card) => card.internalName === internalName);

        if (cardsByName.length === 0) {
            throw new Error(`Unable to find any card matching ${internalName}`);
        }

        if (cardsByName.length > 1) {
            var matchingLabels = cardsByName.map((card) => card.name).join('\n');
            throw new Error(`Multiple cards match the name ${internalName}. Use one of these instead:\n${matchingLabels}`);
        }

        return cardsByName[0];
    }

    filterPropertiesToArray(obj, predicate) {
        let result = [];
        for (let prop in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, prop) && predicate(obj[prop])) {
                result.push(obj[prop]);
            }
        }
        return result;
    }
}

module.exports = DeckBuilder;
