const _ = require('underscore');

const { GameObject } = require('./GameObject');
const { Deck } = require('./Deck.js');
const AttachmentPrompt = require('./gamesteps/attachmentprompt.js');
const { clockFor } = require('./Clocks/ClockSelector.js');
const { CostReducer } = require('./CostReducer');
const GameActions = require('./GameActions/GameActions');
const { RingEffects } = require('./RingEffects.js');
const { PlayableLocation } = require('./PlayableLocation');
const { PlayerPromptState } = require('./PlayerPromptState.js');
const { RoleCard } = require('./RoleCard');
const { StrongholdCard } = require('./StrongholdCard.js');

const {
    AbilityTypes,
    CardTypes,
    ConflictTypes,
    Decks,
    EffectNames,
    EventNames,
    FavorTypes,
    Locations,
    Players,
    PlayTypes
} = require('./Constants');
const { GameModes } = require('../GameModes');

class Player extends GameObject {
    constructor(id, user, owner, game, clockdetails) {
        super(game, user.username);
        this.user = user;
        this.emailHash = this.user.emailHash;
        this.id = id;
        this.owner = owner;
        this.printedType = 'player';
        this.socket = null;
        this.disconnected = false;
        this.left = false;
        this.lobbyId = null;

        this.dynastyDeck = _([]);
        this.conflictDeck = _([]);
        this.provinceDeck = _([]);
        this.hand = _([]);
        this.cardsInPlay = _([]); // This stores references to all characters in play.  Holdings, provinces and attachments are not stored here.
        this.strongholdProvince = _([]);
        this.provinceOne = _([]);
        this.provinceTwo = _([]);
        this.provinceThree = _([]);
        this.provinceFour = _([]);
        this.dynastyDiscardPile = _([]);
        this.conflictDiscardPile = _([]);
        this.removedFromGame = _([]);
        this.additionalPiles = {};
        this.underneathStronghold = _([]);

        this.faction = {};
        this.stronghold = null;
        this.role = null;

        //Phase Values
        this.hideProvinceDeck = false;
        this.takenDynastyMulligan = false;
        this.takenConflictMulligan = false;
        this.passedDynasty = false;
        this.actionPhasePriority = false;
        this.honorBidModifier = 0; // most recent bid modifiers
        this.showBid = 0; // amount shown on the dial
        this.declaredConflictOpportunities = {
            military: 0,
            political: 0,
            passed: 0,
            forced: 0 // conflicts that were forced into a certain type. See Ivory Kingsdoms Unicorn
        };
        this.defaultAllowedConflicts = {
            military: 1,
            political: 1
        };
        this.imperialFavor = '';

        this.clock = clockFor(this, clockdetails);

        this.limitedPlayed = 0;
        this.deck = {};
        this.costReducers = [];
        this.playableLocations = [
            new PlayableLocation(PlayTypes.PlayFromHand, this, Locations.Hand),
            new PlayableLocation(PlayTypes.PlayFromProvince, this, Locations.ProvinceOne),
            new PlayableLocation(PlayTypes.PlayFromProvince, this, Locations.ProvinceTwo),
            new PlayableLocation(PlayTypes.PlayFromProvince, this, Locations.ProvinceThree)
        ];
        if (this.game.gameMode !== GameModes.Skirmish) {
            this.playableLocations.push(new PlayableLocation(PlayTypes.PlayFromProvince, this, Locations.ProvinceFour));
            this.playableLocations.push(
                new PlayableLocation(PlayTypes.PlayFromProvince, this, Locations.StrongholdProvince)
            );
        }
        this.abilityMaxByIdentifier = {}; // This records max limits for abilities
        this.promptedActionWindows = user.promptedActionWindows || {
            // these flags represent phase settings
            dynasty: true,
            draw: true,
            preConflict: true,
            conflict: true,
            fate: true,
            regroup: true
        };
        this.timerSettings = user.settings.timerSettings || {};
        this.timerSettings.windowTimer = user.settings.windowTimer;
        this.optionSettings = user.settings.optionSettings;
        this.resetTimerAtEndOfRound = false;
        this.honorEvents = [];

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
        return this.cardsInPlay.any((card) => {
            return card.selected;
        });
    }

    /**
     * Removes a card with the passed uuid from a list. Returns an _(Array)
     * @param list _(Array)
     * @param {String} uuid
     */
    removeCardByUuid(list, uuid) {
        return _(
            list.reject((card) => {
                return card.uuid === uuid;
            })
        );
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
        return this.findCard(this.cardsInPlay, (card) => card.uuid === uuid);
    }

    /**
     * Returns a card which matches passed predicate in the passed list
     * @param cardList _(Array)
     * @param {Function} predicate - BaseCard => Boolean
     */
    findCard(cardList, predicate) {
        var cards = this.findCards(cardList, predicate);
        if (!cards || _.isEmpty(cards)) {
            return undefined;
        }

        return cards[0];
    }

    /**
     * Returns an Array of BaseCard which match (or whose attachments match) passed predicate in the passed list
     * @param cardList _(Array)
     * @param {Function} predicate - BaseCard => Boolean
     */
    findCards(cardList, predicate) {
        if (!cardList) {
            return;
        }

        var cardsToReturn = [];

        cardList.each((card) => {
            if (predicate(card)) {
                cardsToReturn.push(card);
            }

            if (card.attachments) {
                cardsToReturn = cardsToReturn.concat(card.attachments.filter(predicate));
            }

            return cardsToReturn;
        });

        return cardsToReturn;
    }

    /**
     * Returns if a card is in play (characters, attachments, provinces, holdings) that has the passed trait
     * @param {string} trait
     * @returns {boolean} true/false if the trait is in pay
     */
    isTraitInPlay(trait) {
        return this.game.allCards.some((card) => {
            return (
                card.controller === this &&
                card.hasTrait(trait) &&
                card.isFaceup() &&
                (card.location === Locations.PlayArea ||
                    (card.isProvince && !card.isBroken) ||
                    (card.isInProvince() && card.type === CardTypes.Holding))
            );
        });
    }

    areLocationsAdjacent(locationA, locationB) {
        switch (locationA) {
            case Locations.ProvinceOne:
                return locationB === Locations.ProvinceTwo;
            case Locations.ProvinceTwo:
                return locationB === Locations.ProvinceOne || locationB === Locations.ProvinceThree;
            case Locations.ProvinceThree:
                return locationB === Locations.ProvinceTwo || locationB === Locations.ProvinceFour;
            case Locations.ProvinceFour:
                return locationB === Locations.ProvinceThree;
            default:
                return false;
        }
    }

    /**
     * Returns the dynasty card from the passed province name
     * @param {String} location - one of 'province 1', 'province 2', 'province 3', 'province 4', 'stronghold province'
     */
    getDynastyCardInProvince(location) {
        let province = this.getSourceList(location);
        return province.find((card) => card.isDynasty);
    }

    /**
     * Returns the dynasty card from the passed province name
     * @param {String} location - one of 'province 1', 'province 2', 'province 3', 'province 4', 'stronghold province'
     */
    getDynastyCardsInProvince(location) {
        let province = this.getSourceList(location);
        let cards = province.filter((card) => card.isDynasty);
        if (!Array.isArray(cards)) {
            cards = [cards];
        }
        return cards;
    }

