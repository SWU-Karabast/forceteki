const fs = require('fs');
const path = require('path');
const TestSetupError = require('./TestSetupError.js');
const Util = require('./Util.js');

// defaults to fill in with if not explicitly provided by the test case
const defaultLeader = { 1: 'darth-vader#dark-lord-of-the-sith', 2: 'luke-skywalker#faithful-friend' };
const defaultBase = { 1: 'kestro-city', 2: 'administrators-tower' };
const playerCardProperties = ['groundArena', 'spaceArena', 'hand', 'resources', 'deck', 'discard', 'leader', 'base', 'opponentAttachedUpgrades'];
const deckFillerCard = 'underworld-thug';
const defaultResourceCount = 20;
const defaultDeckSize = 8; // buffer decks to prevent re-shuffling

class DeckBuilder {
    /** @param {import('../../server/utils/cardData/CardDataGetter.js').CardDataGetter} cardDataGetter */
    constructor(cardDataGetter) {
        this.cards = {};
        this.tokenData = cardDataGetter.getTokenCardsDataSynchronous();

        for (const cardId of cardDataGetter.cardIds) {
            const card = cardDataGetter.getCardSynchronous(cardId);
            this.cards[card.internalName] = card;
        }
    }

    getOwnedCards(playerNumber, playerOptions, oppOptions, arena = 'anyArena') {
        let { groundArena, spaceArena, ...playerCards } = playerOptions;

        let opponentAttachedUpgrades = [];

        if ((arena === 'groundArena' || arena === 'anyArena') && playerOptions.groundArena) {
            if (playerOptions.groundArena.some((card) => card.hasOwnProperty('ownerAndController'))) {
                throw new TestSetupError('Do not use the \'ownerAndController\' property on units, use \'owner\' instead');
            }

            const playerControlled = playerOptions.groundArena.filter((card) => !card.hasOwnProperty('owner') && !card.owner?.endsWith(playerNumber));
            const oppControlled = oppOptions.groundArena?.filter((card) => card.hasOwnProperty('owner') && card.owner?.endsWith(playerNumber));
            playerCards.groundArena = (playerControlled || []).concat((oppControlled || []));

            opponentAttachedUpgrades = opponentAttachedUpgrades.concat(this.getOpponentAttachedUpgrades(playerOptions.groundArena, playerNumber, oppOptions.groundArena, playerCards));
        }
        if ((arena === 'spaceArena' || arena === 'anyArena') && playerOptions.spaceArena) {
            if (playerOptions.spaceArena.some((card) => card.hasOwnProperty('ownerAndController'))) {
                throw new TestSetupError('Do not use the \'ownerAndController\' property on units, use \'owner\' instead');
            }

            const playerControlled = playerOptions.spaceArena.filter((card) => !card.hasOwnProperty('owner') && !card.owner?.endsWith(playerNumber));
            const oppControlled = oppOptions.spaceArena?.filter((card) => card.hasOwnProperty('owner') && card.owner?.endsWith(playerNumber));
            playerCards.spaceArena = (playerControlled || []).concat((oppControlled || []));

            opponentAttachedUpgrades = opponentAttachedUpgrades.concat(this.getOpponentAttachedUpgrades(playerOptions.spaceArena, playerNumber, oppOptions.spaceArena, playerCards));
        }
        playerCards.opponentAttachedUpgrades = opponentAttachedUpgrades;

        // Opposite player has the captured units this player 'owns'
        let capturedCards = [];
        capturedCards = capturedCards.concat(this.getCapturedUnitsFromArena(oppOptions.groundArena));
        capturedCards = capturedCards.concat(this.getCapturedUnitsFromArena(oppOptions.spaceArena));

        playerCards.capturedUnits = capturedCards;

        return playerCards;
    }

