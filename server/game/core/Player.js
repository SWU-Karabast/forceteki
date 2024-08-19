const { GameObject } = require('./GameObject');
const { Deck } = require('../Deck.js');
const UpgradePrompt = require('./gameSteps/prompts/UpgradePrompt.js');
const { clockFor } = require('./clocks/ClockSelector.js');
const { CostAdjuster } = require('./cost/CostAdjuster');
const GameSystems = require('../gameSystems/GameSystemLibrary');
const { PlayableLocation } = require('./PlayableLocation');
const { PlayerPromptState } = require('./PlayerPromptState.js');
const { BaseCard } = require('./card/BaseCard');
const { LeaderCard } = require('./card/LeaderCard');
const Contract = require('./utils/Contract');

const {
    AbilityType,
    CardType,
    EffectName,
    EventName,
    Location,
    RelativePlayer,
    Aspect,
    WildcardLocation,
    PlayType
} = require('./Constants');

const { cardLocationMatches, isArena } = require('./utils/EnumHelpers');
const Card = require('./card/Card');
const { shuffle, defaultLegalLocationsForCardTypes } = require('../../Util');
const AbilityHelper = require('../AbilityHelper');
const { BaseCardNew } = require('./card/BaseCardNew');
const { EventCard } = require('./card/EventCard');

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

        // TODO: per the rules, leader and base are both in the same 'base zone'
        this.baseZone = [];
        this.leaderZone = [];

        this.leader = null;
        this.base = null;
        this.damageToBase = null;

        this.clock = clockFor(this, clockDetails);

        this.playableLocations = [
            new PlayableLocation(PlayType.PlayFromHand, this, Location.Hand),
        ];

        this.limitedPlayed = 0;
        this.decklist = {};
        this.costAdjusters = [];
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

    // TODO UPGRADES: this should retrieve upgrades, but we need to confirm once they're implemented
    /**
     * Get all cards in designated play arena(s) owned by this player
     * @param { import('./Constants').Arena | null } arena Arena to select units from. If null, selects cards from both arenas.
     */
    getCardsInPlay(arena = null) {
        return this.spaceArena.concat(this.groundArena);
    }

    /**
     * Get all units in designated play arena(s) owned by this player
     * @param { import('./Constants').Arena | null } arena Arena to select units from. If null, selects cards from both arenas.
     */
    getUnitsInPlay(arena = null, cardCondition = (card) => true) {
        return this.getCardsInPlay(arena).filter((card) => card.isUnit() && cardCondition(card));
    }

    /**
     * Get all cards in designated play arena(s) other than the passed card owned by this player.
     * @param { Card } ignoreUnit Unit to filter from the returned results
     * @param { import('./Constants').Arena | null } arena Arena to select units from. If null, selects cards from both arenas.
     */
    getOtherUnitsInPlay(ignoreUnit, arena = null, cardCondition = (card) => true) {
        return this.getCardsInPlay(arena).filter((card) => card.isUnit() && card !== ignoreUnit && cardCondition(card));
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
        return this.getCardsInPlay().some((card) => {
            return card.selected;
        });
    }

    /**
     * Removes a card with the passed uuid from a list. Returns an _(Array)
     * @param list _(Array)
     * @param {String} uuid
     */
    removeCardByUuid(list, uuid) {
        return list.filter((card) => {
            return card.uuid !== uuid;
        });
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
        if (!cards || cards.length === 0) {
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
        if (!Contract.assertNotNullLike(cardList)) {
            return null;
        }

        var cardsToReturn = [];

        cardList.forEach((card) => {
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
        return this.game.allCards.some(
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
    //     const setConflictDeclarationType = this.mostRecentEffect(EffectName.SetConflictDeclarationType);
    //     const forceConflictDeclarationType = this.mostRecentEffect(EffectName.ForceConflictDeclarationType);
    //     const provideConflictDeclarationType = this.mostRecentEffect(EffectName.ProvideConflictDeclarationType);
    //     const maxConflicts = this.mostRecentEffect(EffectName.SetMaxConflicts);
    //     const skirmishModeRRGLimit = this.game.gameMode === GameMode.Skirmish ? 1 : 0;
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
    //                 !this.getEffectValues(EffectName.CannotDeclareConflictsOfType).includes(type)
    //         );
    //     }

    //     if (this.getConflictOpportunities() === 0) {
    //         return [];
    //     }

    //     return types.filter(
    //         (type) =>
    //             this.getRemainingConflictOpportunitiesForType(type) > 0 &&
    //             !this.getEffectValues(EffectName.CannotDeclareConflictsOfType).includes(type)
    //     );
    // }

    // getConflictsWhenMaxIsSet(maxConflicts) {
    //     return Math.max(0, maxConflicts - this.game.getConflicts(this).length);
    // }

    // getMaxConflictOpportunitiesForPlayerByType(type) {
    //     let setConflictType = this.mostRecentEffect(EffectName.SetConflictDeclarationType);
    //     let forceConflictType = this.mostRecentEffect(EffectName.ForceConflictDeclarationType);
    //     const provideConflictDeclarationType = this.mostRecentEffect(EffectName.ProvideConflictDeclarationType);
    //     const additionalConflictEffects = this.getEffectValues(EffectName.AdditionalConflict);
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

    //     if (this.game.gameMode === GameMode.Skirmish) {
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
    //             this.getEffectValues(EffectName.AdditionalConflict).length -
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
     * Checks whether the passed card is in a legal location for the passed type of play
     * @param card BaseCard
     * @param {String} playingType
     */
    isCardInPlayableLocation(card, playingType = null) {
        // use an effect check to see if this card is in an out of play location but can still be played from
        if (card.getEffectValues(EffectName.CanPlayFromOutOfPlay).filter((a) => a.player(this, card)).length > 0) {
            return true;
        }

        return this.playableLocations.some(
            (location) => (!playingType || location.playingType === playingType) && location.includes(card)
        );
    }

    findPlayType(card) {
        if (card.getEffectValues(EffectName.CanPlayFromOutOfPlay).filter((a) => a.player(this, card)).length > 0) {
            let effects = card.getEffectValues(EffectName.CanPlayFromOutOfPlay).filter((a) => a.player(this, card));
            return effects[effects.length - 1].playType || PlayType.PlayFromHand;
        }

        let location = this.playableLocations.find((location) => location.includes(card));
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

        if (numCards > this.drawDeck.length) {
            // remainingCards = numCards - this.deck.size();
            // let cards = this.deck.toArray();
            // this.deckRanOutOfCards('conflict');
            // this.game.queueSimpleStep(() => {
            //     for (let card of cards) {
            //         this.moveCard(card, Location.Hand);
            //     }
            // });
            // this.game.queueSimpleStep(() => this.drawCardsToHand(remainingCards));

            // TODO OVERDRAW: fill out this implementation
            throw new Error('Deck ran out of cards');
        } else {
            for (let card of this.drawDeck.slice(0, numCards)) {
                this.moveCard(card, Location.Hand);
            }
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
    //             let amount = province.mostRecentEffect(EffectName.RefillProvinceTo);
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
        this.game.emitEvent(EventName.OnDeckShuffled, { player: this });
        this.drawDeck = shuffle(this.drawDeck);
    }

    /**
     * Takes a decklist passed from the lobby, creates all the cards in it, and puts references to them in the relevant lists
     */
    prepareDecks() {
        var preparedDecklist = new Deck(this.decklist).prepare(this);
        if (preparedDecklist.base instanceof BaseCard) {
            this.base = preparedDecklist.base;
        }
        if (preparedDecklist.leader instanceof BaseCard) {
            this.leader = preparedDecklist.leader;
        }

        const baseTest = new BaseCardNew(this, preparedDecklist.deckCards[0].cardData);
        baseTest.addEpicActionAbility({
            title: 'Exhaust an enemy unit',
            targetResolver: {
                cardCondition: (card) => card.controller !== this,
                immediateEffect: AbilityHelper.immediateEffects.exhaust()
            }
        }, preparedDecklist.deckCards[0]);

        const eventTest = new EventCard(this, preparedDecklist.deckCards[0].cardData);

        this.drawDeck = preparedDecklist.deckCards;
        this.decklist = preparedDecklist;
        this.drawDeck.forEach((card) => {
            // register event reactions in case event-in-deck bluff window is enabled
            // TODO EVENTS: probably we need to do this differently since we have actual reactions on our events
            if (card.isEvent()) {
                for (let reaction of card.abilities.triggeredAbilities) {
                    reaction.registerEvents();
                }
            }
        });
        this.outsideTheGameCards = preparedDecklist.outsideTheGameCards;
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
        if (!Contract.assertNotNullLike(player)) {
            return null;
        }
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
    getMinimumPossibleCost(playingType, context, target, ignoreType = false) {
        const card = context.source;
        const adjustedCost = this.getAdjustedCost(playingType, card, target, ignoreType, context.costAspects);

        // TODO: not sure yet if we need this code, I think it's checking to see if any potential interrupts would create additional cost
        // let triggeredCostAdjusters = 0;
        // let fakeWindow = { addToWindow: () => triggeredCostAdjusters++ };
        // let fakeEvent = new GameEvent(EventName.OnCardPlayed, { card: card, player: this, context: context });
        // this.game.emit(EventName.OnCardPlayed + ':' + AbilityType.Interrupt, fakeEvent, fakeWindow);
        // let fakeResolverEvent = new GameEvent(EventName.OnAbilityResolverInitiated, {
        //     card: card,
        //     player: this,
        //     context: context
        // });
        // this.game.emit(
        //     EventName.OnAbilityResolverInitiated + ':' + AbilityType.Interrupt,
        //     fakeResolverEvent,
        //     fakeWindow
        // );
        // return Math.max(adjustedCost - triggeredCostAdjusters, 0);

        return Math.max(adjustedCost, 0);
    }

    /**
     * Checks if any Cost Adjusters on this Player apply to the passed card/target, and returns the cost to play the cost if they are used.
     * Accounts for aspect penalties and any modifiers to those specifically
     * @param {PlayType} playingType
     * @param card DrawCard
     * @param target BaseCard
     */
    getAdjustedCost(playingType, card, target, ignoreType = false, aspects = null) {
        // if any aspect penalties, check modifiers for them separately
        let aspectPenaltiesTotal = 0;
        let penaltyAspects = this.getPenaltyAspects(aspects);
        for (const aspect of penaltyAspects) {
            aspectPenaltiesTotal += this.runAdjustersForCostType(playingType, 2, card, target, ignoreType, aspect);
        }

        let penalizedCost = card.cost + aspectPenaltiesTotal;
        return this.runAdjustersForCostType(playingType, penalizedCost, card, target, ignoreType);
    }

    /**
     * Runs the Adjusters for a specific cost type - either base cost or an aspect penalty - and returns the modified result
     * @param {PlayType} playingType
     * @param card DrawCard
     * @param target BaseCard
     */
    runAdjustersForCostType(playingType, baseCost, card, target, ignoreType = false, penaltyAspect = null) {
        var matchingAdjusters = this.costAdjusters.filter((adjuster) =>
            adjuster.canAdjust(playingType, card, target, ignoreType, penaltyAspect)
        );
        var costIncreases = matchingAdjusters
            .filter((a) => a.getAmount(card, this) < 0)
            .reduce((cost, adjuster) => cost - adjuster.getAmount(card, this), 0);
        var costDecreases = matchingAdjusters
            .filter((a) => a.getAmount(card, this) > 0)
            .reduce((cost, adjuster) => cost + adjuster.getAmount(card, this), 0);

        baseCost += costIncreases;
        var reducedCost = baseCost - costDecreases;

        var costFloor = Math.min(baseCost, Math.max(...matchingAdjusters.map((a) => a.costFloor)));
        return Math.max(reducedCost, costFloor);
    }

    getTotalCostModifiers(playingType, card, target, ignoreType = false) {
        var baseCost = 0;
        var matchingAdjusters = this.costAdjusters.filter((adjuster) =>
            adjuster.canAdjust(playingType, card, target, ignoreType)
        );
        var reducedCost = matchingAdjusters.reduce((cost, adjuster) => cost - adjuster.getAmount(card, this), baseCost);
        return reducedCost;
    }

    // getTargetingCost(abilitySource, targets) {
    //     targets = Array.isArray(targets) ? targets : [targets];
    //     targets = targets.filter(Boolean);
    //     if (targets.length === 0) {
    //         return 0;
    //     }

    //     const playerCostToTargetEffects = abilitySource.controller
    //         ? abilitySource.controller.getEffectValues(EffectName.PlayerFateCostToTargetCard)
    //         : [];

    //     let targetCost = 0;
    //     for (const target of targets) {
    //         for (const cardCostToTarget of target.getEffectValues(EffectName.FateCostToTarget)) {
    //             if (
    //                 // no card type restriction
    //                 (!cardCostToTarget.cardType ||
    //                     // or match type restriction
    //                     abilitySource.hasSomeType(cardCostToTarget.cardType)) &&
    //                 // no player restriction
    //                 (!cardCostToTarget.targetPlayer ||
    //                     // or match player restriction
    //                     abilitySource.controller ===
    //                         (cardCostToTarget.targetPlayer === RelativePlayer.Self
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
     * Called at the start of the Action Phase.  Resets a lot of the single round parameters
     */
    beginAction() {
        if (this.resetTimerAtEndOfRound) {
            this.noTimer = false;
        }

        this.getCardsInPlay().forEach((card) => {
            card.new = false;
        });
        this.passedActionPhase = false;
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
            case Location.Leader:
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
     * Checks whether card type set (usually from {@link Card.types}) is consistent with location,
     * checking for custom out-of-play locations
     * @param {Set<CardType>} cardTypes
     * @param {Location} location
     */
    isLegalLocationForCardTypes(cardTypes, location) {
        //if we're trying to go into an additional pile, we're probably supposed to be there
        if (this.additionalPiles[location]) {
            return true;
        }

        const legalLocationsForType = defaultLegalLocationsForCardTypes(cardTypes);

        if (!Contract.assertNotNullLike(legalLocationsForType, `Unexpected unit type set: ${Array.from(cardTypes).join(', ')}`)) {
            return false;
        }

        return legalLocationsForType && cardLocationMatches(location, legalLocationsForType);
    }

    // TODO UPGRADES
    // /**
    //  * This is only used when an upgrade is dragged into play.  Usually,
    //  * upgrades are played by playCard()
    //  * @deprecated
    //  */
    // promptForUpgrade(card, playingType) {
    //     this.game.queueStep(new AttachmentPrompt(this.game, this, card, playingType));
    // }

    // get skillModifier() {
    //     return this.getEffectValues(EffectName.ChangePlayerSkillModifier).reduce((total, value) => total + value, 0);
    // }

    /**
     * Called by the game when the game starts, sets the players decklist
     * @param {*} deck
     */
    selectDeck(deck) {
        this.decklist.selected = false;
        this.decklist = deck;
        this.decklist.selected = true;
        if (deck.base.length > 0) {
            this.base = new BaseCard(this, deck.base[0].card);
        }
        if (deck.leader.length > 0) {
            this.leader = new LeaderCard(this, deck.leader[0].card);
        }
    }

    /**
     * Returns the number of resources available to spend
     */
    countSpendableResources() {
        return this.resources.reduce((count, card) => count += !card.exhausted, 0);
    }

    /**
     * Returns the number of resources available to spend
     */
    countExhaustedResources() {
        return this.resources.reduce((count, card) => count += card.exhausted, 0);
    }

    /**
     * Moves a card from its current location to the resource zone, optionally exhausting it
     * @param card BaseCard
     * @param {boolean} exhaust
     */
    resourceCard(card, exhaust = false) {
        this.moveCard(card, Location.Resource);
        card.exhausted = !exhaust;
    }

    /**
     * Exhaust the specified number of resources
     */
    exhaustResources(count) {
        let readyResources = this.resources.filter((card) => !card.exhausted);
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

        // TODO: does this get resolved in the right place in the attack process?
        this.game.openEventWindow(GameSystems.defeat().generateEvent(card, this.game.getFrameworkContext()));
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

        if (!this.isLegalLocationForCardTypes(card.types, targetLocation) || (targetPile && targetPile.includes(card))) {
            Contract.fail(`Tried to move card ${card.name} to ${targetLocation} but it is not a legal location`);
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
                upgrade.owner.moveCard(upgrade, Location.Discard);
            }

            card.controller = this;
        } else if (isArena(targetLocation)) {
            card.setDefaultController(this);
            card.controller = this;
            // // This should only be called when an upgrade is dragged into play
            // if (card.isUpgrade()) {
            //     this.promptForUpgrade(card);
            //     return;
            // }
        // TODO EVENT: this moves an event card to the "Being Played" zone while active. In swu, it goes directly
        // to discard then activates. We can probably remove Location.BeingPlayed entirely
        } else if (currentLocation === Location.BeingPlayed && card.owner !== this) {
            card.owner.moveCard(card, targetLocation, options);
            return;
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
        if (card.controller !== this) {
            card.controller.removeCardFromPile(card);
            return;
        }

        var originalLocation = card.location;
        var originalPile = this.getCardPile(originalLocation);

        if (originalPile) {
            let updatedPile = this.removeCardByUuid(originalPile, card.uuid);

            switch (originalLocation) {
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
                case Location.Leader:
                    this.leaderZone = updatedPile;
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

        if (activePlayer.drawDeck && activePlayer.drawDeck.size() <= 0) {
            return false;
        }

        if (activePlayer === this) {
            return (
                this.getEffectValues(EffectName.ShowTopCard).includes(RelativePlayer.Any) ||
                this.getEffectValues(EffectName.ShowTopCard).includes(RelativePlayer.Self)
            );
        }

        return (
            this.getEffectValues(EffectName.ShowTopCard).includes(RelativePlayer.Any) ||
            this.getEffectValues(EffectName.ShowTopCard).includes(RelativePlayer.Opponent)
        );
    }

    // eventsCannotBeCancelled() {
    //     return this.anyEffect(EffectName.EventsCannotBeCancelled);
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