    /**
     * Returns the province card from the passed province name
     * @param {String} location - one of 'province 1', 'province 2', 'province 3', 'province 4', 'stronghold province'
     */
    getProvinceCardInProvince(location) {
        let province = this.getSourceList(location);
        return province.find((card) => card.isProvince);
    }

    getProvinceCards() {
        const gameModeProvinceCount = this.game.gameMode === GameModes.Skirmish ? 3 : 5;
        const locations = [
            Locations.ProvinceOne,
            Locations.ProvinceTwo,
            Locations.ProvinceThree,
            Locations.ProvinceFour,
            Locations.StrongholdProvince
        ].slice(0, gameModeProvinceCount);
        return locations.map((location) => this.getProvinceCardInProvince(location));
    }

    /**
     * Returns true if any characters or attachments controlled by this playe match the passed predicate
     * @param {Function} predicate - DrawCard => Boolean
     */
    anyCardsInPlay(predicate) {
        return this.game.allCards.any(
            (card) => card.controller === this && card.location === Locations.PlayArea && predicate(card)
        );
    }

    /**
     * Returns an array of all conflict cards matching the predicate owned by this player
     * @param {Function} predicate - DrawCard => Boolean
     */
    getAllConflictCards(predicate = () => true) {
        return this.game.allCards.filter((card) => card.owner === this && card.isConflict && predicate(card));
    }

    /**
     * Returns an Array of all characters and attachments matching the predicate controlled by this player
     * @param {Function} predicate  - DrawCard => Boolean
     */
    filterCardsInPlay(predicate) {
        return this.game.allCards.filter(
            (card) => card.controller === this && card.location === Locations.PlayArea && predicate(card)
        );
    }

    hasComposure() {
        return this.opponent && this.opponent.showBid > this.showBid;
    }

    hasLegalConflictDeclaration(properties) {
        let conflictType = this.getLegalConflictTypes(properties);
        if (conflictType.length === 0) {
            return false;
        }
        let conflictRing = properties.ring || Object.values(this.game.rings);
        conflictRing = Array.isArray(conflictRing) ? conflictRing : [conflictRing];
        conflictRing = conflictRing.filter((ring) => ring.canDeclare(this));
        if (conflictRing.length === 0) {
            return false;
        }
        let cards = properties.attacker ? [properties.attacker] : this.cardsInPlay.toArray();
        if (!this.opponent) {
            return conflictType.some((type) =>
                conflictRing.some((ring) => cards.some((card) => card.canDeclareAsAttacker(type, ring)))
            );
        }
        let conflictProvince = properties.province || (this.opponent && this.opponent.getProvinces());
        conflictProvince = Array.isArray(conflictProvince) ? conflictProvince : [conflictProvince];
        return conflictType.some((type) =>
            conflictRing.some((ring) =>
                conflictProvince.some(
                    (province) =>
                        province.canDeclare(type, ring) &&
                        cards.some((card) => card.canDeclareAsAttacker(type, ring, province))
                )
            )
        );
    }

    getConflictOpportunities() {
        const setConflictDeclarationType = this.mostRecentEffect(EffectNames.SetConflictDeclarationType);
        const forceConflictDeclarationType = this.mostRecentEffect(EffectNames.ForceConflictDeclarationType);
        const provideConflictDeclarationType = this.mostRecentEffect(EffectNames.ProvideConflictDeclarationType);
        const maxConflicts = this.mostRecentEffect(EffectNames.SetMaxConflicts);
        const skirmishModeRRGLimit = this.game.gameMode === GameModes.Skirmish ? 1 : 0;
        if (maxConflicts) {
            return this.getConflictsWhenMaxIsSet(maxConflicts);
        }

        if (provideConflictDeclarationType) {
            return (
                this.getRemainingConflictOpportunitiesForType(provideConflictDeclarationType) -
                this.declaredConflictOpportunities[ConflictTypes.Passed] -
                this.declaredConflictOpportunities[ConflictTypes.Forced]
            );
        }

        if (forceConflictDeclarationType) {
            return (
                this.getRemainingConflictOpportunitiesForType(forceConflictDeclarationType) -
                this.declaredConflictOpportunities[ConflictTypes.Passed] -
                this.declaredConflictOpportunities[ConflictTypes.Forced]
            );
        }

        if (setConflictDeclarationType) {
            return (
                this.getRemainingConflictOpportunitiesForType(setConflictDeclarationType) -
                this.declaredConflictOpportunities[ConflictTypes.Passed] -
                this.declaredConflictOpportunities[ConflictTypes.Forced]
            );
        }

        return (
            this.getRemainingConflictOpportunitiesForType(ConflictTypes.Military) +
            this.getRemainingConflictOpportunitiesForType(ConflictTypes.Political) -
            this.declaredConflictOpportunities[ConflictTypes.Passed] -
            this.declaredConflictOpportunities[ConflictTypes.Forced] -
            skirmishModeRRGLimit
        ); //Skirmish you have 1 less conflict per the rules
    }

    getRemainingConflictOpportunitiesForType(type) {
        return Math.max(
            0,
            this.getMaxConflictOpportunitiesForPlayerByType(type) - this.declaredConflictOpportunities[type]
        );
    }

    getLegalConflictTypes(properties) {
        let types = properties.type || [ConflictTypes.Military, ConflictTypes.Political];
        types = Array.isArray(types) ? types : [types];
        const forcedDeclaredType =
            properties.forcedDeclaredType ||
            (this.game.currentConflict && this.game.currentConflict.forcedDeclaredType);
        if (forcedDeclaredType) {
            return [forcedDeclaredType].filter(
                (type) =>
                    types.includes(type) &&
                    this.getConflictOpportunities() > 0 &&
                    !this.getEffects(EffectNames.CannotDeclareConflictsOfType).includes(type)
            );
        }

        if (this.getConflictOpportunities() === 0) {
            return [];
        }

        return types.filter(
            (type) =>
                this.getRemainingConflictOpportunitiesForType(type) > 0 &&
                !this.getEffects(EffectNames.CannotDeclareConflictsOfType).includes(type)
        );
    }

    getConflictsWhenMaxIsSet(maxConflicts) {
        return Math.max(0, maxConflicts - this.game.getConflicts(this).length);
    }