    getOpponentAttachedUpgrades(arena, playerNumber, oppArena, playerCards) {
        let opponentAttachedUpgrades = [];

        oppArena?.forEach((card) => {
            if (typeof card !== 'string' && card.hasOwnProperty('upgrades')) {
                for (const upgrade of card.upgrades) {
                    if (typeof upgrade !== 'string') {
                        if (upgrade.hasOwnProperty('owner')) {
                            throw new TestSetupError('Do not use the \'owner\' property on upgrades, use \'ownerAndController\' instead');
                        }

                        if (upgrade.hasOwnProperty('ownerAndController') && upgrade.ownerAndController.endsWith(playerNumber)) {
                            let oppUpgrade = { attachedTo: card.card, ...upgrade };
                            if (card.hasOwnProperty('ownerAndController')) {
                                oppUpgrade.attachedToOwner = card.ownerAndController;
                            }
                            opponentAttachedUpgrades = opponentAttachedUpgrades.concat(oppUpgrade);
                            card.upgrades.splice(card.upgrades.indexOf(upgrade), 1);
                        }
                    }
                }
            }
        });
        return opponentAttachedUpgrades;
    }

    customDeck(playerNumber, playerCards = {}, opponentCards = {}, phase) {
        if (Array.isArray(playerCards.leader)) {
            throw new TestSetupError('Test leader must not be specified as an array');
        }
        if (Array.isArray(playerCards.base)) {
            throw new TestSetupError('Test base must not be specified as an array');
        }

        let allCards = [];
        let inPlayCards = [];
        let capturedCards = [];

        const namedCards = this.getAllNamedCards(playerCards, opponentCards);
        let resources = [];

        allCards.push(this.getLeaderCard(playerCards, playerNumber));
        allCards.push(this.getBaseCard(playerCards, playerNumber));

        // if user didn't provide explicit resource cards, create default ones to be added to deck
        // if the phase is setup the playerCards.resources becomes []
        if (phase !== 'setup') {
            resources = this.padCardListIfNeeded(playerCards.resources, defaultResourceCount);
        } else {
            resources = [];
        }
        playerCards.deck = this.padCardListIfNeeded(playerCards.deck, defaultDeckSize);

        allCards.push(...this.getCardsForResources(resources));
        allCards.push(...playerCards.deck);
        playerCards.opponentAttachedUpgrades.forEach((card) => {
            allCards.push(card.card);
        });

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
        inPlayCards = inPlayCards.concat(this.getUpgradesFromCard(playerCards.leader));

        // Collect all the cards that the opponent has captured as this player owns them
        capturedCards = capturedCards.concat(this.getCapturedUnitsFromArena(opponentCards.groundArena));
        capturedCards = capturedCards.concat(this.getCapturedUnitsFromArena(opponentCards.spaceArena));

        // Collect all the cards together
        allCards = allCards.concat(inPlayCards);
        allCards = allCards.concat(capturedCards);

        return [this.buildDeck(allCards), namedCards, resources, playerCards.deck];
    }

    getAllNamedCards(playerObject, opponentObject) {
        let namedCards = [];
        for (const key of playerCardProperties) {
            var playerValue = playerObject[key];
            if (playerValue !== undefined) {
                namedCards = namedCards.concat(this.getNamedCardsInPlayerEntry(playerValue));
            }
            var opponentValue = opponentObject[key];
            if (opponentValue !== undefined) {
                namedCards = namedCards.concat(this.getNamedCapturedCardsInOpponentEntry(opponentValue));
            }
        }
        return namedCards;
    }

    getNamedCapturedCardsInOpponentEntry(opponentEntry) {
        let namedCards = [];
        if (opponentEntry === null) {
            throw new TestSetupError(`Null test card specifier format: '${opponentEntry}'`);
        }
        if (Array.isArray(opponentEntry)) {
            opponentEntry.forEach((card) => namedCards = namedCards.concat(this.getNamedCapturedCardsInOpponentEntry(card)));
        } else if (typeof opponentEntry === 'object' && opponentEntry !== null && 'card' in opponentEntry && opponentEntry.hasOwnProperty('capturedUnits')) {
            namedCards = namedCards.concat(this.getCapturedUnitsFromCard(opponentEntry));
        }
        return namedCards;
    }

