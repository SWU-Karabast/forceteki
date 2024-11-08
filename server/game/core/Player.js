const { GameObject } = require('./GameObject');
const { Deck } = require('../Deck.js');
const UpgradePrompt = require('./gameSteps/prompts/UpgradePrompt.js');
const { clockFor } = require('./clocks/ClockSelector.js');
const { CostAdjuster, CostAdjustType } = require('./cost/CostAdjuster');
const { PlayableLocation } = require('./PlayableLocation');
const { PlayerPromptState } = require('./PlayerPromptState.js');
const Contract = require('./utils/Contract');
const {
    CardType,
    EffectName,
    EventName,
    Location,
    RelativePlayer,
    Aspect,
    WildcardLocation,
    PlayType,
    KeywordName
} = require('./Constants');

const EnumHelpers = require('./utils/EnumHelpers');
const Helpers = require('./utils/Helpers');
const { BaseCard } = require('./card/BaseCard');
const { LeaderUnitCard } = require('./card/LeaderUnitCard');
const { InPlayCard } = require('./card/baseClasses/InPlayCard');
const { AbilityContext } = require('./ability/AbilityContext');

class Player extends GameObject {
    constructor(id, user, owner, game, clockDetails) {
        super(game, user.username);

        Contract.assertNotNullLike(id);
        Contract.assertNotNullLike(user);
        Contract.assertNotNullLike(owner);
        Contract.assertNotNullLike(game);
        // clockDetails is optional

        this.user = user;
        this.emailHash = this.user.emailHash;
        this.id = id;
        this.owner = owner;
        this.printedType = 'player';
        this.socket = null;
        this.disconnected = false;
        this.left = false;
        this.lobbyId = null;

        // TODO: add a Zone class for managing these
        this.hand = [];
        this.drawDeck = [];
        this.resources = [];
        this.spaceArena = [];
        this.groundArena = [];
        this.discard = [];
        this.removedFromGame = [];
        this.additionalPiles = {};
        this.canTakeActionsThisPhase = null;

        this.baseZone = [];

        this.leader = null;
        this.base = null;
        this.damageToBase = null;

        this.clock = clockFor(this, clockDetails);

        this.playableLocations = [
            new PlayableLocation(PlayType.PlayFromHand, this, Location.Hand),
            new PlayableLocation(PlayType.Smuggle, this, Location.Resource)
        ];

        this.limitedPlayed = 0;
        this.decklist = {};
        this.decklistNames = {};
        this.costAdjusters = [];
        this.abilityMaxByIdentifier = {}; // This records max limits for abilities
        this.promptedActionWindows = user.promptedActionWindows || {
            // these flags represent phase settings
            action: true,
            regroup: true
        };
        // this.timerSettings = user.settings.timerSettings || {};
        // this.timerSettings.windowTimer = user.settings.windowTimer;
        this.optionSettings = user.settings.optionSettings;
        this.resetTimerAtEndOfRound = false;

        // mainly used for staging new tokens when they are created
        this.outsideTheGameCards = [];

        // TODO: this should be a user setting at some point
        this.autoSingleTarget = true;

        this.promptState = new PlayerPromptState(this);
    }

    startClock() {
        this.clock.start();
        if (this.opponent) {
            this.opponent.clock.opponentStart();
        }
    }

    stopNonChessClocks() {
        if (this.clock.name !== 'Chess Clock') {
            this.stopClock();
        }
    }

    stopClock() {
        this.clock.stop();
    }

    resetClock() {
        this.clock.reset();
    }

    /**
     * Get all cards in this player's arena(s). Any opponent upgrades will be included.
     * @param { WildcardLocation.AnyArena | Location.GroundArena | Location.SpaceArena } arena Arena to select units from
     */
    getArenaCards(arena = WildcardLocation.AnyArena) {
        switch (arena) {
            case Location.GroundArena:
                return [...this.groundArena];
            case Location.SpaceArena:
                return [...this.spaceArena];
            case WildcardLocation.AnyArena:
                return this.spaceArena.concat(this.groundArena);
            default:
                Contract.fail(`Unknown arena type: ${arena}`);
                return [];
        }
    }

    /**
     * Get all units in designated play arena(s) controlled by this player
     * @param { WildcardLocation.AnyArena | Location.GroundArena | Location.SpaceArena } arena Arena to select units from
     */
    getUnitsInPlay(arena = WildcardLocation.AnyArena, cardCondition = (card) => true) {
        return this.getArenaCards(arena).filter((card) => card.isUnit() && cardCondition(card));
    }


    /**
     * Get all units in designated play arena(s) controlled by this player
     * @param { Aspect } aspect Aspect needed for units
     * @param { WildcardLocation.AnyArena | Location.GroundArena | Location.SpaceArena } arena Arena to select units from
     */
    getUnitsInPlayWithAspect(aspect, arena = WildcardLocation.AnyArena, cardCondition = (card) => true) {
        return this.getArenaCards(arena).filter((card) => card.isUnit() && card.hasSomeAspect(aspect) && cardCondition(card));
    }

