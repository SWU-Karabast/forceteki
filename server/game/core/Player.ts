import type { IGameObjectState } from './GameObject';
import { GameObject } from './GameObject';
import type { Deck } from '../../utils/deck/Deck.js';
import type { IDeckListForLoading } from '../../utils/deck/DeckInterfaces';
import type { CostAdjuster } from './cost/CostAdjuster';
import { PlayableZone } from './PlayableZone';
import { PlayerPromptState } from './PlayerPromptState.js';
import * as Contract from './utils/Contract';
import type { Aspect, CardType, KeywordName, MoveZoneDestination, Trait } from './Constants';
import {
    ChatObjectType,
    EffectName,
    GameEndReason,
    PhaseName,
    PlayType,
    RelativePlayer,
    TokenCardName,
    WildcardCardType,
    WildcardRelativePlayer,
    ZoneName
} from './Constants';

import * as EnumHelpers from './utils/EnumHelpers';
import * as Helpers from './utils/Helpers';
import type { AbilityContext } from './ability/AbilityContext';
import { HandZone } from './zone/HandZone';
import { DeckZone } from './zone/DeckZone';
import { ResourceZone } from './zone/ResourceZone';
import { DiscardZone } from './zone/DiscardZone';
import { OutsideTheGameZone } from './zone/OutsideTheGameZone';
import { BaseZone } from './zone/BaseZone';
import type Game from './Game';
import type { ZoneAbstract } from './zone/ZoneAbstract';
import type { Card } from './card/Card';
import type { IUser } from '../../Settings';
import type {
    IAllArenasForPlayerCardFilterProperties,
    IAllArenasForPlayerSpecificTypeCardFilterProperties
} from './zone/AllArenasZone';
import type { IInPlayCard } from './card/baseClasses/InPlayCard';
import type { ICardWithExhaustProperty, IPlayableCard } from './card/baseClasses/PlayableOrDeployableCard';
import type { IPlayerSerializedState, Zone } from '../Interfaces';
import type { GameObjectRef } from './GameObjectBase';
import type { ILeaderCard } from './card/propertyMixins/LeaderProperties';
import type { IBaseCard } from './card/BaseCard';
import { logger } from '../../logger';
import { ByoyomiTimer } from './actionTimer/ByoyomiTimer';
import { NoopActionTimer } from './actionTimer/NoopActionTimer';
import type { IByoyomiTimer } from './actionTimer/IByoyomiTimer';
import type { IGameStatisticsTrackable } from '../../gameStatistics/GameStatisticsTracker';
import { QuickUndoAvailableState } from './snapshot/SnapshotInterfaces';
import type { User } from '../../utils/user/User';
import { DefeatCreditTokensCostAdjuster } from './cost/DefeatCreditTokensCostAdjuster';

export interface IPlayerState extends IGameObjectState {
    handZone: GameObjectRef<HandZone>;
    resourceZone: GameObjectRef<ResourceZone>;
    discardZone: GameObjectRef<DiscardZone>;
    outsideTheGameZone: GameObjectRef<OutsideTheGameZone>;
    baseZone: GameObjectRef<BaseZone> | null;
    deckZone: GameObjectRef<DeckZone>;
    leader: GameObjectRef<ILeaderCard>;
    base: GameObjectRef<IBaseCard>;
    passedActionPhase: boolean;
    // IDeckList is made up of arrays and GameObjectRefs, so it's serializable.
    decklist: IDeckListForLoading;
    costAdjusters: GameObjectRef<CostAdjuster>[];
}

export class Player extends GameObject<IPlayerState> implements IGameStatisticsTrackable {
    public user: IUser;
    private _lobbyUser?: User;
    public printedType: string;
    // TODO: INCOMPLETE
    public socket: any;
    public disconnected: boolean;
    public left: boolean;

    private canTakeActionsThisPhase: null;
    // STATE TODO: Does Deck need to be a GameObject?
    private decklistNames: Deck | null;
    public readonly actionTimer: IByoyomiTimer;

    public promptedActionWindows: { setup?: boolean; action: boolean; regroup: boolean };
    public hasResolvedAbilityThisTimepoint = false;

    public optionSettings: Partial<{ autoSingleTarget: boolean }>;
    private _promptState: PlayerPromptState;
    public opponent: Player;
    private playableZones: PlayableZone[];
    private _lastActionId = 0;

    public activeForPreviousPrompt = false;
    private _rejectedOpponentUndoRequests = 0;
    private _undoRequestsBlocked = false;

    // eslint-disable-next-line @typescript-eslint/class-literal-property-style
    public override get alwaysTrackState(): boolean {
        return true;
    }

    // TODO: Convert all Zones to Refs and let the GameStateManager keep them there alone?
    public get handZone(): HandZone {
        return this.game.gameObjectManager.get(this.state.handZone);
    }

    public get resourceZone(): ResourceZone {
        return this.game.gameObjectManager.get(this.state.resourceZone);
    }

    public get discardZone(): DiscardZone {
        return this.game.gameObjectManager.get(this.state.discardZone);
    }

    public get outsideTheGameZone(): OutsideTheGameZone {
        return this.game.gameObjectManager.get(this.state.outsideTheGameZone);
    }

    public get baseZone(): BaseZone | null {
        return this.game.gameObjectManager.get(this.state.baseZone);
    }

    public get deckZone(): DeckZone {
        return this.game.gameObjectManager.get(this.state.deckZone);
    }

    public get leader(): ILeaderCard {
        return this.game.gameObjectManager.get(this.state.leader);
    }

    public get base(): IBaseCard {
        return this.game.gameObjectManager.get(this.state.base);
    }

