const _ = require('underscore');

const { GameObject } = require('./GameObject');
const { Deck } = require('./Deck.js');
const UpgradePrompt = require('./gamesteps/upgradeprompt.js');
const { clockFor } = require('./Clocks/ClockSelector.js');
const { CostReducer } = require('./CostReducer');
const GameActions = require('./gameActions/GameActions');
const { PlayableLocation } = require('./PlayableLocation');
const { PlayerPromptState } = require('./PlayerPromptState.js');
const { BaseLocationCard } = require('./card/baseLocationCard');
const { LeaderCard } = require('./card/leaderCard');

const {
    AbilityTypes,
    CardTypes,
    EffectNames,
    EventNames,
    Locations,
    Players,
    Aspects,
    WildcardLocations,
    cardLocationMatches,
    isArena,
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

        this.deck = _([]);
        this.hand = _([]);
        this.resources = _([]);
        this.spaceArena = _([]);
        this.groundArena = _([]);
        this.baseZone = _([]);
        this.leaderZone = _([]);
        this.discard = _([]);
        this.removedFromGame = _([]);
        this.additionalPiles = {};
        this.canTakeActionsThisPhase = null;

        this.leader = null;
        this.base = null;
        this.damageToBase = null;

        this.clock = clockFor(this, clockdetails);

        this.playableLocations = [
            new PlayableLocation(PlayTypes.PlayFromHand, this, Locations.Hand),
        ];

        this.limitedPlayed = 0;
        this.deck = {};
        this.costReducers = [];
        this.abilityMaxByIdentifier = {}; // This records max limits for abilities
        this.promptedActionWindows = user.promptedActionWindows || {
            // these flags represent phase settings
            action: true,
            regroup: true
        };
        this.timerSettings = user.settings.timerSettings || {};
        this.timerSettings.windowTimer = user.settings.windowTimer;
        this.optionSettings = user.settings.optionSettings;
        this.resetTimerAtEndOfRound = false;

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

    getCardsInPlay() {
        return _(this.spaceArena.value().concat(this.groundArena.value()));
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
        return this.getCardsInPlay().any((card) => {
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
        return this.findCard(this.getCardsInPlay(), (card) => card.uuid === uuid);
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
                isArena(card.location)
            );
        });
    }

    /**
     * Returns true if any characters or attachments controlled by this playe match the passed predicate
     * @param {Function} predicate - DrawCard => Boolean
     */
    anyCardsInPlay(predicate) {
        return this.game.allCards.any(
            (card) => card.controller === this && isArena(card.location) && predicate(card)
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
            (card) => card.controller === this && isArena(card.location) && predicate(card)
        );
    }

    isActivePlayer() {
        return this.game.actionPhaseActivePlayer === this;
    }

    hasInitiative() {
        return this.game.initiativePlayer === this;
    }

    // hasLegalConflictDeclaration(properties) {
    //     let conflictType = this.getLegalConflictTypes(properties);
    //     if (conflictType.length === 0) {
    //         return false;
    //     }
    //     let conflictRing = properties.ring || Object.values(this.game.rings);
    //     conflictRing = Array.isArray(conflictRing) ? conflictRing : [conflictRing];
    //     conflictRing = conflictRing.filter((ring) => ring.canDeclare(this));
    //     if (conflictRing.length === 0) {
    //         return false;
    //     }
    //     let cards = properties.attacker ? [properties.attacker] : this.cardsInPlay.toArray();
    //     if (!this.opponent) {
    //         return conflictType.some((type) =>
    //             conflictRing.some((ring) => cards.some((card) => card.canDeclareAsAttacker(type, ring)))
    //         );
    //     }
    //     let conflictProvince = properties.province || (this.opponent && this.opponent.getProvinces());
    //     conflictProvince = Array.isArray(conflictProvince) ? conflictProvince : [conflictProvince];
    //     return conflictType.some((type) =>
    //         conflictRing.some((ring) =>
    //             conflictProvince.some(
    //                 (province) =>
    //                     province.canDeclare(type, ring) &&
    //                     cards.some((card) => card.canDeclareAsAttacker(type, ring, province))
    //             )
    //         )
    //     );
    // }

    // getConflictOpportunities() {
    //     const setConflictDeclarationType = this.mostRecentEffect(EffectNames.SetConflictDeclarationType);
    //     const forceConflictDeclarationType = this.mostRecentEffect(EffectNames.ForceConflictDeclarationType);
    //     const provideConflictDeclarationType = this.mostRecentEffect(EffectNames.ProvideConflictDeclarationType);
    //     const maxConflicts = this.mostRecentEffect(EffectNames.SetMaxConflicts);
    //     const skirmishModeRRGLimit = this.game.gameMode === GameModes.Skirmish ? 1 : 0;
    //     if (maxConflicts) {
    //         return this.getConflictsWhenMaxIsSet(maxConflicts);
    //     }

    //     if (provideConflictDeclarationType) {
    //         return (
    //             this.getRemainingConflictOpportunitiesForType(provideConflictDeclarationType) -
    //             this.declaredConflictOpportunities[ConflictTypes.Passed] -
    //             this.declaredConflictOpportunities[ConflictTypes.Forced]
    //         );
    //     }

    //     if (forceConflictDeclarationType) {
    //         return (
    //             this.getRemainingConflictOpportunitiesForType(forceConflictDeclarationType) -
    //             this.declaredConflictOpportunities[ConflictTypes.Passed] -
    //             this.declaredConflictOpportunities[ConflictTypes.Forced]
    //         );
    //     }

    //     if (setConflictDeclarationType) {
    //         return (
    //             this.getRemainingConflictOpportunitiesForType(setConflictDeclarationType) -
    //             this.declaredConflictOpportunities[ConflictTypes.Passed] -
    //             this.declaredConflictOpportunities[ConflictTypes.Forced]
    //         );
    //     }

    //     return (
    //         this.getRemainingConflictOpportunitiesForType(ConflictTypes.Military) +
    //         this.getRemainingConflictOpportunitiesForType(ConflictTypes.Political) -
    //         this.declaredConflictOpportunities[ConflictTypes.Passed] -
    //         this.declaredConflictOpportunities[ConflictTypes.Forced] -
    //         skirmishModeRRGLimit
    //     ); //Skirmish you have 1 less conflict per the rules
    // }

    // getRemainingConflictOpportunitiesForType(type) {
    //     return Math.max(
    //         0,
    //         this.getMaxConflictOpportunitiesForPlayerByType(type) - this.declaredConflictOpportunities[type]
    //     );
    // }

    // getLegalConflictTypes(properties) {
    //     let types = properties.type || [ConflictTypes.Military, ConflictTypes.Political];
    //     types = Array.isArray(types) ? types : [types];
    //     const forcedDeclaredType =
    //         properties.forcedDeclaredType ||
    //         (this.game.currentConflict && this.game.currentConflict.forcedDeclaredType);
    //     if (forcedDeclaredType) {
    //         return [forcedDeclaredType].filter(
    //             (type) =>
    //                 types.includes(type) &&
    //                 this.getConflictOpportunities() > 0 &&
    //                 !this.getEffects(EffectNames.CannotDeclareConflictsOfType).includes(type)
    //         );
    //     }

    //     if (this.getConflictOpportunities() === 0) {
    //         return [];
    //     }

    //     return types.filter(
    //         (type) =>
    //             this.getRemainingConflictOpportunitiesForType(type) > 0 &&
    //             !this.getEffects(EffectNames.CannotDeclareConflictsOfType).includes(type)
    //     );
    // }

    // getConflictsWhenMaxIsSet(maxConflicts) {
    //     return Math.max(0, maxConflicts - this.game.getConflicts(this).length);
    // }

    // getMaxConflictOpportunitiesForPlayerByType(type) {
    //     let setConflictType = this.mostRecentEffect(EffectNames.SetConflictDeclarationType);
    //     let forceConflictType = this.mostRecentEffect(EffectNames.ForceConflictDeclarationType);
    //     const provideConflictDeclarationType = this.mostRecentEffect(EffectNames.ProvideConflictDeclarationType);
    //     const additionalConflictEffects = this.getEffects(EffectNames.AdditionalConflict);
    //     const additionalConflictsForType = additionalConflictEffects.filter((x) => x === type).length;
    //     let baselineAvailableConflicts =
    //         this.defaultAllowedConflicts[ConflictTypes.Military] +
    //         this.defaultAllowedConflicts[ConflictTypes.Political];
    //     if (provideConflictDeclarationType && setConflictType !== provideConflictDeclarationType) {
    //         setConflictType = undefined;
    //     }
    //     if (provideConflictDeclarationType && forceConflictType !== provideConflictDeclarationType) {
    //         forceConflictType = undefined;
    //     }

    //     if (this.game.gameMode === GameModes.Skirmish) {
    //         baselineAvailableConflicts = 1;
    //     }

    //     if (setConflictType && type === setConflictType) {
    //         let declaredConflictsOfOtherType = 0;
    //         if (setConflictType === ConflictTypes.Military) {
    //             declaredConflictsOfOtherType = this.declaredConflictOpportunities[ConflictTypes.Political];
    //         } else {
    //             declaredConflictsOfOtherType = this.declaredConflictOpportunities[ConflictTypes.Military];
    //         }
    //         return baselineAvailableConflicts + additionalConflictEffects.length - declaredConflictsOfOtherType;
    //     } else if (setConflictType && type !== setConflictType) {
    //         return 0;
    //     }
    //     if (forceConflictType && type === forceConflictType) {
    //         let declaredConflictsOfOtherType = 0;
    //         if (forceConflictType === ConflictTypes.Military) {
    //             declaredConflictsOfOtherType = this.declaredConflictOpportunities[ConflictTypes.Political];
    //         } else {
    //             declaredConflictsOfOtherType = this.declaredConflictOpportunities[ConflictTypes.Military];
    //         }
    //         return baselineAvailableConflicts + additionalConflictEffects.length - declaredConflictsOfOtherType;
    //     } else if (forceConflictType && type !== forceConflictType) {
    //         return 0;
    //     }
    //     if (provideConflictDeclarationType) {
    //         let declaredConflictsOfOtherType = 0;
    //         if (type === ConflictTypes.Military) {
    //             declaredConflictsOfOtherType = this.declaredConflictOpportunities[ConflictTypes.Political];
    //         } else {
    //             declaredConflictsOfOtherType = this.declaredConflictOpportunities[ConflictTypes.Military];
    //         }
    //         const availableAll =
    //             baselineAvailableConflicts +
    //             this.getEffects(EffectNames.AdditionalConflict).length -
    //             declaredConflictsOfOtherType;
    //         if (type === provideConflictDeclarationType) {
    //             return availableAll;
    //         }
    //         const maxType = this.defaultAllowedConflicts[type] + additionalConflictsForType;
    //         const declaredType = this.declaredConflictOpportunities[type];
    //         return Math.min(maxType - declaredType, availableAll);
    //     }
    //     return this.defaultAllowedConflicts[type] + additionalConflictsForType;
    // }

    /**
     * Returns the total number of characters and attachments controlled by this player which match the passed predicate
     * @param {Function} predicate - DrawCard => Int
     */
    getNumberOfCardsInPlay(predicate) {
        return this.game.allCards.reduce((num, card) => {
            if (card.controller === this && isArena(card.location) && predicate(card)) {
                return num + 1;
            }

            return num;
        }, 0);
    }

    /**
     * Checks whether the passes card is in a legal location for the passed type of play
     * @param card BaseCard
     * @param {String} playingType
     */
    isCardInPlayableLocation(card, playingType = null) {
        // use an effect check to see if this card is in an out of play location but can still be played from
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

    // /**
    //  * Returns a character in play under this player's control which matches (for uniqueness) the passed card.
    //  * @param card DrawCard
    //  */
    // getDuplicateInPlay(card) {
    //     if (!card.isUnique()) {
    //         return undefined;
    //     }

    //     return this.findCard(this.cardsInPlay, (playCard) => {
    //         return playCard !== card && (playCard.id === card.id || playCard.name === card.name);
    //     });
    // }

    /**
     * Draws the passed number of cards from the top of the conflict deck into this players hand, shuffling and deducting honor if necessary
     * @param {number} numCards
     */
    drawCardsToHand(numCards) {
        let remainingCards = 0;

        if (numCards > this.deck.size()) {
            // remainingCards = numCards - this.deck.size();
            // let cards = this.deck.toArray();
            // this.deckRanOutOfCards('conflict');
            // this.game.queueSimpleStep(() => {
            //     for (let card of cards) {
            //         this.moveCard(card, Locations.Hand);
            //     }
            // });
            // this.game.queueSimpleStep(() => this.drawCardsToHand(remainingCards));

            // TODO: fill out this implementation
            throw new Error('Deck ran out of cards');
        } else {
            for (let card of this.deck.toArray().slice(0, numCards)) {
                this.moveCard(card, Locations.Hand);
            }
        }
    }

    // /**
    //  * Called when one of the players decks runs out of cards, removing 5 honor and shuffling the discard pile back into the deck
    //  * @param {String} deck - one of 'conflict' or 'dynasty'
    //  */
    // deckRanOutOfCards(deck) {
    //     let discardPile = this.getSourceListForPile(deck + ' discard pile');
    //     let action = GameActions.loseHonor({ amount: this.game.gameMode === GameModes.Skirmish ? 3 : 5 });
    //     if (action.canAffect(this, this.game.getFrameworkContext())) {
    //         this.game.addMessage(
    //             "{0}'s {1} deck has run out of cards, so they lose {2} honor",
    //             this,
    //             deck,
    //             this.game.gameMode === GameModes.Skirmish ? 3 : 5
    //         );
    //     } else {
    //         this.game.addMessage("{0}'s {1} deck has run out of cards", this, deck);
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

    //     if (!province || this.getSourceListForPile(location).size() > 1) {
    //         return false;
    //     }
    //     if (this.dynastyDeck.size() === 0) {
    //         this.deckRanOutOfCards('dynasty');
    //         this.game.queueSimpleStep(() => this.replaceDynastyCard(location));
    //     } else {
    //         let refillAmount = 1;
    //         if (province) {
    //             let amount = province.mostRecentEffect(EffectNames.RefillProvinceTo);
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
     */
    shuffleDeck() {
        if (this.name !== 'Dummy Player') {
            this.game.addMessage('{0} is shuffling their dynasty deck', this);
        }
        this.game.emitEvent(EventNames.OnDeckShuffled, { player: this });
        this.deck = _(this.deck.shuffle());
    }

    /**
     * Takes a decklist passed from the lobby, creates all the cards in it, and puts references to them in the relevant lists
     */
    prepareDecks() {
        var deck = new Deck(this.deck);
        var preparedDeck = deck.prepare(this);
        if (preparedDeck.base instanceof BaseLocationCard) {
            this.base = preparedDeck.base;
        }
        if (preparedDeck.leader instanceof BaseLocationCard) {
            this.leader = preparedDeck.leader;
        }
        this.deck = _(preparedDeck.deckCards);
        this.preparedDeck = preparedDeck;
        this.deck.each((card) => {
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
        // shuffling happens during game setup

        this.maxLimited = 1;
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
     * Checks to see what the minimum possible resource cost for an action is, accounting for aspects and available cost reducers
     * @param {PlayTypes} playingType
     * @param card DrawCard
     * @param target BaseCard
     */
    getMinimumPossibleCost(playingType, context, target, ignoreType = false) {
        const card = context.source;
        let reducedCost = this.getReducedCost(playingType, card, target, ignoreType, context.costAspects);
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
        return Math.max(reducedCost - triggeredCostReducers, 0);
    }

    /**
     * Checks if any Cost Reducers on this Player apply to the passed card/target, and returns the cost to play the cost if they are used.
     * Accounts for aspect penalties and any modifiers to those specifically
     * @param {PlayTypes} playingType
     * @param card DrawCard
     * @param target BaseCard
     */
    getReducedCost(playingType, card, target, ignoreType = false, aspects = null) {
        // if any aspect penalties, check modifiers for them separately
        let aspectPenaltiesTotal = 0;
        let penaltyAspects = this.getPenaltyAspects(aspects);
        for (const aspect of penaltyAspects) {
            aspectPenaltiesTotal += this.runReducersForCostType(playingType, 2, card, target, ignoreType, aspect);
        }
        
        let penalizedCost = card.getCost() + aspectPenaltiesTotal;
        return this.runReducersForCostType(playingType, penalizedCost, card, target, ignoreType);
    }

    /**
     * Runs the Reducers for a specific cost type - either base cost or an aspect penalty - and returns the modified result
     * @param {PlayTypes} playingType
     * @param card DrawCard
     * @param target BaseCard
     */
    runReducersForCostType(playingType, baseCost, card, target, ignoreType = false, penaltyAspect = null) {
        var matchingReducers = this.costReducers.filter((reducer) =>
            reducer.canReduce(playingType, card, target, ignoreType, penaltyAspect)
        );
        var costIncreases = matchingReducers
            .filter((a) => a.getAmount(card, this) < 0)
            .reduce((cost, reducer) => cost - reducer.getAmount(card, this), 0);
        var costDecreases = matchingReducers
            .filter((a) => a.getAmount(card, this) > 0)
            .reduce((cost, reducer) => cost + reducer.getAmount(card, this), 0);

        baseCost += costIncreases;
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

    // getTargetingCost(abilitySource, targets) {
    //     targets = Array.isArray(targets) ? targets : [targets];
    //     targets = targets.filter(Boolean);
    //     if (targets.length === 0) {
    //         return 0;
    //     }

    //     const playerCostToTargetEffects = abilitySource.controller
    //         ? abilitySource.controller.getEffects(EffectNames.PlayerFateCostToTargetCard)
    //         : [];

    //     let targetCost = 0;
    //     for (const target of targets) {
    //         for (const cardCostToTarget of target.getEffects(EffectNames.FateCostToTarget)) {
    //             if (
    //                 // no card type restriction
    //                 (!cardCostToTarget.cardType ||
    //                     // or match type restriction
    //                     abilitySource.type === cardCostToTarget.cardType) &&
    //                 // no player restriction
    //                 (!cardCostToTarget.targetPlayer ||
    //                     // or match player restriction
    //                     abilitySource.controller ===
    //                         (cardCostToTarget.targetPlayer === Players.Self
    //                             ? target.controller
    //                             : target.controller.opponent))
    //             ) {
    //                 targetCost += cardCostToTarget.amount;
    //             }
    //         }

    //         for (const playerCostToTarget of playerCostToTargetEffects) {
    //             if (playerCostToTarget.match(target)) {
    //                 targetCost += playerCostToTarget.amount;
    //             }
    //         }
    //     }

    //     return targetCost;
    // }

    /**
     * Mark all cost reducers which are valid for this card/target/playingType as used, and remove them if they have no uses remaining
     * @param {String} playingType
     * @param card DrawCard
     * @param target BaseCard
     */
    markUsedReducers(playingType, card, target = null, aspects = null) {
        var matchingReducers = _.filter(this.costReducers, (reducer) => reducer.canReduce(playingType, card, target, null, aspects));
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
     * Called at the start of the Action Phase.  Resets a lot of the single round parameters
     */
    beginAction() {
        if (this.resetTimerAtEndOfRound) {
            this.noTimer = false;
        }

        this.getCardsInPlay().each((card) => {
            card.new = false;
        });
        this.passedActionPhase = false;
    }

    // showDeck() {
    //     this.showDeck = true;
    // }

    // TODO: clearer name for this method
    /**
     * Gets the appropriate list for the passed location pile
     * @param {String} source
     */
    getSourceListForPile(source) {
        switch (source) {
            case Locations.Hand:
                return this.hand;
            case Locations.Deck:
                return this.deck;
            case Locations.Discard:
                return this.discard;
            case Locations.Resource:
                return this.resources;
            case Locations.RemovedFromGame:
                return this.removedFromGame;
            case Locations.SpaceArena:
                return this.spaceArena;
            case Locations.GroundArena:
                return this.groundArena;
            case Locations.Base:
                return this.baseZone;
            case Locations.Leader:
                return this.leaderZone;
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

    // /**
    //  * Called when a player drags and drops a card from one location on the client to another
    //  * @param {String} cardId - the uuid of the dropped card
    //  * @param source
    //  * @param target
    //  */
    // drop(cardId, source, target) {
    //     var sourceList = this.getSourceListForPile(source);
    //     var card = this.findCardByUuid(sourceList, cardId);

    //     // Dragging is only legal in manual mode, when the card is currently in source, when the source and target are different and when the target is a legal location
    //     if (
    //         !this.game.manualMode ||
    //         source === target ||
    //         !this.isLegalLocationForCard(card, target) ||
    //         card.location !== source
    //     ) {
    //         return;
    //     }

    //     // Don't allow two province cards in one province
    //     if (
    //         card.isProvince &&
    //         target !== Locations.ProvinceDeck &&
    //         this.getSourceListForPile(target).any((card) => card.isProvince)
    //     ) {
    //         return;
    //     }

    //     let display = 'a card';
    //     if (
    //         (card.isFaceup() && source !== Locations.Hand) ||
    //         [
    //             Locations.PlayArea,
    //             Locations.DynastyDiscardPile,
    //             Locations.ConflictDiscardPile,
    //             Locations.RemovedFromGame
    //         ].includes(target)
    //     ) {
    //         display = card;
    //     }

    //     this.game.addMessage('{0} manually moves {1} from their {2} to their {3}', this, display, source, target);
    //     this.moveCard(card, target);
    //     this.game.checkGameState(true);
    // }

    /**
     * Checks whether card.type is consistent with location
     * @param card BaseCard
     * @param {Locations} location
     */
    isLegalLocationForCard(card, location) {
        if (!card) {
            return false;
        }

        //if we're trying to go into an additional pile, we're probably supposed to be there
        if (this.additionalPiles[location]) {
            return true;
        }

        const deckCardLocations = [
            Locations.Hand,
            Locations.Deck,
            Locations.Discard,
            Locations.RemovedFromGame,
            Locations.SpaceArena,
            Locations.GroundArena,
            Locations.Resource
        ];
        const legalLocations = {
            base: [Locations.Base],
            leader: [WildcardLocations.AnyArena, Locations.Leader],
            unit: [...deckCardLocations],
            event: [...deckCardLocations, Locations.BeingPlayed],
            attachment: [...deckCardLocations]
        };

        let type = card.type;
        if (location === Locations.Discard) {
            type = card.printedType || card.type; //fallback to type if printedType doesn't exist (mock cards, token cards)
        }

        return legalLocations[type] && cardLocationMatches(location, legalLocations[type]);
    }

    // /**
    //  * This is only used when an upgrade is dragged into play.  Usually,
    //  * upgrades are played by playCard()
    //  * @deprecated
    //  */
    // promptForUpgrade(card, playingType) {
    //     // TODO: Really want to move this out of here.
    //     this.game.queueStep(new AttachmentPrompt(this.game, this, card, playingType));
    // }

    // get skillModifier() {
    //     return this.getEffects(EffectNames.ChangePlayerSkillModifier).reduce((total, value) => total + value, 0);
    // }

    // hasAffinity(trait, context) {
    //     if (!this.checkRestrictions('haveAffinity', context)) {
    //         return false;
    //     }

    //     for (const cheatedAffinities of this.getEffects(EffectNames.SatisfyAffinity)) {
    //         if (cheatedAffinities.includes(trait)) {
    //             return true;
    //         }
    //     }

    //     return this.cardsInPlay.some((card) => card.type === CardTypes.Character && card.hasTrait(trait));
    // }

    /**
     * Called by the game when the game starts, sets the players decklist
     * @param {*} deck
     */
    selectDeck(deck) {
        this.deck.selected = false;
        this.deck = deck;
        this.deck.selected = true;
        if (deck.base.length > 0) {
            this.base = new BaseLocationCard(this, deck.base[0].card);
        }
        if (deck.leader.length > 0) {
            this.leader = new LeaderCard(this, deck.leader[0].card);
        }
    }

    /**
     * Returns the number of resources available to spend
     */
    countSpendableResources() {
        return this.resources.value().reduce((count, card) => count += !card.exhausted, 0)
    }

    /**
     * Returns the number of resources available to spend
     */
    countExhaustedResources() {
        return this.resources.value().reduce((count, card) => count += card.exhausted, 0)
    }

    /**
     * Moves a card from its current location to the resource zone, optionally exhausting it
     * @param card BaseCard
     * @param {boolean} exhaust
     */
    resourceCard(card, exhaust = false) {
        this.moveCard(card, Locations.Resource);
        card.exhausted = !exhaust
    }

    /**
     * Exhaust the specified number of resources
     */
    exhaustResources(count) {
        let readyResources = this.resources.filter(card => !card.exhausted);
        for (let i = 0; i < Math.min(count, readyResources.length); i++) {
            readyResources[i].exhausted = true;
        }
    }

    /**
     * Defeat the specified card
     */
    defeatCard(card) {
        if (!card) {
            return;
        }

        // TODO: event resolution is probably not working right. this will get resolved in its own separate window as part of combat,
        // but actually all combat effects should be resolved in the same window with resolution order decided per rules
        this.game.openEventWindow(GameActions.defeat().getEvent(card, this.game.getFrameworkContext()));
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

        var targetPile = this.getSourceListForPile(targetLocation);

        if (!this.isLegalLocationForCard(card, targetLocation) || (targetPile && targetPile.contains(card))) {
            return;
        }

        let currentLocation = card.location;

        if (isArena(currentLocation)) {
            if (card.owner !== this) {
                card.owner.moveCard(card, targetLocation, options);
                return;
            }

            // In normal play, all upgrades should already have been removed, but in manual play we may need to remove them.
            // This won't trigger any leaves play effects
            for (const upgrade of card.upgrades) {
                upgrade.leavesPlay(targetLocation);
                upgrade.owner.moveCard(upgrade, Locations.Discard);
            }

            card.leavesPlay(targetLocation);
            card.controller = this;
        } else if (isArena(targetLocation)) {
            card.setDefaultController(this);
            card.controller = this;
            // // This should only be called when an upgrade is dragged into play
            // if (card.type === CardTypes.Upgrade) {
            //     this.promptForUpgrade(card);
            //     return;
            // }
        } else if (currentLocation === Locations.BeingPlayed && card.owner !== this) {
            card.owner.moveCard(card, targetLocation, options);
            return;
        } else {
            card.controller = card.owner;
        }

        if (currentLocation === Locations.Resource && targetLocation !== Locations.Resource) {
            card.resourced = false;
        }

        if (targetLocation === Locations.Resource) {
            card.facedown = true;
            card.resourced = true;
            targetPile.push(card);
        } else if (targetLocation === Locations.Deck && !options.bottom) {
            targetPile.unshift(card);
        } else if (
            [Locations.Discard, Locations.RemovedFromGame].includes(targetLocation)
        ) {
            // new cards go on the top of the discard pile
            targetPile.unshift(card);
        } else if (targetPile) {
            targetPile.push(card);
        }

        if (!cardLocationMatches(targetLocation, [WildcardLocations.AnyArena, Locations.Resource, Locations.Leader])) {
            card.exhausted = null;
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
        var originalPile = this.getSourceListForPile(originalLocation);

        if (originalPile) {
            let updatedPile = this.removeCardByUuid(originalPile, card.uuid);

            switch (originalLocation) {
                case Locations.Hand:
                    this.hand = updatedPile;
                    break;
                case Locations.Deck:
                    this.deck = updatedPile;
                    break;
                case Locations.Discard:
                    this.discard = updatedPile;
                    break;
                case Locations.RemovedFromGame:
                    this.removedFromGame = updatedPile;
                    break;
                default:
                    if (this.additionalPiles[originalPile]) {
                        this.additionalPiles[originalPile].cards = updatedPile;
                    }
            }
        }
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

        if (activePlayer.deck && activePlayer.deck.size() <= 0) {
            return false;
        }

        if (activePlayer === this) {
            return (
                this.getEffects(EffectNames.ShowTopCard).includes(Players.Any) ||
                this.getEffects(EffectNames.ShowTopCard).includes(Players.Self)
            );
        }

        return (
            this.getEffects(EffectNames.ShowTopCard).includes(Players.Any) ||
            this.getEffects(EffectNames.ShowTopCard).includes(Players.Opponent)
        );
    }

    // eventsCannotBeCancelled() {
    //     return this.anyEffect(EffectNames.EventsCannotBeCancelled);
    // }

    // // TODO: what stats are we interested in?
    // getStats() {
    //     return {
    //         fate: this.fate,
    //         honor: this.getTotalHonor(),
    //         conflictsRemaining: this.getConflictOpportunities(),
    //         militaryRemaining: this.getRemainingConflictOpportunitiesForType(ConflictTypes.Military),
    //         politicalRemaining: this.getRemainingConflictOpportunitiesForType(ConflictTypes.Political)
    //     };
    // }

    // TODO: clean this up
    // /**
    //  * This information is passed to the UI
    //  * @param {Player} activePlayer
    //  */
    // getState(activePlayer) {
    //     let isActivePlayer = activePlayer === this;
    //     let promptState = isActivePlayer ? this.promptState.getState() : {};
    //     let state = {
    //         cardPiles: {
    //             cardsInPlay: this.getSummaryForCardList(this.cardsInPlay, activePlayer),
    //             conflictDiscardPile: this.getSummaryForCardList(this.conflictDiscardPile, activePlayer),
    //             dynastyDiscardPile: this.getSummaryForCardList(this.dynastyDiscardPile, activePlayer),
    //             hand: this.getSummaryForHand(this.hand, activePlayer, true),
    //             removedFromGame: this.getSummaryForCardList(this.removedFromGame, activePlayer),
    //             provinceDeck: this.getSummaryForCardList(this.provinceDeck, activePlayer, true)
    //         },
    //         cardsPlayedThisConflict: this.game.currentConflict
    //             ? this.game.currentConflict.getNumberOfCardsPlayed(this)
    //             : NaN,
    //         disconnected: this.disconnected,
    //         faction: this.faction,
    //         hasInitiative: this.hasInitiative(),
    //         hideProvinceDeck: this.hideProvinceDeck,
    //         id: this.id,
    //         imperialFavor: this.imperialFavor,
    //         left: this.left,
    //         name: this.name,
    //         numConflictCards: this.conflictDeck.size(),
    //         numDynastyCards: this.dynastyDeck.size(),
    //         numProvinceCards: this.provinceDeck.size(),
    //         optionSettings: this.optionSettings,
    //         phase: this.game.currentPhase,
    //         promptedActionWindows: this.promptedActionWindows,
    //         showBid: this.showBid,
    //         stats: this.getStats(),
    //         timerSettings: this.timerSettings,
    //         strongholdProvince: this.getSummaryForCardList(this.strongholdProvince, activePlayer),
    //         user: _.omit(this.user, ['password', 'email'])
    //     };

    //     if (this.additionalPiles && Object.keys(this.additionalPiles)) {
    //         Object.keys(this.additionalPiles).forEach((key) => {
    //             if (this.additionalPiles[key].cards.size() > 0) {
    //                 state.cardPiles[key] = this.getSummaryForCardList(this.additionalPiles[key].cards, activePlayer);
    //             }
    //         });
    //     }

    //     if (this.showDeck) {
    //         state.showDeck = true;
    //         state.cardPiles.deck = this.getSummaryForCardList(this.deck, activePlayer);
    //     }

    //     if (this.role) {
    //         state.role = this.role.getSummary(activePlayer);
    //     }

    //     if (this.stronghold) {
    //         state.stronghold = this.stronghold.getSummary(activePlayer);
    //     }

    //     if (this.isTopConflictCardShown(activePlayer) && this.conflictDeck.first()) {
    //         state.conflictDeckTopCard = this.conflictDeck.first().getSummary(activePlayer);
    //     }

    //     if (this.isTopDynastyCardShown(activePlayer) && this.dynastyDeck.first()) {
    //         state.dynastyDeckTopCard = this.dynastyDeck.first().getSummary(activePlayer);
    //     }

    //     if (this.clock) {
    //         state.clock = this.clock.getState();
    //     }

    //     return _.extend(state, promptState);
    // }
}

module.exports = Player;