    /**
     * Get all cards in designated play arena(s) other than the passed card controlled by this player.
     * @param { any } ignoreUnit Unit to filter from the returned results
     * @param { WildcardLocation.AnyArena | Location.GroundArena | Location.SpaceArena } arena Arena to select units from
     */
    getOtherUnitsInPlay(ignoreUnit, arena = WildcardLocation.AnyArena, cardCondition = (card) => true) {
        return this.getArenaCards(arena).filter((card) => card.isUnit() && card !== ignoreUnit && cardCondition(card));
    }

    /**
     * Get all cards in designated play arena(s) other than the passed card controlled by this player.
     * @param { any } ignoreUnit Unit to filter from the returned results
     * @param { Aspect } aspect Aspect needed for units
     * @param { WildcardLocation.AnyArena | Location.GroundArena | Location.SpaceArena } arena Arena to select units from
     */
    getOtherUnitsInPlayWithAspect(ignoreUnit, aspect, arena = WildcardLocation.AnyArena, cardCondition = (card) => true) {
        return this.getArenaCards(arena).filter((card) => card.isUnit() && card !== ignoreUnit && card.hasSomeAspect(aspect) && cardCondition(card));
    }

    /**
     * @param { String } title the title of the unit or leader to check for control of
     * @returns { boolean } true if this player controls a unit or leader with the given title
     */
    controlsLeaderOrUnitWithTitle(title) {
        return this.leader.title === title || this.getArenaCards(WildcardLocation.AnyArena).filter((card) => card.title === title).length > 0;
    }

    getResourceCards() {
        return [...this.resources];
    }

    /**
     * Checks whether a card with a uuid matching the passed card is in the passed _(Array)
     * @param list _(Array)
     * @param card BaseCard
     */
    isCardUuidInList(list, card) {
        return list.any((c) => {
            return c.uuid === card.uuid;
        });
    }

    /**
     * Checks whether a card with a name matching the passed card is in the passed list
     * @param list _(Array)
     * @param card BaseCard
     */
    isCardNameInList(list, card) {
        return list.any((c) => {
            return c.name === card.name;
        });
    }

    /**
     * Checks whether any cards in play are currently marked as selected
     */
    areCardsSelected() {
        return this.getArenaCards().some((card) => {
            return card.selected;
        });
    }

    /**
     * Removes a card with the passed uuid from a list. Returns an _(Array)
     * @param list _(Array)
     * @param {String} uuid
     */
    removeCardByUuid(list, uuid) {
        return list.filter((card) => card.uuid !== uuid);
    }

    /**
     * Returns a card with the passed name in the passed list
     * @param list _(Array)
     * @param {String} name
     */
    findCardByName(list, name) {
        return this.findCard(list, (card) => card.name === name);
    }

    /**
     * Returns a list of cards matching passed name
     * @param list _(Array)
     * @param {String} name
     */
    findCardsByName(list, name) {
        return this.findCards(list, (card) => card.name === name);
    }

    /**
     * Returns a card with the passed uuid in the passed list
     * @param list _(Array)
     * @param {String} uuid
     */
    findCardByUuid(list, uuid) {
        return this.findCard(list, (card) => card.uuid === uuid);
    }

    /**
     * Returns a card with the passed uuid from cardsInPlay
     * @param {String} uuid
     */
    findCardInPlayByUuid(uuid) {
        return this.findCard(this.getArenaCards(), (card) => card.uuid === uuid);
    }

    /**
     * Returns a card which matches passed predicate in the passed list
     * @param cardList _(Array)
     * @param {Function} predicate - BaseCard => Boolean
     */
    findCard(cardList, predicate) {
        var cards = this.findCards(cardList, predicate);
        if (!cards || cards.length === 0) {
            return undefined;
        }

        return cards[0];
    }

    /**
     * Returns an Array of BaseCard which match passed predicate in the passed list
     * @param cardList _(Array)
     * @param {Function} predicate - BaseCard => Boolean
     */
    findCards(cardList, predicate) {
        Contract.assertNotNullLike(cardList);

        var cardsToReturn = [];

        cardList.forEach((card) => {
            if (predicate(card)) {
                cardsToReturn.push(card);
            }

            return cardsToReturn;
        });

        return cardsToReturn;
    }

    // TODO: add support for checking upgrades
    /**
     * Returns if a unit is in play that has the passed trait
     * @param {string} trait
     * @param {any} ignoreUnit
     * @returns {boolean} true/false if the trait is in play
     */
    isTraitInPlay(trait, ignoreUnit = null) {
        return ignoreUnit != null
            ? this.getOtherUnitsInPlay(ignoreUnit).some((card) => card.hasSomeTrait(trait))
            : this.getUnitsInPlay().some((card) => card.hasSomeTrait(trait));
    }

