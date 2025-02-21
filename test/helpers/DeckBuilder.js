const fs = require('fs');
const path = require('path');
const TestSetupError = require('./TestSetupError.js');
const Util = require('./Util.js');
const Contract = require('../../server/game/core/utils/Contract.js');
const { setCodeToString } = require('../../server/Util.js');
const { Deck } = require('../../server/utils/deck/Deck.js');

// defaults to fill in with if not explicitly provided by the test case
const defaultLeader = { 1: 'darth-vader#dark-lord-of-the-sith', 2: 'luke-skywalker#faithful-friend' };
const defaultBase = { 1: 'kestro-city', 2: 'administrators-tower' };
const playerCardProperties = ['groundArena', 'spaceArena', 'hand', 'resources', 'deck', 'discard', 'leader', 'base', 'opponentAttachedUpgrades', 'unitsCapturedByOpponent'];
const deckFillerCard = 'underworld-thug';
const defaultResourceCount = 20;
const defaultDeckSize = 8; // buffer decks to prevent re-shuffling

class DeckBuilder {
    /** @param {import('../../server/utils/cardData/UnitTestCardDataGetter.js').UnitTestCardDataGetter} cardDataGetter */
    constructor(cardDataGetter) {
        /** @type {Map<string, import('../../server/utils/cardData/CardDataInterfaces.js').ICardDataJson>} */
        this.cards = new Map();

        /** @type {Map<string, string>} */
        this.internalNameToSetCode = new Map();
        this.tokenData = cardDataGetter.tokenData;

        this.cardDataGetter = cardDataGetter;

        for (const cardId of cardDataGetter.cardIds) {
            const card = cardDataGetter.getCardSync(cardId);
            Contract.assertHasProperty(card, 'internalName', 'Invalid card data from card data getter');

            this.cards.set(card.internalName, card);
            this.internalNameToSetCode.set(card.internalName, setCodeToString(card.setId));
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

        // A player could potentially capture their own units (after a take control) - so we have to check all arenas for both
        // players and check ownership. By default, we assume that the opponent is the owner of a captured card if undefined
        let capturedCards = [
            ...this.getCapturedUnitsFromArena(playerOptions.groundArena, (owner) => owner?.endsWith(playerNumber)),
            ...this.getCapturedUnitsFromArena(playerOptions.spaceArena, (owner) => owner?.endsWith(playerNumber)),
            ...this.getCapturedUnitsFromArena(oppOptions.groundArena, (owner) => owner === undefined || owner.endsWith(playerNumber)),
            ...this.getCapturedUnitsFromArena(oppOptions.spaceArena, (owner) => owner === undefined || owner.endsWith(playerNumber)),
        ];

        playerCards.unitsCapturedByOpponent = capturedCards;

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

    customDeck(playerNumber, playerCards = {}, phase) {
        if (Array.isArray(playerCards.leader)) {
            throw new TestSetupError('Test leader must not be specified as an array');
        }
        if (Array.isArray(playerCards.base)) {
            throw new TestSetupError('Test base must not be specified as an array');
        }

        let deckCards = [];
        let inPlayCards = [];

        const namedCards = this.getAllNamedCards(playerCards);
        let resources = [];

        const leader = this.getLeaderCard(playerCards, playerNumber);
        const base = this.getBaseCard(playerCards, playerNumber);

        // if user didn't provide explicit resource cards, create default ones to be added to deck
        // if the phase is setup the playerCards.resources becomes []
        if (phase !== 'setup') {
            resources = this.padCardListIfNeeded(playerCards.resources, defaultResourceCount);
        } else {
            resources = [];
        }
        playerCards.deck = this.padCardListIfNeeded(playerCards.deck, defaultDeckSize);

        deckCards.push(...this.getCardsForResources(resources));
        deckCards.push(...playerCards.deck);
        playerCards.opponentAttachedUpgrades.forEach((card) => {
            deckCards.push(card.card);
        });

        /**
         * Create the deck from cards in test - deck consists of cards in decks,
         * hand and discard
         */
        if (playerCards.discard) {
            deckCards.push(...playerCards.discard);
        }
        if (playerCards.hand) {
            deckCards.push(...playerCards.hand);
        }

        inPlayCards = inPlayCards.concat(this.getInPlayCardsForArena(playerCards.groundArena));
        inPlayCards = inPlayCards.concat(this.getInPlayCardsForArena(playerCards.spaceArena));
        inPlayCards = inPlayCards.concat(this.getUpgradesFromCard(playerCards.leader));

        // Collect all the cards together
        deckCards = deckCards.concat(inPlayCards);

        // Add all the cards already captured by the opponent
        deckCards = deckCards.concat(playerCards.unitsCapturedByOpponent);

        return [this.buildDeck(deckCards, leader, base), namedCards, resources, playerCards.deck];
    }

    getAllNamedCards(playerObject) {
        let namedCards = [];
        for (const key of playerCardProperties) {
            var value = playerObject[key];
            if (value === undefined) {
                continue;
            }

            namedCards = namedCards.concat(this.getNamedCardsInPlayerEntry(value));
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

    validateCapturedUnitProperties(capturedUnit) {
        if (typeof capturedUnit === 'object' && capturedUnit !== null) {
            const validKeys = ['card', 'owner'];
            const capturedUnitKeys = Object.keys(capturedUnit);
            if (capturedUnitKeys.some((key) => !validKeys.includes(key))) {
                throw new TestSetupError(`Invalid property in capturedUnit: ${capturedUnitKeys.join(', ')}`);
            }
        }
    }

    getCapturedUnitsFromArena(arenaList, ownerFilter = () => true) {
        if (!arenaList) {
            return [];
        }
        let capturedUnits = [];
        for (const card of arenaList) {
            if (typeof card !== 'string' && card.capturedUnits) {
                for (const capturedUnit of card.capturedUnits) {
                    this.validateCapturedUnitProperties(capturedUnit);
                    let capturedUnitName = (typeof capturedUnit === 'string') ? capturedUnit : capturedUnit.card;
                    if (ownerFilter(capturedUnit?.owner)) {
                        capturedUnits.push(capturedUnitName);
                    }
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

    /** @returns {import('../../server/utils/deck/Deck').Deck} */
    buildDeck(deckCards, leader, base) {
        const safeGetSetCode = (internalName) => {
            var setCode = this.internalNameToSetCode.get(internalName);
            Contract.assertNotNullLike(setCode, `Unknown card name: ${internalName}`);
            return setCode;
        };

        /** @type {import('../../server/utils/deck/DeckInterfaces.js').IDecklistInternal} */
        const decklist = {
            leader: { id: safeGetSetCode(leader), count: 1 },
            base: { id: safeGetSetCode(base), count: 1 },
            deck: []
        };

        /** @type {Record<string, number>} */
        const deckCardCounts = {};
        for (const deckCardName of deckCards) {
            var setCode = safeGetSetCode(deckCardName);

            if (deckCardCounts[setCode]) {
                deckCardCounts[setCode]++;
            } else {
                deckCardCounts[setCode] = 1;
            }
        }

        for (const [id, count] of Object.entries(deckCardCounts)) {
            decklist.deck.push({ id, count });
        }

        return new Deck(decklist, this.cardDataGetter);
    }

    getCard(internalName) {
        const card = this.cards.get(internalName);
        Contract.assertNotNullLike(card, `Unknown card name: ${internalName}`);
        return card;
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
