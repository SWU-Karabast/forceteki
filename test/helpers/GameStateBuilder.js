const Contract = require('../../server/game/core/utils/Contract');
const { SwuGameFormat } = require('../../server/SwuGameFormat.js');
const Util = require('./Util.js');
const DeckBuilder = require('./DeckBuilder.js');
const GameFlowWrapper = require('./GameFlowWrapper.js');
const { LocalFolderCardDataGetter } = require('../../server/utils/cardData/LocalFolderCardDataGetter');
const fs = require('fs');

class GameStateBuilder {
    static async create() {
        const directory = 'test/json';
        if (!fs.existsSync(directory)) {
            throw new TestSetupError(`Json card definitions folder ${directory} not found, please run 'npm run get-cards'`);
        }

        const cardDataGetter = new LocalFolderCardDataGetter(directory);
        const deckBuilder = await DeckBuilder.create(cardDataGetter);

        return new GameStateBuilder(cardDataGetter, deckBuilder);
    }

    constructor(cardDataGetter, deckBuilder) {
        this.proxiedGameFlowWrapperMethods = [
            'advancePhases',
            'allPlayersInInitiativeOrder',
            'getPlayableCardTitles',
            'getChatLog',
            'getChatLogs',
            'getPromptedPlayer',
            'keepStartingHand',
            'moveToNextActionPhase',
            'moveToRegroupPhase',
            'nextPhase',
            'selectInitiativePlayer',
            'setDamage',
            'skipSetupPhase',
            'startGame'
        ];

        this.cardDataGetter = cardDataGetter;
        this.deckBuilder = deckBuilder;
    }

    /**
     * @param {SwuSetupTestOptions} setupTestOptions
     * @param {any} router
     * @param {PlayerInfo} player1Info
     * @param {PlayerInfo} player2Info
     * @returns {Game}
     */
    setUpTestGame(setupTestOptions, router, player1Info, player2Info) {
        const gameFlowWrapper = new GameFlowWrapper(
            router,
            { id: player1Info.id, username: player1Info.username },
            { id: player2Info.id, username: player2Info.username }
        );

        const testContext = {};
        this.attachTestInfoToObj(testContext, gameFlowWrapper, player1Info.username, player2Info.username);
        this.setupGameState(testContext, setupTestOptions);

        return gameFlowWrapper.game;
    }

    /**
     * @param {any} toObj
     * @param {GameFlowWrapper} gameFlowWrapper
     * @param {DeckBuilder} deckBuilder
     * @param {string} player1Name
     * @param {string} player2Name
     */
    attachTestInfoToObj(toObj, gameFlowWrapper, player1Name, player2Name) {
        const game = gameFlowWrapper.game;

        toObj.game = game;
        toObj.player1Object = game.getPlayerByName(player1Name);
        toObj.player2Object = game.getPlayerByName(player2Name);
        toObj.player1 = gameFlowWrapper.player1;
        toObj.player2 = gameFlowWrapper.player2;
        toObj.player1Name = gameFlowWrapper.player1Name;
        toObj.player2Name = gameFlowWrapper.player2Name;

        // attach the game flow wrapper methods directly to the object so they can be called like e.g. 'toObj.setDamage()`
        this.proxiedGameFlowWrapperMethods.forEach((method) => {
            toObj[method] = (...args) => gameFlowWrapper[method].apply(gameFlowWrapper, args);
        });
    }