    /**
     * Returns if a unit is in play that has the passed aspect
     * @param {Aspect} aspect
     * @param {any} ignoreUnit
     * @returns {boolean} true/false if the trait is in play
     */
    isAspectInPlay(aspect, ignoreUnit = null) {
        return ignoreUnit != null
            ? this.getOtherUnitsInPlay(ignoreUnit).some((card) => card.hasSomeAspect(aspect))
            : this.getUnitsInPlay().some((card) => card.hasSomeTrait(aspect));
    }

    /**
     * Returns true if any units or upgrades controlled by this player match the passed predicate
     * @param {Function} predicate - DrawCard => Boolean
     */
    anyCardsInPlay(predicate) {
        return this.game.allCards.some(
            (card) => card.controller === this && EnumHelpers.isArena(card.location) && predicate(card)
        );
    }

    /**
     * Returns an Array of all unots and upgrades matching the predicate controlled by this player
     * @param {Function} predicate  - DrawCard => Boolean
     */
    filterCardsInPlay(predicate) {
        return this.game.allCards.filter(
            (card) => card.controller === this && EnumHelpers.isArena(card.location) && predicate(card)
        );
    }

    isActivePlayer() {
        return this.game.actionPhaseActivePlayer === this;
    }

    hasInitiative() {
        return this.game.initiativePlayer === this;
    }

    /**
     * Returns the total number of units and upgrades controlled by this player which match the passed predicate
     * @param {Function} predicate - DrawCard => Int
     */
    getNumberOfCardsInPlay(predicate) {
        return this.game.allCards.reduce((num, card) => {
            if (card.controller === this && EnumHelpers.isArena(card.location) && predicate(card)) {
                return num + 1;
            }

            return num;
        }, 0);
    }

    /**
     * Checks whether the passed card is in a legal location for the passed type of play
     * @param card BaseCard
     * @param {String} playingType
     */
    isCardInPlayableLocation(card, playingType = null) {
        // use an effect check to see if this card is in an out of play location but can still be played from
        if (card.getOngoingEffectValues(EffectName.CanPlayFromOutOfPlay).filter((a) => a.player(this, card)).length > 0) {
            return true;
        }

        return this.playableLocations.some(
            (location) => (!playingType || location.playingType === playingType) && location.includes(card)
        );
    }

    findPlayType(card) {
        if (card.getOngoingEffectValues(EffectName.CanPlayFromOutOfPlay).filter((a) => a.player(this, card)).length > 0) {
            let effects = card.getOngoingEffectValues(EffectName.CanPlayFromOutOfPlay).filter((a) => a.player(this, card));
            return effects[effects.length - 1].playType || PlayType.PlayFromHand;
        }

        let location = this.playableLocations.find((location) => location.includes(card));
        if (location) {
            return location.playingType;
        }

        return undefined;
    }

    /**
     * Returns a card in play under this player's control which matches (for uniqueness) the passed card
     * @param {InPlayCard} card
     * @returns {InPlayCard[]} Duplicates of passed card (does not check unique status)
     */
    getDuplicatesInPlay(card) {
        return this.getArenaCards().filter((otherCard) =>
            otherCard.title === card.title &&
            otherCard.subtitle === card.subtitle &&
            otherCard !== card
        );
    }

    /**
     * Returns ths top card of the player's deck
     * @returns {import('./card/CardTypes').PlayableCard | null} the Card,© or null if the deck is empty
     */
    getTopCardOfDeck() {
        if (this.drawDeck.length > 0) {
            return this.drawDeck[0];
        }
        return null;
    }

    /**
     * Draws the passed number of cards from the top of the conflict deck into this players hand, shuffling and deducting honor if necessary
     * @param {number} numCards
     */
    drawCardsToHand(numCards) {
        if (numCards > this.drawDeck.length) {
            // TODO: move log message into the DrawSystem
            // Game log message about empty deck damage(the damage itself is handled in DrawSystem.updateEvent()).
            this.game.addMessage('{0} attempts to draw {1} cards from their empty deck and takes {2} damage instead ',
                this.name, numCards - this.drawDeck.length, 3 * (numCards - this.drawDeck.length)
            );
        }
        for (let card of this.drawDeck.slice(0, numCards)) {
            this.moveCard(card, Location.Hand);
        }
    }

    // /**
    //  * Called when one of the players decks runs out of cards, removing 5 honor and shuffling the discard pile back into the deck
    //  * @param {String} deck - one of 'conflict' or 'dynasty'
    //  */
    // deckRanOutOfCards(deck) {
    //     let discardPile = this.getCardPile(deck + ' discard pile');
    //     let action = GameSystems.loseHonor({ amount: this.game.gameMode === GameMode.Skirmish ? 3 : 5 });
    //     if (action.canAffect(this, this.game.getFrameworkContext())) {
    //         this.game.addMessage(
    //             '{0}'s {1} deck has run out of cards, so they lose {2} honor',
    //             this,
    //             deck,
    //             this.game.gameMode === GameMode.Skirmish ? 3 : 5
    //         );
    //     } else {
    //         this.game.addMessage('{0}'s {1} deck has run out of cards', this, deck);
    //     }
    //     action.resolve(this, this.game.getFrameworkContext());
    //     this.game.queueSimpleStep(() => {
    //         discardPile.each((card) => this.moveCard(card, deck + ' deck'));
    //         if (deck === 'dynasty') {
    //             this.shuffleDynastyDeck();
    //         } else {
    //             this.shuffleConflictDeck();
    //         }
    //     });
    // }