    getMaxConflictOpportunitiesForPlayerByType(type) {
        let setConflictType = this.mostRecentEffect(EffectNames.SetConflictDeclarationType);
        let forceConflictType = this.mostRecentEffect(EffectNames.ForceConflictDeclarationType);
        const provideConflictDeclarationType = this.mostRecentEffect(EffectNames.ProvideConflictDeclarationType);
        const additionalConflictEffects = this.getEffects(EffectNames.AdditionalConflict);
        const additionalConflictsForType = additionalConflictEffects.filter((x) => x === type).length;
        let baselineAvailableConflicts =
            this.defaultAllowedConflicts[ConflictTypes.Military] +
            this.defaultAllowedConflicts[ConflictTypes.Political];
        if (provideConflictDeclarationType && setConflictType !== provideConflictDeclarationType) {
            setConflictType = undefined;
        }
        if (provideConflictDeclarationType && forceConflictType !== provideConflictDeclarationType) {
            forceConflictType = undefined;
        }

        if (this.game.gameMode === GameModes.Skirmish) {
            baselineAvailableConflicts = 1;
        }

        if (setConflictType && type === setConflictType) {
            let declaredConflictsOfOtherType = 0;
            if (setConflictType === ConflictTypes.Military) {
                declaredConflictsOfOtherType = this.declaredConflictOpportunities[ConflictTypes.Political];
            } else {
                declaredConflictsOfOtherType = this.declaredConflictOpportunities[ConflictTypes.Military];
            }
            return baselineAvailableConflicts + additionalConflictEffects.length - declaredConflictsOfOtherType;
        } else if (setConflictType && type !== setConflictType) {
            return 0;
        }
        if (forceConflictType && type === forceConflictType) {
            let declaredConflictsOfOtherType = 0;
            if (forceConflictType === ConflictTypes.Military) {
                declaredConflictsOfOtherType = this.declaredConflictOpportunities[ConflictTypes.Political];
            } else {
                declaredConflictsOfOtherType = this.declaredConflictOpportunities[ConflictTypes.Military];
            }
            return baselineAvailableConflicts + additionalConflictEffects.length - declaredConflictsOfOtherType;
        } else if (forceConflictType && type !== forceConflictType) {
            return 0;
        }
        if (provideConflictDeclarationType) {
            let declaredConflictsOfOtherType = 0;
            if (type === ConflictTypes.Military) {
                declaredConflictsOfOtherType = this.declaredConflictOpportunities[ConflictTypes.Political];
            } else {
                declaredConflictsOfOtherType = this.declaredConflictOpportunities[ConflictTypes.Military];
            }
            const availableAll =
                baselineAvailableConflicts +
                this.getEffects(EffectNames.AdditionalConflict).length -
                declaredConflictsOfOtherType;
            if (type === provideConflictDeclarationType) {
                return availableAll;
            }
            const maxType = this.defaultAllowedConflicts[type] + additionalConflictsForType;
            const declaredType = this.declaredConflictOpportunities[type];
            return Math.min(maxType - declaredType, availableAll);
        }
        return this.defaultAllowedConflicts[type] + additionalConflictsForType;
    }

    /**
     * Returns the province cards (meeting an optional predicate) controlled by this player
     * @param {Function} predicate - format: (card) => return boolean, default: () => true
     * */
    getProvinces(predicate = () => true) {
        return this.game
            .getProvinceArray()
            .reduce(
                (array, location) =>
                    array.concat(
                        this.getSourceList(location).filter(
                            (card) => card.type === CardTypes.Province && predicate(card)
                        )
                    ),
                []
            );
    }

    /**
     * Returns the total number of faceup province cards controlled by this player
     * @param {Function} predicate - format: (card) => return boolean, default: () => true
     * */
    getNumberOfFaceupProvinces(predicate = () => true) {
        return this.getProvinces((card) => card.isFaceup() && predicate(card)).length;
    }

    /**
     * Returns the total number of faceup province cards controlled by this player's opponent
     * @param {Function} predicate - format: (card) => return boolean, default: () => true
     * */
    getNumberOfOpponentsFaceupProvinces(predicate = () => true) {
        return (this.opponent && this.opponent.getNumberOfFaceupProvinces(predicate)) || 0;
    }

    /**
     * Returns the total number of facedown province cards controlled by this player
     * @param {Function} predicate - format: (card) => return boolean, default: () => true
     * */
    getNumberOfFacedownProvinces(predicate = () => true) {
        return this.getProvinces((card) => card.isFacedown() && predicate(card)).length;
    }

    /**
     * Returns the total number of facedown province cards controlled by this player's opponent
     * @param {Function} predicate - format: (card) => return boolean, default: () => true
     * */
    getNumberOfOpponentsFacedownProvinces(predicate = () => true) {
        return (this.opponent && this.opponent.getNumberOfFacedownProvinces(predicate)) || 0;
    }

    /**
     * Returns the total number of characters and attachments controlled by this player which match the passed predicate
     * @param {Function} predicate - DrawCard => Int
     */
    getNumberOfCardsInPlay(predicate) {
        return this.game.allCards.reduce((num, card) => {
            if (card.controller === this && card.location === Locations.PlayArea && predicate(card)) {
                return num + 1;
            }

            return num;
        }, 0);
    }

    /**
     * Returns the total number of holdings controlled by this player
     */
    getNumberOfHoldingsInPlay() {
        return this.getHoldingsInPlay().length;
    }

    /**
     * Returns and array of holdings controlled by this player
     */
    getHoldingsInPlay() {
        return this.game
            .getProvinceArray()
            .reduce(
                (array, province) =>
                    array.concat(
                        this.getSourceList(province).filter(
                            (card) => card.getType() === CardTypes.Holding && card.isFaceup()
                        )
                    ),
                []
            );
    }

    /**
     * Checks whether the passes card is in a legal location for the passed type of play
     * @param card BaseCard
     * @param {String} playingType
     */
    isCardInPlayableLocation(card, playingType = null) {
        if (card.getEffects(EffectNames.CanPlayFromOutOfPlay).filter((a) => a.player(this, card)).length > 0) {
            return true;
        }

        return _.any(
            this.playableLocations,
            (location) => (!playingType || location.playingType === playingType) && location.contains(card)
        );
    }

    findPlayType(card) {
        if (card.getEffects(EffectNames.CanPlayFromOutOfPlay).filter((a) => a.player(this, card)).length > 0) {
            let effects = card.getEffects(EffectNames.CanPlayFromOutOfPlay).filter((a) => a.player(this, card));
            return effects[effects.length - 1].playType || PlayTypes.PlayFromHand;
        }

        let location = this.playableLocations.find((location) => location.contains(card));
        if (location) {
            return location.playingType;
        }

        return undefined;
    }

    /**
     * Returns a character in play under this player's control which matches (for uniqueness) the passed card.
     * @param card DrawCard
     */
    getDuplicateInPlay(card) {
        if (!card.isUnique()) {
            return undefined;
        }

        return this.findCard(this.cardsInPlay, (playCard) => {
            return playCard !== card && (playCard.id === card.id || playCard.name === card.name);
        });
    }

    /**
     * Draws the passed number of cards from the top of the conflict deck into this players hand, shuffling and deducting honor if necessary
     * @param {number} numCards
     */
    drawCardsToHand(numCards) {
        let remainingCards = 0;

        if (numCards > this.conflictDeck.size()) {
            remainingCards = numCards - this.conflictDeck.size();
            let cards = this.conflictDeck.toArray();
            this.deckRanOutOfCards('conflict');
            this.game.queueSimpleStep(() => {
                for (let card of cards) {
                    this.moveCard(card, Locations.Hand);
                }
            });
            this.game.queueSimpleStep(() => this.drawCardsToHand(remainingCards));
        } else {
            for (let card of this.conflictDeck.toArray().slice(0, numCards)) {
                this.moveCard(card, Locations.Hand);
            }
        }
    }