    /**
     * @param {SwuTestContext} context
     * @param {SwuSetupTestOptions} options
     */
    setupGameState(context, options = {}) {
        // Set defaults
        if (!options.player1) {
            options.player1 = {};
        }
        if (!options.player2) {
            options.player2 = {};
        }

        // validate supplied parameters
        this.validateTopLevelOptions(options);
        this.validatePlayerOptions(options.player1, 'player1', options.phase);
        this.validatePlayerOptions(options.player2, 'player2', options.phase);

        context.game.gameMode = SwuGameFormat.Premier;

        if (options.player1.hasInitiative) {
            context.game.initiativePlayer = context.player1Object;
        } else if (options.player2.hasInitiative) {
            context.game.initiativePlayer = context.player2Object;
        }

        const player1OwnedCards = this.deckBuilder.getOwnedCards(1, options.player1, options.player2);
        const player2OwnedCards = this.deckBuilder.getOwnedCards(2, options.player2, options.player1);

        if (options.hasOwnProperty('autoSingleTarget')) {
            const autoSingleTarget = !!options.autoSingleTarget; // Ensures a boolean value
            context.player1Object.user.settings.optionSettings.autoSingleTarget = autoSingleTarget;
            context.player2Object.user.settings.optionSettings.autoSingleTarget = autoSingleTarget;
        }

        // pass decklists to players. they are initialized into real card objects in the startGame() call
        const [deck1, namedCards1, resources1, drawDeck1] = this.deckBuilder.customDeck(1, player1OwnedCards, options.phase);
        const [deck2, namedCards2, resources2, drawDeck2] = this.deckBuilder.customDeck(2, player2OwnedCards, options.phase);

        context.player1.selectDeck(deck1);
        context.player2.selectDeck(deck2);

        // pass the data for token cards to the game so it can generate them
        context.game.initialiseTokens(this.deckBuilder.tokenData);

        // each player object will convert the card names to real cards on start
        context.startGame();

        if (options.phase !== 'setup') {
            context.player1.player.promptedActionWindows[options.phase] = true;
            context.player2.player.promptedActionWindows[options.phase] = true;

            // Advance the phases to the specified
            context.advancePhases(options.phase);
        } else {
            // Set action window prompt
            context.player1.player.promptedActionWindows['action'] = true;
            context.player2.player.promptedActionWindows['action'] = true;
        }

        // return all zone cards to deck and then set them below
        context.player1.moveAllNonBaseZonesToRemoved();
        context.player2.moveAllNonBaseZonesToRemoved();

        if (options.phase !== 'setup') {
            // Resources
            context.player1.setResourceCards(resources1, ['outsideTheGame']);
            context.player2.setResourceCards(resources2, ['outsideTheGame']);

            // Arenas
            context.player1.setGroundArenaUnits(options.player1.groundArena, ['outsideTheGame']);
            context.player2.setGroundArenaUnits(options.player2.groundArena, ['outsideTheGame']);
            context.player1.setSpaceArenaUnits(options.player1.spaceArena, ['outsideTheGame']);
            context.player2.setSpaceArenaUnits(options.player2.spaceArena, ['outsideTheGame']);

            // Hand + discard
            context.player1.setHand(options.player1.hand, ['outsideTheGame']);
            context.player2.setHand(options.player2.hand, ['outsideTheGame']);
            context.player1.setDiscard(options.player1.discard, ['outsideTheGame']);
            context.player2.setDiscard(options.player2.discard, ['outsideTheGame']);

            // Set Leader state (deployed, exhausted, etc.)
            context.player1.setLeaderStatus(options.player1.leader);
            context.player2.setLeaderStatus(options.player2.leader);

            context.player1.attachOpponentOwnedUpgrades(player2OwnedCards.opponentAttachedUpgrades);
            context.player2.attachOpponentOwnedUpgrades(player1OwnedCards.opponentAttachedUpgrades);
        }

        // Set Base damage
        context.player1.setBaseStatus(options.player1.base);
        context.player2.setBaseStatus(options.player2.base);

        // Deck
        context.player1.setDeck(drawDeck1, ['outsideTheGame']);
        context.player2.setDeck(drawDeck2, ['outsideTheGame']);

        // add named cards to context for easy reference (allows us to do "context.<cardName>")
        // note that if cards map to the same property name (i.e., same title), then they won't be added
        const cardNamesAsProperties = this.convertNonDuplicateCardNamesToProperties(
            [context.player1, context.player2],
            [namedCards1, namedCards2],
            player1OwnedCards.opponentAttachedUpgrades.concat(player2OwnedCards.opponentAttachedUpgrades)
        );

        context.cardPropertyNames = [];
        cardNamesAsProperties.forEach((card) => {
            context[card.propertyName] = card.cardObj;
            context.cardPropertyNames.push(card.propertyName);
        });

        context.game.resolveGameState(true);

        this.attachAbbreviatedContextInfo(context, context);
    }

    /**
     *
     * @param {SwuTestContext} fromContext
     * @param {any} toObj
     */
    attachAbbreviatedContextInfo(fromContext, toObj) {
        toObj.p1Base = fromContext.player1.base;
        toObj.p1Leader = fromContext.player1.leader;
        toObj.p2Base = fromContext.player2.base;
        toObj.p2Leader = fromContext.player2.leader;

        if ('cardPropertyNames' in toObj) {
            return;
        }

        for (const cardName of fromContext.cardPropertyNames) {
            toObj[cardName] = fromContext[cardName];
        }
        toObj.cardPropertyNames = [...fromContext.cardPropertyNames];
    }

    validatePlayerOptions(playerOptions, playerName, startPhase) {
        // list of approved property names
        const noneSetupPhase = [
            'hasInitiative',
            'resources',
            'groundArena',
            'spaceArena',
            'hand',
            'discard',
            'leader',
            'base',
            'deck',
            'resource'
        ];
        // list of approved property names for setup phase
        const setupPhase = [
            'leader',
            'deck',
            'base'
        ];

        // Check for unknown properties
        for (const prop of Object.keys(playerOptions)) {
            if (!noneSetupPhase.includes(prop) && startPhase !== 'setup') {
                throw new Error(`${playerName} has an unknown property '${prop}'`);
            } else if (!setupPhase.includes(prop) && startPhase === 'setup') {
                throw new Error(`${playerName} has an unknown property '${prop}'`);
            }
        }
    }

    validateTopLevelOptions(options) {
        const allowedPropertyNames = [
            'player1',
            'player2',
            'phase',
            'autoSingleTarget'
        ];

        // Check for unknown properties
        for (const prop of Object.keys(options)) {
            if (!allowedPropertyNames.includes(prop)) {
                throw new Error(`test setup options has an unknown property '${prop}'`);
            }
        }
    }

    /**
     * helper for generating a list of property names and card objects to add to the test context.
     * this is so that we can access things as "this.<cardName>"
     */
    convertNonDuplicateCardNamesToProperties(players, cardNames, controlSwapped = []) {
        let mapToPropertyNamesWithCards = (cardNames, player) => cardNames.map((cardName) =>
            this.internalNameToPropertyNames(cardName).map((propertyName) => {
                const isControlSwapped = controlSwapped.filter((card) => card.card === cardName && card.ownerAndController !== player.player.nameField);
                return {
                    propertyName: propertyName,
                    cardObj: (isControlSwapped.length > 0) ? player.findCardByName(cardName, 'any', 'opponent') : player.findCardByName(cardName)
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
    internalNameToPropertyNames(internalName) {
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
}

module.exports = GameStateBuilder;