    // /**
    //  * Moves the top card of the dynasty deck to the passed province
    //  * @param {String} location - one of 'province 1', 'province 2', 'province 3', 'province 4'
    //  */
    // replaceDynastyCard(location) {
    //     let province = this.getProvinceCardInProvince(location);

    //     if (!province || this.getCardPile(location).size() > 1) {
    //         return false;
    //     }
    //     if (this.dynastyDeck.size() === 0) {
    //         this.deckRanOutOfCards('dynasty');
    //         this.game.queueSimpleStep(() => this.replaceDynastyCard(location));
    //     } else {
    //         let refillAmount = 1;
    //         if (province) {
    //             let amount = province.mostRecentOngoingEffect(EffectName.RefillProvinceTo);
    //             if (amount) {
    //                 refillAmount = amount;
    //             }
    //         }

    //         this.refillProvince(location, refillAmount);
    //     }
    //     return true;
    // }

    // putTopDynastyCardInProvince(location, facedown = false) {
    //     if (this.dynastyDeck.size() === 0) {
    //         this.deckRanOutOfCards('dynasty');
    //         this.game.queueSimpleStep(() => this.putTopDynastyCardInProvince(location, facedown));
    //     } else {
    //         let cardFromDeck = this.dynastyDeck.first();
    //         this.moveCard(cardFromDeck, location);
    //         cardFromDeck.facedown = facedown;
    //         return true;
    //     }
    //     return true;
    // }

    /**
     * Shuffles the deck, emitting an event and displaying a message in chat
     * @param {AbilityContext} context
     */
    shuffleDeck(context = null) {
        if (this.name !== 'Dummy Player') {
            this.game.addMessage('{0} is shuffling their dynasty deck', this);
        }
        this.game.emitEvent(EventName.OnDeckShuffled, context, { player: this });
        this.drawDeck = Helpers.shuffle(this.drawDeck);
    }

    /**
     * Takes a decklist passed from the lobby, creates all the cards in it, and puts references to them in the relevant lists
     */
    prepareDecks() {
        var preparedDecklist = new Deck(this.decklistNames).prepare(this);
        if (preparedDecklist.base instanceof BaseCard) {
            this.base = preparedDecklist.base;
        }
        if (preparedDecklist.leader instanceof LeaderUnitCard) {
            this.leader = preparedDecklist.leader;
        }

        this.drawDeck = preparedDecklist.deckCards;
        this.decklist = preparedDecklist;
    }

    /**
     * Called when the Game object starts the game. Creates all cards on this players decklist, shuffles the decks and initialises player parameters for the start of the game
     */
    initialise() {
        this.opponent = this.game.getOtherPlayer(this);

        this.prepareDecks();
        // shuffling happens during game setup

        this.maxLimited = 1;
    }

    /**
     * Adds the passed Cost Adjuster to this Player
     * @param source = OngoingEffectSource source of the adjuster
     * @param {Object} properties
     * @returns {CostAdjuster}
     */
    addCostAdjuster(source, properties) {
        let adjuster = new CostAdjuster(this.game, source, properties);
        this.costAdjusters.push(adjuster);
        return adjuster;
    }

    /**
     * Unregisters and removes the passed Cost Adjusters from this Player
     * @param {CostAdjuster} adjuster
     */
    removeCostAdjuster(adjuster) {
        if (this.costAdjusters.includes(adjuster)) {
            adjuster.unregisterEvents();
            this.costAdjusters = this.costAdjusters.filter((r) => r !== adjuster);
        }
    }

    addPlayableLocation(type, player, location, cards = []) {
        Contract.assertNotNullLike(player);
        let playableLocation = new PlayableLocation(type, player, location, new Set(cards));
        this.playableLocations.push(playableLocation);
        return playableLocation;
    }

    removePlayableLocation(location) {
        this.playableLocations = this.playableLocations.filter((l) => l !== location);
    }

    /**
     * Returns the aspects for this player (derived from base and leader)
     */
    getAspects() {
        return this.leader.aspects.concat(this.base.aspects);
    }

    getPenaltyAspects(costAspects) {
        if (!costAspects) {
            return [];
        }

        let playerAspects = this.getAspects();

        let penaltyAspects = [];
        for (const aspect of costAspects) {
            let matchedIndex = playerAspects.indexOf(aspect);
            if (matchedIndex === -1) {
                penaltyAspects.push(aspect);
            } else {
                playerAspects.splice(matchedIndex, 1);
            }
        }

        return penaltyAspects;
    }

    /**
     * Checks to see what the minimum possible resource cost for an action is, accounting for aspects and available cost adjusters
     * @param {PlayType} playingType
     * @param card DrawCard
     * @param target BaseCard
     */
    getMinimumPossibleCost(playingType, context, target) {
        const card = context.source;
        const adjustedCost = this.getAdjustedCost(playingType, card, target);

        return Math.max(adjustedCost, 0);
    }