    /**
     * Called when one of the players decks runs out of cards, removing 5 honor and shuffling the discard pile back into the deck
     * @param {String} deck - one of 'conflict' or 'dynasty'
     */
    deckRanOutOfCards(deck) {
        let discardPile = this.getSourceList(deck + ' discard pile');
        let action = GameActions.loseHonor({ amount: this.game.gameMode === GameModes.Skirmish ? 3 : 5 });
        if (action.canAffect(this, this.game.getFrameworkContext())) {
            this.game.addMessage(
                "{0}'s {1} deck has run out of cards, so they lose {2} honor",
                this,
                deck,
                this.game.gameMode === GameModes.Skirmish ? 3 : 5
            );
        } else {
            this.game.addMessage("{0}'s {1} deck has run out of cards", this, deck);
        }
        action.resolve(this, this.game.getFrameworkContext());
        this.game.queueSimpleStep(() => {
            discardPile.each((card) => this.moveCard(card, deck + ' deck'));
            if (deck === 'dynasty') {
                this.shuffleDynastyDeck();
            } else {
                this.shuffleConflictDeck();
            }
        });
    }

    /**
     * Moves the top card of the dynasty deck to the passed province
     * @param {String} location - one of 'province 1', 'province 2', 'province 3', 'province 4'
     */
    replaceDynastyCard(location) {
        let province = this.getProvinceCardInProvince(location);

        if (!province || this.getSourceList(location).size() > 1) {
            return false;
        }
        if (this.dynastyDeck.size() === 0) {
            this.deckRanOutOfCards('dynasty');
            this.game.queueSimpleStep(() => this.replaceDynastyCard(location));
        } else {
            let refillAmount = 1;
            if (province) {
                let amount = province.mostRecentEffect(EffectNames.RefillProvinceTo);
                if (amount) {
                    refillAmount = amount;
                }
            }

            this.refillProvince(location, refillAmount);
        }
        return true;
    }

    putTopDynastyCardInProvince(location, facedown = false) {
        if (this.dynastyDeck.size() === 0) {
            this.deckRanOutOfCards('dynasty');
            this.game.queueSimpleStep(() => this.putTopDynastyCardInProvince(location, facedown));
        } else {
            let cardFromDeck = this.dynastyDeck.first();
            this.moveCard(cardFromDeck, location);
            cardFromDeck.facedown = facedown;
            return true;
        }
        return true;
    }

    refillProvince(location, refillAmount) {
        if (refillAmount <= 0) {
            return true;
        }

        if (this.dynastyDeck.size() === 0) {
            this.deckRanOutOfCards('dynasty');
            this.game.queueSimpleStep(() => this.refillProvince(location, refillAmount));
            return true;
        }
        let province = this.getProvinceCardInProvince(location);
        let refillFunc = province.mostRecentEffect(EffectNames.CustomProvinceRefillEffect);
        if (refillFunc) {
            refillFunc(this, province);
        } else {
            this.moveCard(this.dynastyDeck.first(), location);
        }

        this.game.queueSimpleStep(() => this.refillProvince(location, refillAmount - 1));
        return true;
    }
    /**
     * Shuffles the conflict deck, emitting an event and displaying a message in chat
     */
    shuffleConflictDeck() {
        if (this.name !== 'Dummy Player') {
            this.game.addMessage('{0} is shuffling their conflict deck', this);
        }
        this.game.emitEvent(EventNames.OnDeckShuffled, { player: this, deck: Decks.ConflictDeck });
        this.conflictDeck = _(this.conflictDeck.shuffle());
    }

    /**
     * Shuffles the dynasty deck, emitting an event and displaying a message in chat
     */
    shuffleDynastyDeck() {
        if (this.name !== 'Dummy Player') {
            this.game.addMessage('{0} is shuffling their dynasty deck', this);
        }
        this.game.emitEvent(EventNames.OnDeckShuffled, { player: this, deck: Decks.DynastyDeck });
        this.dynastyDeck = _(this.dynastyDeck.shuffle());
    }

    /**
     * Takes a decklist passed from the lobby, creates all the cards in it, and puts references to them in the relevant lists
     */
    prepareDecks() {
        var deck = new Deck(this.deck);
        var preparedDeck = deck.prepare(this);
        this.faction = preparedDeck.faction;
        this.provinceDeck = _(preparedDeck.provinceCards);
        if (preparedDeck.stronghold instanceof StrongholdCard) {
            this.stronghold = preparedDeck.stronghold;
        }
        if (preparedDeck.role instanceof RoleCard) {
            this.role = preparedDeck.role;
        }
        this.conflictDeck = _(preparedDeck.conflictCards);
        this.dynastyDeck = _(preparedDeck.dynastyCards);
        this.preparedDeck = preparedDeck;
        this.conflictDeck.each((card) => {
            // register event reactions in case event-in-deck bluff window is enabled
            if (card.type === CardTypes.Event) {
                for (let reaction of card.abilities.reactions) {
                    reaction.registerEvents();
                }
            }
        });
        this.outsideTheGameCards = preparedDeck.outsideTheGameCards;
    }

    /**
     * Called when the Game object starts the game. Creates all cards on this players decklist, shuffles the decks and initialises player parameters for the start of the game
     */
    initialise() {
        this.opponent = this.game.getOtherPlayer(this);

        this.prepareDecks();
        this.shuffleConflictDeck();
        this.shuffleDynastyDeck();

        this.fate = 0;
        this.honor = 0;
        this.readyToStart = false;
        this.maxLimited = 1;
        this.firstPlayer = false;
    }

    /**
     * Adds the passed Cost Reducer to this Player
     * @param source = EffectSource source of the reducer
     * @param {Object} properties
     * @returns {CostReducer}
     */
    addCostReducer(source, properties) {
        let reducer = new CostReducer(this.game, source, properties);
        this.costReducers.push(reducer);
        return reducer;
    }

    /**
     * Unregisters and removes the passed Cost Reducer from this Player
     * @param {CostReducer} reducer
     */
    removeCostReducer(reducer) {
        if (_.contains(this.costReducers, reducer)) {
            reducer.unregisterEvents();
            this.costReducers = _.reject(this.costReducers, (r) => r === reducer);
        }
    }

    addPlayableLocation(type, player, location, cards = []) {
        if (!player) {
            return;
        }
        let playableLocation = new PlayableLocation(type, player, location, new Set(cards));
        this.playableLocations.push(playableLocation);
        return playableLocation;
    }

    removePlayableLocation(location) {
        this.playableLocations = _.reject(this.playableLocations, (l) => l === location);
    }