    private get costAdjusters(): readonly CostAdjuster[] {
        return this.state.costAdjusters.map((x) => this.game.getFromRef(x));
    }

    public get passedActionPhase() {
        return this.state.passedActionPhase;
    }

    public set passedActionPhase(value: boolean | null) {
        this.state.passedActionPhase = value;
    }

    public get decklist(): IDeckListForLoading {
        return this.state.decklist;
    }

    public get allCards() {
        return this.state.decklist.allCards.map((x) => this.game.getFromRef(x));
    }

    public get tokens() {
        return this.state.decklist.tokens.map((x) => this.game.getFromRef(x));
    }

    public get autoSingleTarget() {
        return this.optionSettings.autoSingleTarget;
    }

    public get lastActionId() {
        return this._lastActionId;
    }

    public get promptState() {
        return this._promptState;
    }

    public get trackingId(): string {
        return this.id;
    }

    public get rejectedOpponentUndoRequests(): number {
        return this._rejectedOpponentUndoRequests;
    }

    public get undoRequestsBlocked(): boolean {
        return this._undoRequestsBlocked;
    }

    public get lobbyUser(): User | undefined {
        return this._lobbyUser;
    }

    public constructor(id: string, user: IUser, game: Game, useTimer = false) {
        super(game, user.username);

        Contract.assertNotNullLike(id);
        Contract.assertNotNullLike(user);
        Contract.assertNotNullLike(game);

        this.user = user;
        this.state.id = id;
        this.printedType = 'player';
        this.socket = null;
        this.disconnected = false;
        this.left = false;

        if (useTimer) {
            this.actionTimer = new ByoyomiTimer(
                this,
                this.game,
                () => this.game.onGameTimerExpired(this),
                (promptUuid: string, playerActionId: number) => this.checkPlayerTimeoutConditions(promptUuid, playerActionId),
                () => this.game.sendUpdatedGameStateToPlayers()
            );
        } else {
            this.actionTimer = new NoopActionTimer();
        }

        this.canTakeActionsThisPhase = null;
        this.state.handZone = new HandZone(game, this).getRef();
        this.state.resourceZone = new ResourceZone(game, this).getRef();
        this.state.discardZone = new DiscardZone(game, this).getRef();
        // mainly used for staging tokens when they are created / removed
        this.state.outsideTheGameZone = new OutsideTheGameZone(game, this).getRef();
        this.state.baseZone = null;
        this.state.deckZone = new DeckZone(game, this).getRef();

        /** @type {Deck} */
        this.decklistNames = null;

        this.promptedActionWindows = user.promptedActionWindows || {
            // these flags represent phase settings
            action: true,
            regroup: true
        };
        this.optionSettings = user.settings.optionSettings;

        this._promptState = new PlayerPromptState(this);
    }

    protected override setupDefaultState() {
        super.setupDefaultState();

        this.state.costAdjusters = [];
    }

    /**
     * @override
     * @returns {this is Player}
     */
    public override isPlayer(): this is Player {
        return true;
    }

    public incrementActionId() {
        this._lastActionId++;
    }

    public setLobbyUser(lobbyUser: User): void {
        Contract.assertIsNullLike(this._lobbyUser, 'lobbyUser is already set');
        this._lobbyUser = lobbyUser;
    }

    private checkPlayerTimeoutConditions(promptUuid: string, playerActionId: number) {
        return this.game.getCurrentOpenPrompt().uuid === promptUuid &&
          playerActionId === this._lastActionId &&
          this.game.winnerNames.length === 0;
    }

    public getArenaCards(filter: IAllArenasForPlayerCardFilterProperties = {}) {
        return this.game.allArenas.getCards({ ...filter, controller: this });
    }

    /**
     * @param {import('./zone/AllArenasZone').IAllArenasForPlayerSpecificTypeCardFilterProperties} filter
     */
    public getArenaUnits(filter: IAllArenasForPlayerSpecificTypeCardFilterProperties = {}) {
        return this.game.allArenas.getUnitCards({ ...filter, controller: this });
    }

    public getArenaUpgrades(filter: IAllArenasForPlayerSpecificTypeCardFilterProperties = {}) {
        return this.game.allArenas.getUpgradeCards({ ...filter, controller: this });
    }

    public hasSomeArenaCard(filter: IAllArenasForPlayerCardFilterProperties) {
        return this.game.allArenas.hasSomeCard({ ...filter, controller: this });
    }

    public hasSomeArenaUnit(filter: IAllArenasForPlayerSpecificTypeCardFilterProperties = {}) {
        return this.game.allArenas.hasSomeCard({ ...filter, type: WildcardCardType.Unit, controller: this });
    }

    public hasSomeArenaUpgrade(filter: IAllArenasForPlayerSpecificTypeCardFilterProperties = {}) {
        return this.game.allArenas.hasSomeCard({ ...filter, type: WildcardCardType.Upgrade, controller: this });
    }

    public get hasTheForce(): boolean {
        return this.baseZone.hasForceToken();
    }

    public get creditTokenCount(): number {
        return this.baseZone.credits.length;
    }

    public incrementRejectedOpponentUndoRequests() {
        this._rejectedOpponentUndoRequests++;
    }

    public setUndoRequestsBlocked(blocked: boolean) {
        this._undoRequestsBlocked = blocked;
    }

    /**
     * @param { String } title the title of the unit or leader to check for control of
     * @returns { boolean } true if this player controls a unit or leader with the given title
     */
    public controlsLeaderUnitOrUpgradeWithTitle(title: string): boolean {
        return this.leader.title === title ||
          this.hasSomeArenaUnit({ condition: (card) => card.title === title }) ||
          this.hasSomeArenaUpgrade({ condition: (card) => card.title === title });
    }