    /**
     * Checks if any Cost Adjusters on this Player apply to the passed card/target, and returns the cost to play the cost if they are used.
     * Accounts for aspect penalties and any modifiers to those specifically
     * @param {PlayType} playingType
     * @param card DrawCard
     * @param target BaseCard
     */
    getAdjustedCost(playingType, card, target) {
        // if any aspect penalties, check modifiers for them separately
        let aspectPenaltiesTotal = 0;
        let aspects;
        let cost;

        switch (playingType) {
            case PlayType.PlayFromHand:
                aspects = card.aspects;
                cost = card.cost;
                break;
            case PlayType.Smuggle:
                const smuggleInstance = card.getKeywordWithCostValues(KeywordName.Smuggle);
                aspects = smuggleInstance.aspects;
                cost = smuggleInstance.cost;
                break;
            default:
                Contract.fail(`Invalid Play Type ${playingType}`);
        }

        let penaltyAspects = this.getPenaltyAspects(aspects);
        for (const aspect of penaltyAspects) {
            aspectPenaltiesTotal += this.runAdjustersForAspectPenalties(playingType, 2, card, target, aspect);
        }

        let penalizedCost = cost + aspectPenaltiesTotal;
        return this.runAdjustersForCostType(playingType, penalizedCost, card, target);
    }

    /**
     * Runs the Adjusters for a specific cost type - either base cost or an aspect penalty - and returns the modified result
     * @param {PlayType} playingType
     * @param card DrawCard
     * @param target BaseCard
     */
    runAdjustersForCostType(playingType, baseCost, card, target) {
        var matchingAdjusters = this.costAdjusters.filter((adjuster) =>
            adjuster.canAdjust(playingType, card, target, null)
        );
        var costIncreases = matchingAdjusters
            .filter((adjuster) => adjuster.costAdjustType === CostAdjustType.Increase)
            .reduce((cost, adjuster) => cost + adjuster.getAmount(card, this), 0);
        var costDecreases = matchingAdjusters
            .filter((adjuster) => adjuster.costAdjustType === CostAdjustType.Decrease)
            .reduce((cost, adjuster) => cost + adjuster.getAmount(card, this), 0);

        baseCost += costIncreases;
        var reducedCost = baseCost - costDecreases;

        return Math.max(reducedCost, 0);
    }


    /**
     * Runs the Adjusters for a specific cost type - either base cost or an aspect penalty - and returns the modified result
     * @param {PlayType} playingType
     * @param card DrawCard
     * @param target BaseCard
     * @param penaltyAspect Aspect that is not present on the current base or leader
     */
    runAdjustersForAspectPenalties(playingType, baseCost, card, target, penaltyAspect) {
        var matchingAdjusters = this.costAdjusters.filter((adjuster) =>
            adjuster.canAdjust(playingType, card, target, penaltyAspect)
        );

        var ignoreAllAspectPenalties = matchingAdjusters
            .filter((adjuster) => adjuster.costAdjustType === CostAdjustType.IgnoreAllAspects).length > 0;

        var ignoreSpecificAspectPenalty = matchingAdjusters
            .filter((adjuster) => adjuster.costAdjustType === CostAdjustType.IgnoreSpecificAspects).length > 0;

        var cost = baseCost;
        if (ignoreAllAspectPenalties || ignoreSpecificAspectPenalty) {
            cost -= 2;
        }

        return Math.max(cost, 0);
    }

    /**
     * Mark all cost adjusters which are valid for this card/target/playingType as used, and remove them if they have no uses remaining
     * @param {String} playingType
     * @param card DrawCard
     * @param target BaseCard
     */
    markUsedAdjusters(playingType, card, target = null, aspects = null) {
        var matchingAdjusters = this.costAdjusters.filter((adjuster) => adjuster.canAdjust(playingType, card, target, null, aspects));
        matchingAdjusters.forEach((adjuster) => {
            adjuster.markUsed();
            if (adjuster.isExpired()) {
                this.removeCostAdjuster(adjuster);
            }
        });
    }

    /**
     * Called at the start of the Action Phase.  Resets some of the single round parameters
     */
    resetForActionPhase() {
        if (this.resetTimerAtEndOfRound) {
            this.noTimer = false;
        }
        this.passedActionPhase = false;
    }

    /**
     * Called at the end of the Action Phase.  Resets some of the single round parameters
     */
    cleanupFromActionPhase() {
        this.passedActionPhase = null;
    }

    // showDeck() {
    //     this.showDeck = true;
    // }