    getAlternateFatePools(playingType, card, context) {
        let effects = this.getEffects(EffectNames.AlternateFatePool);
        let alternateFatePools = effects
            .filter((match) => match(card) && match(card).getFate() > 0)
            .map((match) => match(card));

        if (context && context.source && context.source.isTemptationsMaho()) {
            alternateFatePools.push(...this.cardsInPlay.filter((a) => a.type === 'character'));
        }
        if (context && context.source && context.source.isTemptationsMaho()) {
            alternateFatePools = alternateFatePools.filter(
                (a) => a.printedType !== 'ring' && a.type === CardTypes.Character
            );
        }

        let rings = alternateFatePools.filter((a) => a.printedType === 'ring');
        let cards = alternateFatePools.filter((a) => a.printedType !== 'ring');
        if (
            !this.checkRestrictions('takeFateFromRings', context) ||
            (context && context.source && context.source.isTemptationsMaho())
        ) {
            rings.forEach((ring) => {
                alternateFatePools = alternateFatePools.filter((a) => a !== ring);
            });
        }

        cards.forEach((card) => {
            if (!card.allowGameAction('removeFate') && card.type !== CardTypes.Attachment) {
                alternateFatePools = alternateFatePools.filter((a) => a !== card);
            }
        });

        return _.uniq(alternateFatePools);
    }

    getMinimumCost(playingType, context, target, ignoreType = false) {
        const card = context.source;
        let reducedCost = this.getReducedCost(playingType, card, target, ignoreType);
        let alternateFatePools = this.getAlternateFatePools(playingType, card, context);
        let alternateFate = alternateFatePools.reduce((total, pool) => total + pool.fate, 0);
        let triggeredCostReducers = 0;
        let fakeWindow = { addChoice: () => triggeredCostReducers++ };
        let fakeEvent = this.game.getEvent(EventNames.OnCardPlayed, { card: card, player: this, context: context });
        this.game.emit(EventNames.OnCardPlayed + ':' + AbilityTypes.Interrupt, fakeEvent, fakeWindow);
        let fakeResolverEvent = this.game.getEvent(EventNames.OnAbilityResolverInitiated, {
            card: card,
            player: this,
            context: context
        });
        this.game.emit(
            EventNames.OnAbilityResolverInitiated + ':' + AbilityTypes.Interrupt,
            fakeResolverEvent,
            fakeWindow
        );
        return Math.max(reducedCost - triggeredCostReducers - alternateFate, 0);
    }

    /**
     * Checks if any Cost Reducers on this Player apply to the passed card/target, and returns the cost to play the cost if they are used
     * @param {String} playingType - not sure what legal values for this are
     * @param card DrawCard
     * @param target BaseCard
     */
    getReducedCost(playingType, card, target, ignoreType = false) {
        var matchingReducers = this.costReducers.filter((reducer) =>
            reducer.canReduce(playingType, card, target, ignoreType)
        );
        var costIncreases = matchingReducers
            .filter((a) => a.getAmount(card, this) < 0)
            .reduce((cost, reducer) => cost - reducer.getAmount(card, this), 0);
        var costDecreases = matchingReducers
            .filter((a) => a.getAmount(card, this) > 0)
            .reduce((cost, reducer) => cost + reducer.getAmount(card, this), 0);

        var baseCost = card.getCost() + costIncreases;
        var reducedCost = baseCost - costDecreases;

        var costFloor = Math.min(baseCost, Math.max(...matchingReducers.map((a) => a.costFloor)));
        return Math.max(reducedCost, costFloor);
    }

    getTotalCostModifiers(playingType, card, target, ignoreType = false) {
        var baseCost = 0;
        var matchingReducers = _.filter(this.costReducers, (reducer) =>
            reducer.canReduce(playingType, card, target, ignoreType)
        );
        var reducedCost = _.reduce(matchingReducers, (cost, reducer) => cost - reducer.getAmount(card, this), baseCost);
        return reducedCost;
    }

    getAvailableAlternateFate(playingType, context) {
        const card = context.source;
        let alternateFatePools = this.getAlternateFatePools(playingType, card);
        let alternateFate = alternateFatePools.reduce((total, pool) => total + pool.fate, 0);
        return Math.max(alternateFate, 0);
    }

    getTargetingCost(abilitySource, targets) {
        targets = Array.isArray(targets) ? targets : [targets];
        targets = targets.filter(Boolean);
        if (targets.length === 0) {
            return 0;
        }

        const playerCostToTargetEffects = abilitySource.controller
            ? abilitySource.controller.getEffects(EffectNames.PlayerFateCostToTargetCard)
            : [];

        let targetCost = 0;
        for (const target of targets) {
            for (const cardCostToTarget of target.getEffects(EffectNames.FateCostToTarget)) {
                if (
                    // no card type restriction
                    (!cardCostToTarget.cardType ||
                        // or match type restriction
                        abilitySource.type === cardCostToTarget.cardType) &&
                    // no player restriction
                    (!cardCostToTarget.targetPlayer ||
                        // or match player restriction
                        abilitySource.controller ===
                            (cardCostToTarget.targetPlayer === Players.Self
                                ? target.controller
                                : target.controller.opponent))
                ) {
                    targetCost += cardCostToTarget.amount;
                }
            }

            for (const playerCostToTarget of playerCostToTargetEffects) {
                if (playerCostToTarget.match(target)) {
                    targetCost += playerCostToTarget.amount;
                }
            }
        }

        return targetCost;
    }

    /**
     * Mark all cost reducers which are valid for this card/target/playingType as used, and remove thim if they have no uses remaining
     * @param {String} playingType
     * @param card DrawCard
     * @param target BaseCard
     */
    markUsedReducers(playingType, card, target = null) {
        var matchingReducers = _.filter(this.costReducers, (reducer) => reducer.canReduce(playingType, card, target));
        _.each(matchingReducers, (reducer) => {
            reducer.markUsed();
            if (reducer.isExpired()) {
                this.removeCostReducer(reducer);
            }
        });
    }

    /**
     * Registers a card ability max limit on this Player
     * @param {String} maxIdentifier
     * @param limit FixedAbilityLimit
     */
    registerAbilityMax(maxIdentifier, limit) {
        if (this.abilityMaxByIdentifier[maxIdentifier]) {
            return;
        }

        this.abilityMaxByIdentifier[maxIdentifier] = limit;
        limit.registerEvents(this.game);
    }

    /**
     * Checks whether a max ability is at max
     * @param {String} maxIdentifier
     */
    isAbilityAtMax(maxIdentifier) {
        let limit = this.abilityMaxByIdentifier[maxIdentifier];

        if (!limit) {
            return false;
        }

        return limit.isAtMax(this);
    }

    /**
     * Marks the use of a max ability
     * @param {String} maxIdentifier
     */
    incrementAbilityMax(maxIdentifier) {
        let limit = this.abilityMaxByIdentifier[maxIdentifier];

        if (limit) {
            limit.increment(this);
        }
    }

    /**
     * Called at the start of the Dynasty Phase.  Resets a lot of the single round parameters
     */
    beginDynasty() {
        if (this.resetTimerAtEndOfRound) {
            this.noTimer = false;
        }

        this.resetConflictOpportunities();

        this.cardsInPlay.each((card) => {
            card.new = false;
        });
        this.passedDynasty = false;
    }

    collectFate() {
        this.modifyFate(this.getTotalIncome());
        this.game.raiseEvent(EventNames.OnFateCollected, { player: this });
    }

    resetConflictOpportunities() {
        this.declaredConflictOpportunities[ConflictTypes.Military] = 0;
        this.declaredConflictOpportunities[ConflictTypes.Political] = 0;
        this.declaredConflictOpportunities[ConflictTypes.Passed] = 0;
        this.declaredConflictOpportunities[ConflictTypes.Forced] = 0;
    }