    getNamedCardsInPlayerEntry(playerEntry) {
        let namedCards = [];
        // If number, this might be used by padCardListIfNeeded, and should simply return an array.
        if (typeof playerEntry === 'number') {
            return [];
        }
        if (playerEntry === null) {
            throw new TestSetupError(`Null test card specifier format: '${playerEntry}'`);
        }

        if (typeof playerEntry === 'string') {
            namedCards = namedCards.concat(playerEntry);
        } else if (Array.isArray(playerEntry)) {
            playerEntry.forEach((card) => namedCards = namedCards.concat(this.getNamedCardsInPlayerEntry(card)));
        } else if ('card' in playerEntry) {
            namedCards.push(playerEntry.card);
            if (playerEntry.hasOwnProperty('upgrades')) {
                namedCards = namedCards.concat(this.getUpgradesFromCard(playerEntry));
            }
        } else {
            throw new TestSetupError(`Unknown test card specifier format: '${playerEntry}'`);
        }
        return namedCards;
    }

    getUpgradesFromCard(playerEntry) {
        if (playerEntry && typeof playerEntry !== 'string' && 'upgrades' in playerEntry) {
            return this.getNamedCardsInPlayerEntry(playerEntry.upgrades);
        }

        return [];
    }

    getCapturedUnitsFromCard(playerEntry) {
        if (playerEntry && typeof playerEntry !== 'string' && 'capturedUnits' in playerEntry) {
            return this.getNamedCardsInPlayerEntry(playerEntry.capturedUnits);
        }
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

    getLeaderCard(playerCards, playerNumber) {
        if (!playerCards.leader) {
            return defaultLeader[playerNumber];
        }

        if (typeof playerCards.leader === 'string') {
            return playerCards.leader;
        }

        if ('card' in playerCards.leader) {
            return playerCards.leader.card;
        }

        throw new TestSetupError(`Unknown test leader specifier format: '${playerCards}'`);
    }

    getBaseCard(playerCards, playerNumber) {
        if (!playerCards.base) {
            return defaultBase[playerNumber];
        }

        if (typeof playerCards.base === 'string') {
            return playerCards.base;
        }

        if ('card' in playerCards.base) {
            return playerCards.base.card;
        }

        throw new TestSetupError(`Unknown test leader specifier format: '${playerCards}'`);
    }

    getInPlayCardsForArena(arenaList) {
        if (!arenaList) {
            return [];
        }

        let inPlayCards = [];
        for (const card of arenaList) {
            if (typeof card === 'string') {
                if (!Util.isTokenUnit(card)) {
                    inPlayCards.push(card);
                }
            } else {
                // Add the card itself, if not a token
                if (!Util.isTokenUnit(card.card)) {
                    inPlayCards.push(card.card);
                }

                // Add any upgrades
                if (card.upgrades) {
                    const nonTokenUpgrades = card.upgrades.filter((upgrade) => !Util.isTokenUpgrade(upgrade));

                    for (const upgrade of nonTokenUpgrades) {
                        if (typeof upgrade === 'string') {
                            inPlayCards.push(upgrade);
                        } else {
                            inPlayCards.push(upgrade.card);
                        }
                    }
                }
            }
        }

        return inPlayCards;
    }

    getCapturedUnitsFromArena(arenaList) {
        if (!arenaList) {
            return [];
        }
        let capturedUnits = [];
        for (const card of arenaList) {
            if (typeof card !== 'string' && card.capturedUnits) {
                for (const capturedUnit of card.capturedUnits) {
                    capturedUnits.push(capturedUnit);
                }
            }
        }
        return capturedUnits;
    }


    getCardsForResources(resources) {
        let resourceCards = [];
        for (const card of resources) {
            if (typeof card === 'string') {
                resourceCards.push(card);
            } else {
                resourceCards.push(card.card);
            }
        }

        return resourceCards;
    }

    buildDeck(cardInternalNames, cards) {
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
            throw new TestSetupError(`Unable to find any card matching ${internalName}`);
        }

        if (cardsByName.length > 1) {
            var matchingLabels = cardsByName.map((card) => card.name).join('\n');
            throw new TestSetupError(`Multiple cards match the name ${internalName}. Use one of these instead:\n${matchingLabels}`);
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