    /**
     * Gets the appropriate list for the passed location pile
     * @param {String} source
     */
    getCardPile(source) {
        switch (source) {
            case Location.Hand:
                return this.hand;
            case Location.Deck:
                return this.drawDeck;
            case Location.Discard:
                return this.discard;
            case Location.Resource:
                return this.resources;
            case Location.RemovedFromGame:
                return this.removedFromGame;
            case Location.SpaceArena:
                return this.spaceArena;
            case Location.GroundArena:
                return this.groundArena;
            case Location.Base:
                return this.baseZone;
            case Location.OutsideTheGame:
                return this.outsideTheGameCards;
            default:
                if (source) {
                    if (!this.additionalPiles[source]) {
                        Contract.fail(`Attempting to find pile '${source}', but it does not exist for ${this.name}. Use createAdditionalPile() to add new pile types.`);
                    }
                    return this.additionalPiles[source].cards;
                }
        }
    }

    createAdditionalPile(name, properties) {
        this.additionalPiles[name] = Object.assign({ cards: [] }, properties);
    }

    // /**
    //  * Called when a player drags and drops a card from one location on the client to another
    //  * @param {String} cardId - the uuid of the dropped card
    //  * @param source
    //  * @param target
    //  */
    // drop(cardId, source, target) {
    //     var sourceList = this.getCardPile(source);
    //     var card = this.findCardByUuid(sourceList, cardId);

    //     // Dragging is only legal in manual mode, when the card is currently in source, when the source and target are different and when the target is a legal location
    //     if (
    //         !this.game.manualMode ||
    //         source === target ||
    //         !this.isLegalLocationForCardTypes(card.types, target) ||
    //         card.location !== source
    //     ) {
    //         return;
    //     }

    //     // Don't allow two province cards in one province
    //     if (
    //         card.isProvince &&
    //         target !== Location.ProvinceDeck &&
    //         this.getCardPile(target).any((card) => card.isProvince)
    //     ) {
    //         return;
    //     }

    //     let display = 'a card';
    //     if (
    //         (card.isFaceup() && source !== Location.Hand) ||
    //         [
    //             Location.PlayArea,
    //             Location.DynastyDiscardPile,
    //             Location.ConflictDiscardPile,
    //             Location.RemovedFromGame
    //         ].includes(target)
    //     ) {
    //         display = card;
    //     }

    //     this.game.addMessage('{0} manually moves {1} from their {2} to their {3}', this, display, source, target);
    //     this.moveCard(card, target);
    //     this.game.resolveGameState(true);
    // }

    /**
     * Checks whether card type is consistent with location, checking for custom out-of-play locations
     * @param {CardType} cardType
     * @param {Location} location
     */
    isLegalLocationForCardType(cardType, location) {
        // if we're trying to go into an additional pile, we're probably supposed to be there
        if (this.additionalPiles[location]) {
            return true;
        }

        const legalLocationsForType = Helpers.defaultLegalLocationsForCardType(cardType);

        return legalLocationsForType && EnumHelpers.cardLocationMatches(location, legalLocationsForType);
    }

    /**
     * This is only used when an upgrade is dragged into play.  Usually,
     * upgrades are played by playCard()
     * @deprecated
     */
    promptForUpgrade(card, playingType) {
        this.game.queueStep(new UpgradePrompt(this.game, this, card, playingType));
    }

    // get skillModifier() {
    //     return this.getOngoingEffectValues(EffectName.ChangePlayerSkillModifier).reduce((total, value) => total + value, 0);
    // }

    /**
     * Called by the game when the game starts, sets the players decklist
     * @param {*} deck
     */
    selectDeck(deck) {
        this.decklistNames = deck;
        this.decklistNames.selected = true;
    }

    /**
     * Returns the number of resources available to spend
     */
    countSpendableResources() {
        return this.resources.reduce((count, card) => count += !card.exhausted, 0);
    }

    /**
     * Returns the number of exhausted resources
     */
    countExhaustedResources() {
        return this.resources.reduce((count, card) => count += card.exhausted, 0);
    }

    /**
     * Moves a card from its current location to the resource zone
     * @param card BaseCard
     * @param {boolean} exhaust Whether to exhaust the card. True by default.
     */
    resourceCard(card, exhaust = true) {
        this.moveCard(card, Location.Resource);
        card.exhausted = exhaust;
    }

    /**
     * Exhaust the specified number of resources
     */
    // TODO: Create an ExhaustResourcesSystem
    exhaustResources(count, priorityResources = []) {
        const readyPriorityResources = priorityResources.filter((resource) => !resource.exhausted);
        const regularResourcesToReady = count - this.readyResourcesInList(readyPriorityResources, count);

        if (regularResourcesToReady > 0) {
            const readyRegularResources = this.resources.filter((card) => !card.exhausted);
            this.readyResourcesInList(readyRegularResources, regularResourcesToReady);
        }
    }

    /**
     * Returns how many resources were readied
     */
    readyResourcesInList(resources, count) {
        if (count < resources.length) {
            resources.slice(0, count).forEach((resource) => resource.exhaust());
            return count;
        }

        resources.forEach((resource) => resource.exhaust());
        return resources.length;
    }

    /**
     * Ready the specified number of resources
     */
    readyResources(count) {
        let exhaustedResources = this.resources.filter((card) => card.exhausted);
        for (let i = 0; i < Math.min(count, exhaustedResources.length); i++) {
            exhaustedResources[i].exhausted = false;
        }
    }