    showConflictDeck() {
        this.showConflict = true;
    }

    showDynastyDeck() {
        this.showDynasty = true;
    }

    /**
     * Gets the appropriate list for the passed location
     * @param {String} source
     */
    getSourceList(source) {
        switch (source) {
            case Locations.Hand:
                return this.hand;
            case Locations.ConflictDeck:
                return this.conflictDeck;
            case Locations.DynastyDeck:
                return this.dynastyDeck;
            case Locations.ConflictDiscardPile:
                return this.conflictDiscardPile;
            case Locations.DynastyDiscardPile:
                return this.dynastyDiscardPile;
            case Locations.RemovedFromGame:
                return this.removedFromGame;
            case Locations.PlayArea:
                return this.cardsInPlay;
            case Locations.ProvinceOne:
                return this.provinceOne;
            case Locations.ProvinceTwo:
                return this.provinceTwo;
            case Locations.ProvinceThree:
                return this.provinceThree;
            case Locations.ProvinceFour:
                return this.provinceFour;
            case Locations.StrongholdProvince:
                return this.strongholdProvince;
            case Locations.ProvinceDeck:
                return this.provinceDeck;
            case Locations.Provinces:
                return _(
                    this.provinceOne
                        .value()
                        .concat(
                            this.provinceTwo.value(),
                            this.provinceThree.value(),
                            this.provinceFour.value(),
                            this.strongholdProvince.value()
                        )
                );
            case Locations.UnderneathStronghold:
                return this.underneathStronghold;
            default:
                if (source) {
                    if (!this.additionalPiles[source]) {
                        this.createAdditionalPile(source);
                    }
                    return this.additionalPiles[source].cards;
                }
        }
    }

    createAdditionalPile(name, properties) {
        this.additionalPiles[name] = _.extend({ cards: _([]) }, properties);
    }

    /**
     * Assigns the passed _(Array) to the parameter matching the passed location
     * @param {String} source
     * @param targetList _(Array)
     */
    updateSourceList(source, targetList) {
        switch (source) {
            case Locations.Hand:
                this.hand = targetList;
                break;
            case Locations.ConflictDeck:
                this.conflictDeck = targetList;
                break;
            case Locations.DynastyDeck:
                this.dynastyDeck = targetList;
                break;
            case Locations.ConflictDiscardPile:
                this.conflictDiscardPile = targetList;
                break;
            case Locations.DynastyDiscardPile:
                this.dynastyDiscardPile = targetList;
                break;
            case Locations.RemovedFromGame:
                this.removedFromGame = targetList;
                break;
            case Locations.PlayArea:
                this.cardsInPlay = targetList;
                break;
            case Locations.ProvinceOne:
                this.provinceOne = targetList;
                break;
            case Locations.ProvinceTwo:
                this.provinceTwo = targetList;
                break;
            case Locations.ProvinceThree:
                this.provinceThree = targetList;
                break;
            case Locations.ProvinceFour:
                this.provinceFour = targetList;
                break;
            case Locations.StrongholdProvince:
                this.strongholdProvince = targetList;
                break;
            case Locations.ProvinceDeck:
                this.provinceDeck = targetList;
                break;
            case Locations.UnderneathStronghold:
                this.underneathStronghold = targetList;
                break;
            default:
                if (this.additionalPiles[source]) {
                    this.additionalPiles[source].cards = targetList;
                }
        }
    }

    /**
     * Called when a player drags and drops a card from one location on the client to another
     * @param {String} cardId - the uuid of the dropped card
     * @param source
     * @param target
     */
    drop(cardId, source, target) {
        var sourceList = this.getSourceList(source);
        var card = this.findCardByUuid(sourceList, cardId);

        // Dragging is only legal in manual mode, when the card is currently in source, when the source and target are different and when the target is a legal location
        if (
            !this.game.manualMode ||
            source === target ||
            !this.isLegalLocationForCard(card, target) ||
            card.location !== source
        ) {
            return;
        }

        // Don't allow two province cards in one province
        if (
            card.isProvince &&
            target !== Locations.ProvinceDeck &&
            this.getSourceList(target).any((card) => card.isProvince)
        ) {
            return;
        }

        let display = 'a card';
        if (
            (card.isFaceup() && source !== Locations.Hand) ||
            [
                Locations.PlayArea,
                Locations.DynastyDiscardPile,
                Locations.ConflictDiscardPile,
                Locations.RemovedFromGame
            ].includes(target)
        ) {
            display = card;
        }

        this.game.addMessage('{0} manually moves {1} from their {2} to their {3}', this, display, source, target);
        this.moveCard(card, target);
        this.game.checkGameState(true);
    }

    /**
     * Checks whether card.type is consistent with location
     * @param card BaseCard
     * @param {String} location
     */
    isLegalLocationForCard(card, location) {
        if (!card) {
            return false;
        }

        //if we're trying to go into an additional pile, we're probably supposed to be there
        if (this.additionalPiles[location]) {
            return true;
        }

        const conflictCardLocations = [
            ...this.game.getProvinceArray(),
            Locations.Hand,
            Locations.ConflictDeck,
            Locations.ConflictDiscardPile,
            Locations.RemovedFromGame
        ];
        const dynastyCardLocations = [
            ...this.game.getProvinceArray(),
            Locations.DynastyDeck,
            Locations.DynastyDiscardPile,
            Locations.RemovedFromGame,
            Locations.UnderneathStronghold
        ];
        const legalLocations = {
            stronghold: [Locations.StrongholdProvince],
            role: [Locations.Role],
            province: [...this.game.getProvinceArray(), Locations.ProvinceDeck],
            holding: dynastyCardLocations,
            conflictCharacter: [...conflictCardLocations, Locations.PlayArea],
            dynastyCharacter: [...dynastyCardLocations, Locations.PlayArea],
            event: _.uniq([...conflictCardLocations, ...dynastyCardLocations, Locations.BeingPlayed]),
            attachment: [...conflictCardLocations, Locations.PlayArea]
        };

        let type = card.type;
        if (location === Locations.DynastyDiscardPile || location === Locations.ConflictDiscardPile) {
            type = card.printedType || card.type; //fallback to type if printedType doesn't exist (mock cards, token cards)
        }

        if (type === 'character') {
            type = card.isDynasty ? 'dynastyCharacter' : 'conflictCharacter';
        }

        return legalLocations[type] && legalLocations[type].includes(location);
    }

    /**
     * This is only used when an attachment is dragged into play.  Usually,
     * attachments are played by playCard()
     * @deprecated
     */
    promptForAttachment(card, playingType) {
        // TODO: Really want to move this out of here.
        this.game.queueStep(new AttachmentPrompt(this.game, this, card, playingType));
    }

    /**
     * Returns true if there is a conflict underway and this player is attacking
     */
    isAttackingPlayer() {
        return this.game.currentConflict && this.game.currentConflict.attackingPlayer === this;
    }

    /**
     * Returns true if there is a conflict underway and this player is defending
     */
    isDefendingPlayer() {
        return this.game.currentConflict && this.game.currentConflict.defendingPlayer === this;
    }