    /**
     * @param { Trait } trait the trait to look for
     * @param { boolean } onlyUnique only unique card
     * @param { Card } otherThan excluded card
     * @returns { boolean } true if this player controls a card with the trait
     */
    public controlsCardWithTrait(trait: Trait, onlyUnique: boolean = false, otherThan: Card = undefined): boolean {
        return this.leader.hasSomeTrait(trait) || this.hasSomeArenaCard({
            condition: (card) => (card.hasSomeTrait(trait) && (onlyUnique ? card.unique : true)),
            otherThan: otherThan
        });
    }

    /**
     * @param {ZoneName} zoneName
     * @returns {ZoneAbstract}
     */
    public getZone(zoneName: ZoneName): ZoneAbstract {
        switch (zoneName) {
            case ZoneName.Hand:
                return this.handZone;
            case ZoneName.Deck:
                return this.deckZone;
            case ZoneName.Discard:
                return this.discardZone;
            case ZoneName.Resource:
                return this.resourceZone;
            case ZoneName.Base:
                return this.baseZone;
            case ZoneName.OutsideTheGame:
                return this.outsideTheGameZone;
            case ZoneName.SpaceArena:
                return this.game.spaceArena;
            case ZoneName.GroundArena:
                return this.game.groundArena;
            default:
                Contract.fail(`Unknown zone: ${zoneName}`);
        }
    }

    /**
     * @param {ZoneName} zoneName
     * @returns {Card[]}
     */
    public getCardsInZone(zoneName: ZoneName): readonly Card[] {
        switch (zoneName) {
            case ZoneName.Hand:
                return this.handZone.cards;
            case ZoneName.Deck:
                Contract.assertNotNullLike(this.deckZone);
                return this.deckZone.cards;
            case ZoneName.Discard:
                return this.discardZone.cards;
            case ZoneName.Resource:
                return this.resourceZone.cards;
            case ZoneName.Base:
                return this.baseZone.cards;
            case ZoneName.OutsideTheGame:
                return this.outsideTheGameZone.cards;
            case ZoneName.SpaceArena:
                return this.game.spaceArena.getCards({ controller: this });
            case ZoneName.GroundArena:
                return this.game.groundArena.getCards({ controller: this });
            case ZoneName.Capture:
                return this.game.getAllCapturedCards(this);
            default:
                Contract.fail(`Unknown zone: ${zoneName}`);
        }
    }

    /**
     * Checks whether a card with a uuid matching the passed card is in the passed _(Array)
     */
    public isCardUuidInList<T extends Card>(list: T[], card: T) {
        return list.some((c) => {
            return c.uuid === card.uuid;
        });
    }

    /**
     * Checks whether a card with a name matching the passed card is in the passed list
     */
    public isCardNameInList<T extends Card>(list: T[], card: T) {
        return list.some((c) => {
            return c.title === card.title;
        });
    }

    /**
     * Removes a card with the passed uuid from a list. Returns an _(Array)
     */
    public removeCardByUuid<T extends Card>(list: T[], uuid: string) {
        return list.filter((card) => card.uuid !== uuid);
    }

    /**
     * Returns a card with the passed name in the passed list
     */
    public findCardByName<T extends Card>(list: T[], name: string) {
        return this.findCard(list, (card) => card.title === name);
    }

    /**
     * Returns a list of cards matching passed name
     */
    public findCardsByName<T extends Card>(list: T[], name: string) {
        return this.findCards(list, (card) => card.title === name);
    }

    /**
     * Returns a card with the passed uuid in the passed list
     */
    public findCardByUuid<T extends Card>(list: T[], uuid: string) {
        return this.findCard(list, (card) => card.uuid === uuid);
    }

    /**
     * Returns a card with the passed uuid from cardsInPlay
     * @param {String} uuid
     */
    public findCardInPlayByUuid(uuid: string) {
        return this.findCard(this.getArenaCards(), (card) => card.uuid === uuid);
    }

    /**
     * Returns a card which matches passed predicate in the passed list
     */
    public findCard<T extends Card>(cardList: T[], predicate: (card: T) => boolean): T | undefined {
        const cards = this.findCards(cardList, predicate);
        if (!cards || cards.length === 0) {
            return undefined;
        }

        return cards[0];
    }