    /**
     * Moves a card from one location to another. This involves removing in from the list it's currently in, calling BaseCard.move (which changes
     * its location property), and then adding it to the list it should now be in
     * @param card BaseCard
     * @param targetLocation
     * @param {Object} options
     */
    moveCard(card, targetLocation, options = {}) {
        this.removeCardFromPile(card);

        if (targetLocation.endsWith(' bottom')) {
            options.bottom = true;
            targetLocation = targetLocation.replace(' bottom', '');
        }

        var targetPile = this.getCardPile(targetLocation);

        Contract.assertTrue(this.isLegalLocationForCardType(card.type, targetLocation), `Tried to move card ${card.name} to ${targetLocation} but it is not a legal location`);

        Contract.assertFalse(targetPile.includes(card), `Tried to move card ${card.name} to ${targetLocation} but it is already there`);

        let currentLocation = card.location;

        if (EnumHelpers.isArena(currentLocation)) {
            if (card.owner !== this) {
                card.owner.moveCard(card, targetLocation, options);
                return;
            }

            // In normal play, all upgrades should already have been removed, but in manual play we may need to remove them.
            // This won't trigger any leaves play effects
            if (card.isUnit()) {
                for (const upgrade of card.upgrades) {
                    upgrade.owner.moveCard(upgrade, Location.Discard);
                }
            }

            card.controller = this;
        } else if (EnumHelpers.isArena(targetLocation)) {
            card.setDefaultController(this);
            card.controller = this;
            // // This should only be called when an upgrade is dragged into play
            // if (card.isUpgrade()) {
            //     this.promptForUpgrade(card);
            //     return;
            // }
        } else {
            card.controller = card.owner;
        }

        if (targetLocation === Location.Deck && !options.bottom) {
            targetPile.unshift(card);
        } else if (
            [Location.Discard, Location.RemovedFromGame].includes(targetLocation)
        ) {
            // new cards go on the top of the discard pile
            targetPile.unshift(card);
        } else if (targetPile) {
            targetPile.push(card);
        }

        card.moveTo(targetLocation);
    }

    /**
     * Removes a card from whichever list it's currently in
     * @param card DrawCard
     */
    removeCardFromPile(card) {
        // upgrades have a special exception here b/c they might be in our pile but controlled by the opponent
        if (card.controller !== this && !card.isUpgrade()) {
            card.controller.removeCardFromPile(card);
            return;
        }

        var originalLocation = card.location;
        var originalPile = this.getCardPile(originalLocation);

        if (originalPile) {
            let updatedPile = this.removeCardByUuid(originalPile, card.uuid);

            switch (originalLocation) {
                case Location.Base:
                    this.baseZone = updatedPile;
                    break;
                case Location.SpaceArena:
                    this.spaceArena = updatedPile;
                    break;
                case Location.GroundArena:
                    this.groundArena = updatedPile;
                    break;
                case Location.Hand:
                    this.hand = updatedPile;
                    break;
                case Location.Deck:
                    this.drawDeck = updatedPile;
                    break;
                case Location.Discard:
                    this.discard = updatedPile;
                    break;
                case Location.RemovedFromGame:
                    this.removedFromGame = updatedPile;
                    break;
                case Location.OutsideTheGame:
                    this.outsideTheGameCards = updatedPile;
                    break;
                case Location.Resource:
                    this.resources = updatedPile;
                    break;
                default:
                    if (this.additionalPiles[originalPile]) {
                        this.additionalPiles[originalPile].cards = updatedPile;
                    } else {
                        Contract.fail(`Attempting to remove ${card.internalName} from pile, but pile '${originalLocation}' does not exist for ${this.name}`);
                    }
            }
        }
    }

    /**
     * Special case for moving upgrades to an arena b/c upgrades can be in either player's arena.
     * Other card types (or other types of upgrade move) must use {@link Player.moveCard}.
     */
    putUpgradeInArena(upgrade, location) {
        Contract.assertTrue(upgrade.isUpgrade());
        Contract.assertTrue(EnumHelpers.isArena(location));

        const pile = this.getCardPile(location);

        Contract.assertFalse(pile.includes(upgrade), `Tried to move upgrade ${upgrade.name} to ${location} for ${this.name} but it is already there`);

        pile.push(upgrade);
    }

    /**
     * Sets the passed cards as selected
     * @param cards BaseCard[]
     */
    setSelectedCards(cards) {
        this.promptState.setSelectedCards(cards);
    }

    clearSelectedCards() {
        this.promptState.clearSelectedCards();
    }

    setSelectableCards(cards) {
        this.promptState.setSelectableCards(cards);
    }

    clearSelectableCards() {
        this.promptState.clearSelectableCards();
    }

    getSummaryForHand(list, activePlayer, hideWhenFaceup) {
        // if (this.optionSettings.sortHandByName) {
        //     return this.getSortedSummaryForCardList(list, activePlayer, hideWhenFaceup);
        // }
        return this.getSummaryForCardList(list, activePlayer, hideWhenFaceup);
    }