    resetForConflict() {
        this.cardsInPlay.each((card) => {
            card.resetForConflict();
        });
    }

    get honorBid() {
        return Math.max(0, this.showBid + this.honorBidModifier);
    }

    get gloryModifier() {
        return this.getEffects(EffectNames.ChangePlayerGloryModifier).reduce((total, value) => total + value, 0);
    }

    get skillModifier() {
        return this.getEffects(EffectNames.ChangePlayerSkillModifier).reduce((total, value) => total + value, 0);
    }

    honorGained(round = null, phase = null, onlyPositive = false) {
        return this.honorEvents
            .filter((event) => !round || event.round === round)
            .filter((event) => !phase || event.phase === phase)
            .filter((event) => !onlyPositive || event.amount > 0)
            .reduce((total, event) => total + event.amount, 0);
    }

    modifyFate(amount) {
        this.fate = Math.max(0, this.fate + amount);
    }

    modifyHonor(amount) {
        this.honor = Math.max(0, this.honor + amount);
        this.honorEvents.push({
            amount,
            phase: this.game.currentPhase,
            round: this.game.roundNumber
        });
    }

    resetHonorEvents(round, phase) {
        // in case a phase is restarded during the same round, reset honor tracking of that phase.
        this.honorEvents = this.honorEvents.filter((event) => event.round !== round && event.phase !== phase);
    }

    isMoreHonorable() {
        if (this.anyEffect(EffectNames.ConsideredLessHonorable)) {
            return false;
        }
        if (this.opponent && this.opponent.anyEffect(EffectNames.ConsideredLessHonorable)) {
            return true;
        }
        return this.opponent && this.honor > this.opponent.honor;
    }

    isLessHonorable() {
        if (this.anyEffect(EffectNames.ConsideredLessHonorable)) {
            return true;
        }
        if (this.opponent && this.opponent.anyEffect(EffectNames.ConsideredLessHonorable)) {
            return false;
        }
        return this.opponent && this.honor < this.opponent.honor;
    }

    hasAffinity(trait, context) {
        if (!this.checkRestrictions('haveAffinity', context)) {
            return false;
        }

        for (const cheatedAffinities of this.getEffects(EffectNames.SatisfyAffinity)) {
            if (cheatedAffinities.includes(trait)) {
                return true;
            }
        }

        return this.cardsInPlay.some((card) => card.type === CardTypes.Character && card.hasTrait(trait));
    }

    /**
     * Returns an Array of Rings of all rings claimed by this player
     */
    getClaimedRings() {
        return _.filter(this.game.rings, (ring) => ring.isConsideredClaimed(this));
    }

    getGloryCount() {
        return this.cardsInPlay.reduce(
            (total, card) => total + card.getContributionToImperialFavor(),
            this.getClaimedRings().length + this.gloryModifier
        );
    }

    /**
     * Marks that this player controls the favor for the relevant conflict type
     */
    claimImperialFavor(favorType) {
        if (this.opponent) {
            this.opponent.loseImperialFavor();
        }
        if (this.game.gameMode === GameModes.Skirmish) {
            this.imperialFavor = 'both';
            this.game.addMessage("{0} claims the Emperor's favor!", this);
            return;
        }
        if (favorType && favorType !== FavorTypes.Both) {
            this.imperialFavor = favorType;
            this.game.addMessage("{0} claims the Emperor's {1} favor!", this, favorType);
            return;
        }

        let handlers = _.map(['military', 'political'], (type) => {
            return () => {
                this.imperialFavor = type;
                this.game.addMessage("{0} claims the Emperor's {1} favor!", this, type);
            };
        });
        this.game.promptWithHandlerMenu(this, {
            activePromptTitle: 'Which side of the Imperial Favor would you like to claim?',
            source: 'Imperial Favor',
            choices: ['Military', 'Political'],
            handlers: handlers
        });
    }

    /**
     * Marks that this player no longer controls the imperial favor
     */
    loseImperialFavor() {
        this.imperialFavor = '';
    }

    /**
     * Called by the game when the game starts, sets the players decklist
     * @param {*} deck
     */
    selectDeck(deck) {
        this.deck.selected = false;
        this.deck = deck;
        this.deck.selected = true;
        if (deck.stronghold.length > 0) {
            this.stronghold = new StrongholdCard(this, deck.stronghold[0]);
        }
        this.faction = deck.faction;
    }

    /**
     * Moves a card from one location to another. This involves removing in from the list it's currently in, calling DrawCard.move (which changes
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

        var targetPile = this.getSourceList(targetLocation);

        if (!this.isLegalLocationForCard(card, targetLocation) || (targetPile && targetPile.contains(card))) {
            return;
        }

        let location = card.location;

        if (
            location === Locations.PlayArea ||
            (card.type === CardTypes.Holding &&
                card.isInProvince() &&
                !this.game.getProvinceArray().includes(targetLocation))
        ) {
            if (card.owner !== this) {
                card.owner.moveCard(card, targetLocation, options);
                return;
            }

            // In normal play, all attachments should already have been removed, but in manual play we may need to remove them.
            // This is also used by Back-Alley Hideaway when it is sacrificed. This won't trigger any leaves play effects
            for (const attachment of card.attachments) {
                attachment.leavesPlay(targetLocation);
                attachment.owner.moveCard(
                    attachment,
                    attachment.isDynasty ? Locations.DynastyDiscardPile : Locations.ConflictDiscardPile
                );
            }

            card.leavesPlay(targetLocation);
            card.controller = this;
        } else if (targetLocation === Locations.PlayArea) {
            card.setDefaultController(this);
            card.controller = this;
            // This should only be called when an attachment is dragged into play
            if (card.type === CardTypes.Attachment) {
                this.promptForAttachment(card);
                return;
            }
        } else if (location === Locations.BeingPlayed && card.owner !== this) {
            card.owner.moveCard(card, targetLocation, options);
            return;
        } else if (card.type === CardTypes.Holding && this.game.getProvinceArray().includes(targetLocation)) {
            card.controller = this;
        } else {
            card.controller = card.owner;
        }

        if (this.game.getProvinceArray().includes(targetLocation)) {
            if ([Locations.DynastyDeck].includes(location)) {
                card.facedown = true;
            }
            if (!this.takenDynastyMulligan && card.isDynasty) {
                card.facedown = false;
            }
            targetPile.push(card);
        } else if ([Locations.ConflictDeck, Locations.DynastyDeck].includes(targetLocation) && !options.bottom) {
            targetPile.unshift(card);
        } else if (
            [Locations.ConflictDiscardPile, Locations.DynastyDiscardPile, Locations.RemovedFromGame].includes(
                targetLocation
            )
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
        if (card.controller !== this) {
            card.controller.removeCardFromPile(card);
            return;
        }

        var originalLocation = card.location;
        var originalPile = this.getSourceList(originalLocation);

        if (originalPile) {
            originalPile = this.removeCardByUuid(originalPile, card.uuid);
            this.updateSourceList(originalLocation, originalPile);
        }
    }

    /**
     * Returns the amount of fate this player gets from their stronghold a turn
     */
    getTotalIncome() {
        return this.game.gameMode === GameModes.Skirmish ? 6 : this.stronghold.cardData.fate;
    }