    /**
     * Returns an Array of BaseCard which match passed predicate in the passed list
     */
    public findCards<T extends Card>(cardList: T[], predicate: (card: T) => boolean): T[] {
        Contract.assertNotNullLike(cardList);

        const cardsToReturn = [];

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
     * @param {Trait} trait
     * @param {any} ignoreUnit
     * @returns {boolean} true/false if the trait is in play
     */
    public isTraitInPlay(trait: Trait | Trait[], ignoreUnit: any = null): boolean {
        return this.hasSomeArenaUnit({ trait, otherThan: ignoreUnit });
    }

    /**
     * Returns if a unit is in play that has the passed aspect
     * @param {Aspect} aspect
     * @param {any} ignoreUnit
     * @returns {boolean} true/false if the trait is in play
     */
    public isAspectInPlay(aspect: Aspect | Aspect[], ignoreUnit: any = null): boolean {
        return this.hasSomeArenaUnit({ aspect, otherThan: ignoreUnit });
    }

    /**
     * Returns if a unit is in play that has the passed keyword
     * @param {KeywordName} keyword
     * @param {any} ignoreUnit
     * @returns {boolean} true/false if the trait is in play
     */
    public isKeywordInPlay(keyword: KeywordName | KeywordName[], ignoreUnit: any = null): boolean {
        return this.hasSomeArenaUnit({ keyword, otherThan: ignoreUnit });
    }

    /**
     * Returns true if any units or upgrades controlled by this player match the passed predicate
     * @param {Function} predicate - DrawCard => Boolean
     */
    public anyCardsInPlay(predicate: (card: Card) => boolean) {
        return this.game.allCards.some(
            (card) => card.controller === this && EnumHelpers.isArena(card.zoneName) && predicate(card)
        );
    }

    /**
     * Returns an Array of all unots and upgrades matching the predicate controlled by this player
     * @param {Function} predicate  - DrawCard => Boolean
     */
    public filterCardsInPlay(predicate: (card: Card) => boolean) {
        return this.game.allCards.filter(
            (card) => card.controller === this && EnumHelpers.isArena(card.zoneName) && predicate(card)
        );
    }

    public isActivePlayer() {
        return this.game.getActivePlayer() === this;
    }

    public hasInitiative() {
        return this.game.initiativePlayer === this;
    }

    public assignIndirectDamageDealtToOpponents() {
        return this.hasOngoingEffect(EffectName.AssignIndirectDamageDealtToOpponents);
    }

    /**
     * Returns the total number of units and upgrades controlled by this player which match the passed predicate
     * @param {Function} predicate - DrawCard => Int
     */
    public getNumberOfCardsInPlay(predicate: (card: Card) => boolean) {
        return this.game.allCards.reduce((num, card) => {
            if (card.controller === this && EnumHelpers.isArena(card.zoneName) && predicate(card)) {
                return num + 1;
            }

            return num;
        }, 0);
    }

    /**
     * Checks whether the passed card is in a legal zone for the passed type of play
     * @param {Card} card
     * @param {PlayType} [playingType]
     */
    public isCardInPlayableZone(card: Card, playingType: PlayType = null) {
        // Check if card can be legally played by this player out of discard from an ongoing effect
        if (
            card.zoneName === ZoneName.Discard &&
            card.hasOngoingEffect(EffectName.CanPlayFromDiscard)
        ) {
            return card
                .getOngoingEffectValues(EffectName.CanPlayFromDiscard)
                .map((value) => value.player ?? card.owner)
                .includes(this);
        }

        // Default to checking if there is a zone that matches play type and includes the card
        return this.playableZones.some(
            (zone) => (!playingType || zone.playingType === playingType) && zone.includes(card)
        );
    }

    /**
     * @param {Card} card
     * @returns {PlayType=}
     */
    public findPlayType(card: Card): PlayType | undefined {
        const zone = this.playableZones.find((zone) => zone.includes(card));
        if (zone) {
            return zone.playingType;
        }

        return undefined;
    }

    /**
     * Returns a card in play under this player's control which matches (for uniqueness) the passed card
     * @param {import('./card/baseClasses/InPlayCard').IInPlayCard} card
     * @returns {import('./card/baseClasses/InPlayCard').IInPlayCard[]} Duplicates of passed card (does not check unique status)
     */
    public getDuplicatesInPlay(card: IInPlayCard): IInPlayCard[] {
        return this.getArenaCards().filter((otherCard) =>
            otherCard.title === card.title &&
            otherCard.subtitle === card.subtitle &&
            otherCard !== card
        );
    }

    /**
     * Returns ths top card of the player's deck
     * @returns {import('./card/baseClasses/PlayableOrDeployableCard').IPlayableCard | null} the Card, or null if the deck is empty
     */
    public getTopCardOfDeck(): IPlayableCard | null {
        if (this.drawDeck.length > 0) {
            return this.drawDeck[0];
        }
        return null;
    }


    /**
     * Returns ths top cards of the player's deck
     * @param {number} numCard
     * @returns {import('./card/baseClasses/PlayableOrDeployableCard').IPlayableCard[]} the Card, or null if the deck is empty
     */
    public getTopCardsOfDeck(numCard: number): IPlayableCard[] {
        Contract.assertPositiveNonZero(numCard);
        const deckLength = this.drawDeck.length;
        const cardsToGet = Math.min(numCard, deckLength);

        if (this.drawDeck.length > 0) {
            return this.drawDeck.slice(0, cardsToGet);
        }
        return [];
    }

    /**
     * Draws the passed number of cards from the top of the deck into this players hand, shuffling if necessary
     * @param {number} numCards
     */
    public drawCardsToHand(numCards: number) {
        for (const card of this.drawDeck.slice(0, numCards)) {
            card.moveTo(ZoneName.Hand);
        }
    }

    public getStartingHandSize() {
        let startingHandSize = 6;
        if (this.base.hasOngoingEffect(EffectName.ModifyStartingHandSize)) {
            this.base.getOngoingEffectValues(EffectName.ModifyStartingHandSize).forEach((value) => {
                startingHandSize += value.amount;
            });
        }
        return startingHandSize;
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
    //  * @param {String} zone - one of 'province 1', 'province 2', 'province 3', 'province 4'
    //  */
    // replaceDynastyCard(zone) {
    //     let province = this.getProvinceCardInProvince(zone);

    //     if (!province || this.getCardPile(zone).size() > 1) {
    //         return false;
    //     }
    //     if (this.dynastyDeck.size() === 0) {
    //         this.deckRanOutOfCards('dynasty');
    //         this.game.queueSimpleStep(() => this.replaceDynastyCard(zone));
    //     } else {
    //         let refillAmount = 1;
    //         if (province) {
    //             let amount = province.mostRecentOngoingEffect(EffectName.RefillProvinceTo);
    //             if (amount) {
    //                 refillAmount = amount;
    //             }
    //         }

    //         this.refillProvince(zone, refillAmount);
    //     }
    //     return true;
    // }

    // putTopDynastyCardInProvince(zone, facedown = false) {
    //     if (this.dynastyDeck.size() === 0) {
    //         this.deckRanOutOfCards('dynasty');
    //         this.game.queueSimpleStep(() => this.putTopDynastyCardInProvince(zone, facedown));
    //     } else {
    //         let cardFromDeck = this.dynastyDeck.first();
    //         this.moveCard(cardFromDeck, zone);
    //         cardFromDeck.facedown = facedown;
    //         return true;
    //     }
    //     return true;
    // }

    /**
     * Shuffles the deck, displaying a message in chat
     * @param {AbilityContext} context
     */
    public shuffleDeck(context: AbilityContext = null) {
        this.game.addMessage('{0} is shuffling their deck', this);
        this.deckZone.shuffle(this.game.randomGenerator);
    }

    /**
     * Takes a decklist passed from the lobby, creates all the cards in it, and puts references to them in the relevant lists
     */
    public async prepareDecksAsync() {
        const preparedDecklist = await this.decklistNames.buildCardsAsync(this, this.game.cardDataGetter);

        this.state.base = preparedDecklist.base;
        this.state.leader = preparedDecklist.leader;

        this.deckZone.initialize(preparedDecklist.deckCards.map((x) => this.game.getFromRef(x)));

        // set up playable zones now that all relevant zones are created
        // STATE: This _is_ OK for now, as the gameObject references are still kept, but ideally these would also be changed to Refs in the future.
        /** @type {PlayableZone[]} */
        this.playableZones = [
            new PlayableZone(PlayType.PlayFromHand, this.handZone),
            new PlayableZone(PlayType.Piloting, this.handZone),
            new PlayableZone(PlayType.Smuggle, this.resourceZone),
            new PlayableZone(PlayType.Plot, this.resourceZone),
            new PlayableZone(PlayType.Piloting, this.deckZone), // TODO: interaction with Ezra
            new PlayableZone(PlayType.PlayFromOutOfPlay, this.deckZone),
            new PlayableZone(PlayType.Piloting, this.discardZone), // TODO: interactions with Fine Addition
            new PlayableZone(PlayType.PlayFromOutOfPlay, this.discardZone),
        ];

        this.state.baseZone = new BaseZone(this.game, this, this.base, this.leader).getRef();

        this.state.decklist = preparedDecklist;
    }

    /**
     * Called when the Game object starts the game. Creates all cards on this players decklist, shuffles the decks and initialises player parameters for the start of the game
     */
    public async initialiseAsync() {
        this.opponent = this.game.getOtherPlayer(this);
        await this.prepareDecksAsync();
        this.game.generateToken(this, TokenCardName.Force);
    }

    /**
     * Adds the passed Cost Adjuster to this Player
     * @param source = OngoingEffectSource source of the adjuster
     * @param {CostAdjuster} costAdjuster
     */
    public addCostAdjuster(costAdjuster: CostAdjuster) {
        this.state.costAdjusters.push(costAdjuster.getRef());
    }

    /**
     * Unregisters and removes the passed Cost Adjusters from this Player
     * @param {CostAdjuster} adjuster
     */
    public removeCostAdjuster(adjuster: CostAdjuster) {
        if (this.costAdjusters.includes(adjuster)) {
            adjuster.cancel();
            this.state.costAdjusters = this.costAdjusters.filter((r) => r !== adjuster).map((x) => x.getRef());
        }
    }

    public updateCreditTokenCostAdjuster() {
        const creditTokenAdjusters = this.costAdjusters.filter((adjuster) =>
            adjuster.isCreditTokenAdjuster()
        );

        Contract.assertFalse(creditTokenAdjusters.length > 1, `Multiple credit token cost adjusters found on player ${this.id}`);

        if (this.creditTokenCount === 0 && creditTokenAdjusters.length > 0) {
            this.removeCostAdjuster(creditTokenAdjusters[0]);
        } else if (this.creditTokenCount > 0 && creditTokenAdjusters.length === 0) {
            const newAdjuster = new DefeatCreditTokensCostAdjuster(this.game, this);
            this.addCostAdjuster(newAdjuster);
        }
    }

    public addPlayableZone(type: PlayType, zone: Zone) {
        const playableZone = new PlayableZone(type, zone);
        this.playableZones.push(playableZone);
        return playableZone;
    }

    public removePlayableZone(zone: PlayableZone) {
        this.playableZones = this.playableZones.filter((l) => l !== zone);
    }

    /**
     * Returns the aspects for this player (derived from base and leader)
     */
    public getAspects() {
        return this.leader.aspects.concat(this.base.aspects);
    }

    public getPenaltyAspects(costAspects: Aspect[]): Aspect[] {
        if (!costAspects) {
            return [];
        }

        const playerAspects = this.getAspects();

        const penaltyAspects = [];
        for (const aspect of costAspects) {
            const matchedIndex = playerAspects.indexOf(aspect);
            if (matchedIndex === -1) {
                penaltyAspects.push(aspect);
            } else {
                playerAspects.splice(matchedIndex, 1);
            }
        }

        return penaltyAspects;
    }

    public getCostAdjusters(): CostAdjuster[] {
        return [...this.costAdjusters];
    }

    /**
     * Called at the start of the Action Phase.  Resets some of the single round parameters
     */
    public resetForActionPhase() {
        this.passedActionPhase = false;
    }

    /**
     * Called at the end of the Action Phase.  Resets some of the single round parameters
     */
    public cleanupFromActionPhase() {
        this.passedActionPhase = null;
    }

    // showDeck() {
    //     this.showDeck = true;
    // }

    // /**
    //  * Called when a player drags and drops a card from one zone on the client to another
    //  * @param {String} cardId - the uuid of the dropped card
    //  * @param source
    //  * @param target
    //  */
    // drop(cardId, source, target) {
    //     var sourceList = this.getCardPile(source);
    //     var card = this.findCardByUuid(sourceList, cardId);

    //     // Dragging is only legal in manual mode, when the card is currently in source, when the source and target are different and when the target is a legal zone
    //     if (
    //         !this.game.manualMode ||
    //         source === target ||
    //         !this.isLegalZoneForCardTypes(card.types, target) ||
    //         card.zoneName !== source
    //     ) {
    //         return;
    //     }

    //     // Don't allow two province cards in one province
    //     if (
    //         card.isProvince &&
    //         target !== ZoneName.ProvinceDeck &&
    //         this.getCardPile(target).any((card) => card.isProvince)
    //     ) {
    //         return;
    //     }

    //     let display = 'a card';
    //     if (
    //         (card.isFaceup() && source !== ZoneName.Hand) ||
    //         [
    //             ZoneName.PlayArea,
    //             ZoneName.DynastyDiscardPile,
    //             ZoneName.ConflictDiscardPile,
    //             ZoneName.RemovedFromGame
    //         ].includes(target)
    //     ) {
    //         display = card;
    //     }

    //     this.game.addMessage('{0} manually moves {1} from their {2} to their {3}', this, display, source, target);
    //     this.moveCard(card, target);
    //     this.game.resolveGameState(true);
    // }

    /**
     * Checks whether card type is consistent with zone, checking for custom out-of-play zones
     * @param {CardType} cardType
     * @param {ZoneName | import('./Constants').MoveZoneDestination} zone
     */
    public isLegalZoneForCardType(cardType: CardType, zone: ZoneName | MoveZoneDestination) {
        const legalZonesForType = Helpers.defaultLegalZonesForCardTypeFilter(cardType);

        return legalZonesForType && EnumHelpers.cardZoneMatches(EnumHelpers.asConcreteZone(zone), legalZonesForType);
    }

    // get skillModifier() {
    //     return this.getOngoingEffectValues(EffectName.ChangePlayerSkillModifier).reduce((total, value) => total + value, 0);
    // }

    /**
     * Called by the game when the game starts, sets the players decklist
     * @param {Deck} deck
     */
    public selectDeck(deck: Deck) {
        this.decklistNames = deck;
    }

    /**
     * Returns the lobby deck assigned to this player
     * @returns {Deck | null} the deck or null if not set
     */
    public get lobbyDeck(): Deck | null {
        return this.decklistNames;
    }

    // TODO NOISY PR: rearrange this file into sections
    public get hand() {
        return this.handZone.cards;
    }

    public get discard() {
        return this.discardZone.cards;
    }

    public get resources() {
        return this.resourceZone.cards;
    }

    public get drawDeck(): readonly IPlayableCard[] {
        return this.deckZone?.deck;
    }

    /**
     * Returns the number of resources available to spend
     */
    public get readyResourceCount() {
        return this.resourceZone.readyResourceCount;
    }

    /**
     * Returns the number of exhausted resources
     */
    public get exhaustedResourceCount() {
        return this.resourceZone.exhaustedResourceCount;
    }

    /**
     * Moves a card from its current zone to the resource zone
     * @param {import('./card/baseClasses/PlayableOrDeployableCard').ICardWithExhaustProperty} card BaseCard
     * @param {boolean} exhaust Whether to exhaust the card. True by default.
     */
    public resourceCard(card: ICardWithExhaustProperty, exhaust: boolean = true) {
        card.moveTo(ZoneName.Resource);
        card.exhausted = exhaust;
    }

    /**
     * Exhaust the specified number of resources
     * @param {number} count
     * @param {import('./card/baseClasses/PlayableOrDeployableCard').ICardWithExhaustProperty[]} [priorityResources=[]]
     */
    // TODO: Create an ExhaustResourcesSystem
    public exhaustResources(count: number, priorityResources: ICardWithExhaustProperty[] = []) {
        const readyPriorityResources = priorityResources.filter((resource) => !resource.exhausted);
        const regularResourcesToReady = count - this.exhaustResourcesInList(readyPriorityResources, count);

        if (regularResourcesToReady > 0) {
            const readyRegularResources = this.resourceZone.readyResources;
            this.exhaustResourcesInList(readyRegularResources, regularResourcesToReady);
        }
    }

    /**
     * Returns how many resources were readied
     * @param {import('./card/baseClasses/PlayableOrDeployableCard').ICardWithExhaustProperty[]} resources
     * @param {number} count
     * @returns {number}
     */
    public exhaustResourcesInList(resources: readonly ICardWithExhaustProperty[], count: number): number {
        if (count < resources.length) {
            resources.slice(0, count).forEach((resource) => resource.exhaust());
            return count;
        }

        resources.forEach((resource) => resource.exhaust());
        return resources.length;
    }

    /**
     * Ready the specified number of resources
     * @param {number} count
     */
    public readyResources(count: number) {
        const exhaustedResources = this.resourceZone.exhaustedResources;
        for (let i = 0; i < Math.min(count, exhaustedResources.length); i++) {
            exhaustedResources[i].exhausted = false;
        }
    }

    /**
     * If possible, exhaust the given resource and ready another one instead
     * @param {import('./card/baseClasses/PlayableOrDeployableCard').ICardWithExhaustProperty} resource
     */
    public swapResourceReadyState(resource: ICardWithExhaustProperty) {
        Contract.assertTrue(resource.zoneName === ZoneName.Resource, 'Tried to exhaust a resource that is not in the resource zone');

        // The resource is already exhausted, do nothing
        if (resource.exhausted) {
            return;
        }

        // Find an exhausted resource to ready and swap the status
        const exhaustedResource = this.resources.find((card) => card.exhausted);
        if (exhaustedResource) {
            resource.exhaust();
            exhaustedResource.ready();
        }
    }

    /**
     * @param {AbilityContext} context
     * @param {number} amount
     */
    public getRandomResources(context: AbilityContext, amount: number) {
        this.resourceZone.rearrangeResourceExhaustState(context);
        return this.resourceZone.getCards().splice(0, amount);
    }

    public get selectableCards() {
        return this._promptState.selectableCards;
    }

    public get selectedCards() {
        return this._promptState.selectedCards;
    }

    /**
     * Sets the passed cards as selected
     * @param {Card[]} cards
     */
    public setSelectedCards(cards: Card[]) {
        this._promptState.setSelectedCards(cards);
    }

    public clearSelectedCards() {
        this._promptState.clearSelectedCards();
    }

    /**
     * @param {Card[]} cards
     */
    public setSelectableCards(cards: Card[]) {
        this._promptState.setSelectableCards(cards);
    }

    public clearSelectableCards() {
        this._promptState.clearSelectableCards();
    }

    public getSummaryForHand(list, activePlayer) {
        // if (this.optionSettings.sortHandByName) {
        //     return this.getSortedSummaryForCardList(list, activePlayer);
        // }
        return this.getSummaryForZone(list, activePlayer);
    }

    /**
     * @param {ZoneName} zone
     * @param {Player} activePlayer
     */
    public getSummaryForZone(zone: ZoneName, activePlayer: Player) {
        Contract.assertFalse(zone === ZoneName.Deck, 'getSummaryForZone should not be called for the deck as it is not used in the UI');

        return this.getCardsInZone(zone)?.map((card) => {
            return card.getSummary(activePlayer);
        }) ?? [];
    }

    public getSortedSummaryForCardList(list, activePlayer) {
        const cards = list.map((card) => card);
        cards.sort((a, b) => a.printedName.localeCompare(b.printedName));

        return cards.map((card) => {
            return card.getSummary(activePlayer);
        });
    }

    /**
     * @param {Card} card
     */
    public getCardSelectionState(card: Card) {
        return this._promptState.getCardSelectionState(card);
    }

    public getAttackerHighlightingState(card: Card) {
        return this._promptState.attackTargetingHighlightAttacker === card;
    }

    public currentPrompt() {
        return this._promptState.getState();
    }

    public setPrompt(prompt) {
        this._promptState.setPrompt(prompt);
    }

    public cancelPrompt() {
        this._promptState.cancelPrompt();
    }

    public isTopCardShown(activePlayer: Player = this) {
        if (activePlayer.drawDeck && activePlayer.drawDeck.length <= 0) {
            return false;
        }

        if (activePlayer === this) {
            return (
                this.getOngoingEffectValues(EffectName.ShowTopCard).includes(WildcardRelativePlayer.Any) ||
                this.getOngoingEffectValues(EffectName.ShowTopCard).includes(RelativePlayer.Self)
            );
        }

        return (
            this.getOngoingEffectValues(EffectName.ShowTopCard).includes(WildcardRelativePlayer.Any) ||
            this.getOngoingEffectValues(EffectName.ShowTopCard).includes(RelativePlayer.Opponent)
        );
    }

    public override getShortSummary() {
        return {
            ...super.getShortSummary(),
            type: ChatObjectType.Player,
        };
    }

    // TODO STATE SAVE: clean this up
    // /**
    //  * This information is passed to the UI
    //  * @param {Player} activePlayer
    //  */
    public getStateSummary(activePlayer) {
        const isActivePlayer = activePlayer === this;
        const promptState = isActivePlayer ? this._promptState.getState() : {};
        const { ...safeUser } = this.user;

        let isActionPhaseActivePlayer = null;
        if (this.game.actionPhaseActivePlayer != null) {
            isActionPhaseActivePlayer = this.game.actionPhaseActivePlayer === this;
        }

        const summary = {
            cardPiles: {
                hand: this.getSummaryForZone(ZoneName.Hand, activePlayer),
                outsideTheGame: this.getSummaryForZone(ZoneName.OutsideTheGame, activePlayer),
                capturedZone: this.getSummaryForZone(ZoneName.Capture, activePlayer),
                resources: this.getSummaryForZone(ZoneName.Resource, activePlayer),
                groundArena: this.getSummaryForZone(ZoneName.GroundArena, activePlayer),
                spaceArena: this.getSummaryForZone(ZoneName.SpaceArena, activePlayer),
                discard: this.getSummaryForZone(ZoneName.Discard, activePlayer),
                // we don't get the deck summary here, as it is not needed in the UI
            },
            disconnected: this.disconnected,
            hasInitiative: this.hasInitiative(),
            availableResources: this.readyResourceCount,
            leader: this.leader?.getSummary(activePlayer),
            base: this.base?.getSummary(activePlayer),
            id: this.id,
            left: this.left,
            name: this.name,
            // optionSettings: this.optionSettings,
            phase: this.game.currentPhase,
            promptedActionWindows: this.promptedActionWindows,
            // stats: this.getStats(),
            user: safeUser,
            promptState: promptState,
            isActionPhaseActivePlayer,
            clock: undefined,
            aspects: this.getAspects(),
            forceToken: this.getForceTokenSummary(),
            credits: this.getCreditsSummary(activePlayer),
            turnTimeRemainingSeconds: this.actionTimer.turnTimeRemainingSeconds,
            mainTimeRemainingSeconds: this.actionTimer.mainTimeRemainingSeconds,
            numCardsInDeck: this.drawDeck?.length,
            availableSnapshots: this.buildAvailableSnapshotsState(isActionPhaseActivePlayer),
            topCardOfDeck: undefined
        };

        if (this.isTopCardShown(activePlayer)) {
            const topCard = activePlayer.getTopCardOfDeck();
            summary.topCardOfDeck = topCard.getSummary(activePlayer, true);
        }

        return summary;
    }

    private getForceTokenSummary() {
        return {
            active: this.hasTheForce,
            uuid: this.hasTheForce ? this.baseZone.forceToken.uuid : undefined, // UUID is needed for selection on the client
            selectionState: this.hasTheForce ? this.getCardSelectionState(this.baseZone.forceToken) : undefined,
        };
    }

    private getCreditsSummary(activePlayer: Player) {
        // TODO: If there is ever an effect that can selectively blank Credit tokens,
        // this class will need to account for which Credits can actually be used to
        // adjust costs. For now, it's all or nothing (Galen Erso's effect).
        const creditsAreBlanked = this.baseZone.credits.length > 0 && this.baseZone.credits[0].isBlank();
        const uuids = this.baseZone.credits.map((credit) => credit.uuid);

        return {
            count: this.creditTokenCount,
            uuids: uuids, // UUID is needed for selection on the client
            isBlanked: creditsAreBlanked ? true : undefined, // Don't include in summary if false
            selectionState: this.baseZone.credits.length > 0 ? activePlayer.getCardSelectionState(this.baseZone.credits[0]) : undefined
        };
    }

    private buildAvailableSnapshotsState(isActionPhaseActivePlayer = false) {
        if (!this.game.isUndoEnabled) {
            return null;
        }

        if (
            this.game.gameEndReason === GameEndReason.Concede ||
            this.game.gameEndReason === GameEndReason.PlayerLeft
        ) {
            return { quickSnapshotAvailable: QuickUndoAvailableState.NoSnapshotAvailable };
        }

        let availableActionSnapshots = this.countAvailableActionSnapshots();
        const hasStartOfCurrentActionSnapshot = isActionPhaseActivePlayer && availableActionSnapshots > 0;

        if (hasStartOfCurrentActionSnapshot) {
            // don't count the current snapshot in the history
            availableActionSnapshots -= 1;
        }

        return {
            startOfCurrentAction: hasStartOfCurrentActionSnapshot,
            actionSnapshots: availableActionSnapshots,
            actionPhaseSnapshots: this.game.countAvailablePhaseSnapshots(PhaseName.Action),
            regroupPhaseSnapshots: this.game.countAvailablePhaseSnapshots(PhaseName.Regroup),
            quickSnapshotAvailable: this.game.hasAvailableQuickSnapshot(this.id),
        };
    }

    public countAvailableActionSnapshots() {
        return this.game.countAvailableActionSnapshots(this.id);
    }

    public countAvailableManualSnapshots() {
        return this.game.countAvailableManualSnapshots(this.id);
    }

    /**
     * Captures a player's current state in readable format
     * @param player The player string object
     * @returns A simplified player state representation
     */
    public capturePlayerState(player: string): IPlayerSerializedState {
        const state: IPlayerSerializedState = {};
        try {
            Contract.assertNotNullLike(this.game, `Game object in capturePlayerState is null for player ${this.id}`);
            // Hand cards
            if (this.handZone && this.handZone.cards && this.handZone.cards.length > 0) {
                state.hand = this.handZone.cards.map((card) => card.internalName);
            }

            // Ground arena units
            const groundArenaCards = this.game.groundArena.getCards({ controller: this });
            if (groundArenaCards.length > 0) {
                state.groundArena = groundArenaCards
                    .filter((card) => !card.isLeaderUnit() && !card.isAttached())
                    .map((card) => Helpers.safeSerialize(this.game, () => card.captureCardState(), card.internalName));
            }
            // Space arena units
            const spaceArenaCards = this.game.spaceArena.getCards({ controller: this });
            if (spaceArenaCards.length > 0) {
                state.spaceArena = spaceArenaCards
                    .filter((card) => !card.isLeaderUnit() && !card.isAttached())
                    .map((card) => Helpers.safeSerialize(this.game, () => card.captureCardState(), card.internalName));
            }
            // Discard pile
            if (this.discardZone.count > 0) {
                state.discard = this.discardZone.cards.map((card) => card.internalName);
            }

            // Deck (top few cards only to avoid excessive data)
            state.deck = this.deckZone.cards.slice(0, 5).map((card) => card.internalName);

            // Resources
            if (this.resourceZone.count > 0) {
                // If it's ready, just return the card name
                state.resources = this.resourceZone.cards.map((card) =>
                    (Helpers.safeSerialize(this.game, () =>
                        (!card.exhausted
                            ? card.internalName
                            : {
                                card: card.internalName,
                                exhausted: card.exhausted
                            }), card.internalName
                    )));
            }

            // Leader
            state.leader = Helpers.safeSerialize(this.game, () => this.leader.captureCardState(), null);

            // Base
            state.base = Helpers.safeSerialize(this.game, () => this.base.captureCardState(), null);

            // Initiative
            state.hasInitiative = this.hasInitiative();

            // Force Token
            state.hasForceToken = this.hasTheForce;

            // Credits
            if (this.creditTokenCount > 0) {
                state.credits = this.creditTokenCount;
            }
        } catch (error) {
            logger.error('Error capturing player state', {
                error: { message: error.message, stack: error.stack },
                playerId: this.id
            });
            throw error;
        }

        return state;
    }

    public override getGameObjectName(): string {
        return 'Player';
    }

    /** @override */
    public override toString() {
        return this.name;
    }
}