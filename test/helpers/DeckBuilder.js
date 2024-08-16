const fs = require('fs');
const path = require('path');

// defaults to fill in with if not explicitly provided by the test case
const defaultLeader = 'darth-vader#dark-lord-of-the-sith';
const defaultBase = 'kestro-city';
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

    /*
        options: as player1 and player2 are described in setupTest #1514
    */
    customDeck(playerCards = {}) {
        let leader = defaultLeader;
        let base = defaultBase;
        let allCards = [];
        let deckSize = deckBufferSize;
        let inPlayCards = [];

        if (playerCards.leader) {
            leader = playerCards.leader;
        }
        if (playerCards.base) {
            base = playerCards.base;
        }

        /**
         * Create the deck from cards in test - deck consists of cards in decks,
         * hand and discard
         */
        let initialDeckSize = 0;
        if (playerCards.deckSize) {   // allow override in case some card has adjusted this
            deckSize = playerCards.deckSize;
        }
        if (playerCards.deck) {
            allCards.push(...playerCards.deck);
            initialDeckSize = playerCards.deck.length;
        }
        if (playerCards.discard) {
            allCards.push(...playerCards.discard);
        }
        if (playerCards.hand) {
            allCards.push(...playerCards.hand);
        }
        if (playerCards.resources) {
            allCards.push(...playerCards.resources);
        }
        //Add cards to prevent reshuffling due to running out of cards
        for (let i = initialDeckSize; i < deckSize; i++) {
            allCards.push(deckFillerCard);
        }

        inPlayCards = inPlayCards.concat(this.getInPlayCardsForArena(playerCards.groundArena));
        inPlayCards = inPlayCards.concat(this.getInPlayCardsForArena(playerCards.spaceArena));

        //Collect all the cards together
        allCards = allCards.concat(inPlayCards).concat(leader)
            .concat(base);

        return this.buildDeck(allCards);
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
                //Add any attachments
                if (card.attachments) {
                    inPlayCards.push(...card.attachments);
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