    /**
     * Returns the amount of honor this player has
     */
    getTotalHonor() {
        return this.honor;
    }

    getFate() {
        return this.fate;
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

    setSelectableRings(rings) {
        this.promptState.setSelectableRings(rings);
    }

    clearSelectableRings() {
        this.promptState.clearSelectableRings();
    }

    getSummaryForHand(list, activePlayer, hideWhenFaceup) {
        if (this.optionSettings.sortHandByName) {
            return this.getSortedSummaryForCardList(list, activePlayer, hideWhenFaceup);
        }
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

    getRingSelectionState(ring) {
        return this.promptState.getRingSelectionState(ring);
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

    isTopConflictCardShown(activePlayer = undefined) {
        if (!activePlayer) {
            activePlayer = this;
        }

        if (activePlayer.conflictDeck && activePlayer.conflictDeck.size() <= 0) {
            return false;
        }

        if (activePlayer === this) {
            return (
                this.getEffects(EffectNames.ShowTopConflictCard).includes(Players.Any) ||
                this.getEffects(EffectNames.ShowTopConflictCard).includes(Players.Self)
            );
        }

        return (
            this.getEffects(EffectNames.ShowTopConflictCard).includes(Players.Any) ||
            this.getEffects(EffectNames.ShowTopConflictCard).includes(Players.Opponent)
        );
    }

    eventsCannotBeCancelled() {
        return this.anyEffect(EffectNames.EventsCannotBeCancelled);
    }

    // eslint-disable-next-line no-unused-vars
    isTopDynastyCardShown(activePlayer = undefined) {
        if (this.dynastyDeck.size() <= 0) {
            return false;
        }
        return this.anyEffect(EffectNames.ShowTopDynastyCard);
    }

    /**
     * Resolves any number of ring effects.  If there are more than one, then it will prompt the first player to choose what order those effects should be applied in
     * @param {Array} elements - Array of String, alternatively can be passed a String for convenience
     * @param {Boolean} optional - Indicates that the player can choose which effects to resolve.  This parameter only effects resolution of a single effect
     */
    resolveRingEffects(elements, optional = true) {
        if (!Array.isArray(elements)) {
            elements = [elements];
        }
        optional = optional && elements.length === 1;
        let effects = elements.map((element) => RingEffects.contextFor(this, element, optional));
        effects = _.sortBy(effects, (context) =>
            this.firstPlayer ? context.ability.defaultPriority : -context.ability.defaultPriority
        );
        this.game.openSimultaneousEffectWindow(
            effects.map((context) => ({
                // @ts-ignore
                title: context.ability.title,
                handler: () => this.game.resolveAbility(context)
            }))
        );
    }

    isKihoPlayedThisConflict(context, cardBeingPlayed) {
        return (
            context.game.currentConflict.getNumberOfCardsPlayed(
                this,
                (card) => card.hasTrait('kiho') && card.uuid !== cardBeingPlayed.uuid
            ) > 0
        );
    }

    getStats() {
        return {
            fate: this.fate,
            honor: this.getTotalHonor(),
            conflictsRemaining: this.getConflictOpportunities(),
            militaryRemaining: this.getRemainingConflictOpportunitiesForType(ConflictTypes.Military),
            politicalRemaining: this.getRemainingConflictOpportunitiesForType(ConflictTypes.Political)
        };
    }

    /**
     * This information is passed to the UI
     * @param {Player} activePlayer
     */
    getState(activePlayer) {
        let isActivePlayer = activePlayer === this;
        let promptState = isActivePlayer ? this.promptState.getState() : {};
        let state = {
            cardPiles: {
                cardsInPlay: this.getSummaryForCardList(this.cardsInPlay, activePlayer),
                conflictDiscardPile: this.getSummaryForCardList(this.conflictDiscardPile, activePlayer),
                dynastyDiscardPile: this.getSummaryForCardList(this.dynastyDiscardPile, activePlayer),
                hand: this.getSummaryForHand(this.hand, activePlayer, true),
                removedFromGame: this.getSummaryForCardList(this.removedFromGame, activePlayer),
                provinceDeck: this.getSummaryForCardList(this.provinceDeck, activePlayer, true)
            },
            cardsPlayedThisConflict: this.game.currentConflict
                ? this.game.currentConflict.getNumberOfCardsPlayed(this)
                : NaN,
            disconnected: this.disconnected,
            faction: this.faction,
            firstPlayer: this.firstPlayer,
            hideProvinceDeck: this.hideProvinceDeck,
            id: this.id,
            imperialFavor: this.imperialFavor,
            left: this.left,
            name: this.name,
            numConflictCards: this.conflictDeck.size(),
            numDynastyCards: this.dynastyDeck.size(),
            numProvinceCards: this.provinceDeck.size(),
            optionSettings: this.optionSettings,
            phase: this.game.currentPhase,
            promptedActionWindows: this.promptedActionWindows,
            provinces: {
                one: this.getSummaryForCardList(this.provinceOne, activePlayer, !this.readyToStart),
                two: this.getSummaryForCardList(this.provinceTwo, activePlayer, !this.readyToStart),
                three: this.getSummaryForCardList(this.provinceThree, activePlayer, !this.readyToStart),
                four: this.getSummaryForCardList(this.provinceFour, activePlayer, !this.readyToStart)
            },
            showBid: this.showBid,
            stats: this.getStats(),
            timerSettings: this.timerSettings,
            strongholdProvince: this.getSummaryForCardList(this.strongholdProvince, activePlayer),
            user: _.omit(this.user, ['password', 'email'])
        };

        if (this.additionalPiles && Object.keys(this.additionalPiles)) {
            Object.keys(this.additionalPiles).forEach((key) => {
                if (this.additionalPiles[key].cards.size() > 0) {
                    state.cardPiles[key] = this.getSummaryForCardList(this.additionalPiles[key].cards, activePlayer);
                }
            });
        }

        if (this.showConflict) {
            state.showConflictDeck = true;
            state.cardPiles.conflictDeck = this.getSummaryForCardList(this.conflictDeck, activePlayer);
        }

        if (this.showDynasty) {
            state.showDynastyDeck = true;
            state.cardPiles.dynastyDeck = this.getSummaryForCardList(this.dynastyDeck, activePlayer);
        }

        if (this.role) {
            state.role = this.role.getSummary(activePlayer);
        }

        if (this.stronghold) {
            state.stronghold = this.stronghold.getSummary(activePlayer);
        }

        if (this.isTopConflictCardShown(activePlayer) && this.conflictDeck.first()) {
            state.conflictDeckTopCard = this.conflictDeck.first().getSummary(activePlayer);
        }

        if (this.isTopDynastyCardShown(activePlayer) && this.dynastyDeck.first()) {
            state.dynastyDeckTopCard = this.dynastyDeck.first().getSummary(activePlayer);
        }

        if (this.clock) {
            state.clock = this.clock.getState();
        }

        return _.extend(state, promptState);
    }
}

module.exports = Player;