    getSummaryForCardList(list, activePlayer, hideWhenFaceup) {
        return list.map((card) => {
            return card.getSummary(activePlayer, hideWhenFaceup);
        });
    }

    getSortedSummaryForCardList(list, activePlayer, hideWhenFaceup) {
        let cards = list.map((card) => card);
        cards.sort((a, b) => a.printedName.localeCompare(b.printedName));

        return cards.map((card) => {
            return card.getSummary(activePlayer, hideWhenFaceup);
        });
    }

    getCardSelectionState(card) {
        return this.promptState.getCardSelectionState(card);
    }

    currentPrompt() {
        return this.promptState.getState();
    }

    setPrompt(prompt) {
        this.promptState.setPrompt(prompt);
    }

    cancelPrompt() {
        this.promptState.cancelPrompt();
    }

    /**
     * Sets a flag indicating that this player passed the dynasty phase, and can't act again
     */
    passDynasty() {
        this.passedDynasty = true;
    }

    /**
     * Sets te value of the dial in the UI, and sends a chat message revealing the players bid
     */
    setShowBid(bid) {
        this.showBid = bid;
        this.game.addMessage('{0} reveals a bid of {1}', this, bid);
    }

    isTopCardShown(activePlayer = undefined) {
        if (!activePlayer) {
            activePlayer = this;
        }

        if (activePlayer.drawDeck && activePlayer.drawDeck.size() <= 0) {
            return false;
        }

        if (activePlayer === this) {
            return (
                this.getOngoingEffectValues(EffectName.ShowTopCard).includes(RelativePlayer.Any) ||
                this.getOngoingEffectValues(EffectName.ShowTopCard).includes(RelativePlayer.Self)
            );
        }

        return (
            this.getOngoingEffectValues(EffectName.ShowTopCard).includes(RelativePlayer.Any) ||
            this.getOngoingEffectValues(EffectName.ShowTopCard).includes(RelativePlayer.Opponent)
        );
    }

    // eventsCannotBeCancelled() {
    //     return this.hasOngoingEffect(EffectName.EventsCannotBeCancelled);
    // }

    // // TODO STATE SAVE: what stats are we interested in?
    // getStats() {
    //     return {
    //         fate: this.fate,
    //         honor: this.getTotalHonor(),
    //         conflictsRemaining: this.getConflictOpportunities(),
    //         militaryRemaining: this.getRemainingConflictOpportunitiesForType(ConflictTypes.Military),
    //         politicalRemaining: this.getRemainingConflictOpportunitiesForType(ConflictTypes.Political)
    //     };
    // }

    // TODO STATE SAVE: clean this up
    // /**
    //  * This information is passed to the UI
    //  * @param {Player} activePlayer
    //  */
    getState(activePlayer) {
        let isActivePlayer = activePlayer === this;
        let promptState = isActivePlayer ? this.promptState.getState() : {};
        let { email, password, ...safeUser } = this.user;
        let state = {
            cardPiles: {
                hand: this.getSummaryForHand(this.hand, activePlayer, false),
                removedFromGame: this.getSummaryForCardList(this.removedFromGame, activePlayer),
                resources: this.getSummaryForCardList(this.resources, activePlayer),
                groundArena: this.getSummaryForCardList(this.groundArena, activePlayer),
                spaceArena: this.getSummaryForCardList(this.spaceArena, activePlayer),
                deck: this.getSummaryForCardList(this.drawDeck, activePlayer),
                discard: this.getSummaryForCardList(this.discard, activePlayer)
            },
            disconnected: this.disconnected,
            // faction: this.faction,
            hasInitiative: this.hasInitiative(),
            availableResources: this.countSpendableResources(),
            leader: this.leader.getSummary(activePlayer),
            base: this.base.getSummary(activePlayer),
            id: this.id,
            left: this.left,
            name: this.name,
            // optionSettings: this.optionSettings,
            phase: this.game.currentPhase,
            promptedActionWindows: this.promptedActionWindows,
            showBid: this.showBid,
            // stats: this.getStats(),
            // timerSettings: this.timerSettings,
            user: safeUser
        };

        // Should we consolidate card piles that use getSummaryForCardList?
        if (this.additionalPiles && Object.keys(this.additionalPiles)) {
            Object.keys(this.additionalPiles).forEach((key) => {
                if (this.additionalPiles[key].cards.size() > 0) {
                    state.cardPiles[key] = this.getSummaryForCardList(this.additionalPiles[key].cards, activePlayer);
                }
            });
        }

        // if (this.showDeck) {
        //     state.showDeck = true;
        //     state.cardPiles.deck = this.getSummaryForCardList(this.deck, activePlayer);
        // }

        // if (this.role) {
        //     state.role = this.role.getSummary(activePlayer);
        // }

        if (this.clock) {
            state.clock = this.clock.getState();
        }

        return { ...state, ...promptState };
    }
}

module.exports = Player;
