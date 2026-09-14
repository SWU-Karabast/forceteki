/* eslint-disable @typescript-eslint/prefer-for-of */
import { ZoneName, DeckZoneDestination } from '../../server/game/core/Constants.js';
import type { Arena, MoveZoneDestination } from '../../server/game/core/Constants.js';
import { Card } from '../../server/game/core/card/Card.js';
import * as GameStateInjector from '../../server/game/core/stateSerialization/GameStateInjector.js';
import TestSetupError from './TestSetupError.js';
import Util from './Util.js';
import { TrackedGameCardMetric, GameCardMetric } from '../../server/gameStatistics/GameStatisticsTracker.js';
import type { Game } from '../../server/game/core/Game.js';
import type { InPlayCard } from '../../server/game/core/card/baseClasses/InPlayCard.js';
import type { IAttackableCard } from '../../server/game/core/card/CardInterfaces.js';
import type { ICardWithExhaustProperty } from '../../server/game/core/card/baseClasses/PlayableOrDeployableCard.js';
import type { IStatefulPromptResults } from '../../server/game/core/gameSteps/PromptInterfaces.js';
import { nonEnumerable } from './decorators.js';

export class PlayerInteractionWrapper {
    @nonEnumerable
    public game: Game;

    @nonEnumerable
    public player: Player;

    @nonEnumerable
    public testContext: GameFlowWrapper;

    public constructor(game: Game, player: Player, testContext: GameFlowWrapper) {
        this.game = game;
        this.player = player;
        this.testContext = testContext;
    }

    public get name() {
        return this.player.user.username;
    }

    public get id() {
        return this.player.id;
    }

    /**
     * Moves all cards other than leader + base to the RemovedFromTheGame zone so they can
     * be moved into their proper starting zones for the test.
     */
    public moveAllNonBaseZonesToRemoved() {
        GameStateInjector.moveAllNonBaseZonesToStaging(this.player);

        Util.refreshGameState(this.game);
    }

    public get hand() {
        return this.player.hand;
    }

    /**
     * Sets the player's hand to contain the specified cards. Moves cards between
     * hand and conflict deck
     * @param {String|DrawCard[]} [newContents] - a list of card names or objects
     */
    public setHand(newContents = [], prevZones = ['deck']) {
        // Return the current hand to the deck before resolving names: a mid-test re-set that reuses a
        // card name currently in hand must see it as available again, the way the interleaved resolve-then-
        // move the pre-injector helper did. The injector's own "current hand -> deck top" step then finds
        // nothing left to clear (a no-op, per B2), since this has already done it.
        for (const card of [...this.player.handZone.cards]) {
            card.moveTo(DeckZoneDestination.DeckTop);
        }

        const cards = this.resolveCardsByName(newContents, prevZones);

        GameStateInjector.setHand(this.player, cards);
    }

    /**
     * Gets the player's base card
     */
    public get base() {
        return this.player.base;
    }

    /**
     * Sets the player's base card
     */
    public set base(Card) {
        this.player.base = Card;
    }

    /**
     * Gets all cards in play for a player in the space arena
     * @return {BaseCard[]} - List of player's cards currently in play in the space arena
     */
    public get inPlay() {
        return this.player.filterCardsInPlay(() => true);
    }

    public setLeaderStatus(leaderOptions: { card: any; deployed?: boolean; damage?: number; exhausted?: boolean; upgrades?: any; capturedUnits?: any; flipped?: any }) {
        if (!leaderOptions) {
            return;
        }

        // leader as a string card name is a no-op unless it doesn't match the existing leader, then throw an error
        if (typeof leaderOptions === 'string') {
            if (leaderOptions !== this.player.deckLeader.internalName) {
                throw new TestSetupError(`Provided leader name ${leaderOptions} does not match player's leader ${this.player.deckLeader.internalName}. Do not try to change leader after test has initialized.`);
            }
            return;
        }

        if (leaderOptions.card !== this.player.deckLeader.internalName) {
            throw new TestSetupError(`Provided leader name ${leaderOptions.card} does not match player's leader ${this.player.deckLeader.internalName}. Do not try to change leader after test has initialized.`);
        }

        const leaderCard = this.player.deckLeader;

        if (!leaderOptions.deployed) {
            if (leaderOptions.damage) {
                throw new TestSetupError('Leader should not have damage when not deployed');
            }
            if (leaderOptions.upgrades) {
                throw new TestSetupError('Leader should not have upgrades when not deployed');
            }
        }

        // `onStartingSide` is declarative (unlike this option's toggle-style `flipped`): passing it only
        // when `flipped` is truthy preserves the old one-shot-flip behavior without ever requiring a
        // non-double-sided leader to answer the "which side" question at all. It is also gated on
        // `!leaderOptions.deployed`, matching the removed helper exactly: the old code's `leaderCard.flipLeader()`
        // call lived only in its non-deployed branch, so `{ deployed: true, flipped: true }` silently
        // ignored `flipped` there. Passing `onStartingSide` unconditionally would newly throw
        // `StateInjectionError` (or newly flip) for that combination, which is undocumented behavior
        // change, not a bug fix, so the gate preserves the old silent-ignore instead.
        GameStateInjector.setLeaderStatus(this.player, {
            deployed: leaderOptions.deployed,
            damage: leaderOptions.damage,
            exhausted: leaderOptions.exhausted,
            onStartingSide: (!leaderOptions.deployed && leaderOptions.flipped) ? false : undefined,
        });

        if (leaderOptions.deployed) {
            // The engine operation deliberately does no deploy-limit bookkeeping (AC3); this wrapper
            // restores the net behavior test setup always had by spending it explicitly here.
            GameStateInjector.markLeaderDeployUsed(this.player);

            if (leaderOptions.upgrades) {
                this.setCardUpgrades(leaderCard, leaderOptions.upgrades);
            }

            if (leaderOptions.capturedUnits) {
                this.setCapturedUnits(leaderCard, leaderOptions.capturedUnits);
            }
        }

        Util.refreshGameState(this.game);
    }

    public setBaseStatus(baseOptions: { card: any; damage: number; capturedUnits?: any; upgrades?: any }) {
        if (!baseOptions) {
            return;
        }
        // base as a string card name is a no-op unless it doesn't match the existing base, then throw an error
        if (typeof baseOptions === 'string') {
            if (baseOptions !== this.player.base.internalName) {
                throw new TestSetupError(`Provided base name ${baseOptions} does not match player's base ${this.player.base.internalName}. Do not try to change base after test has initialized.`);
            }
            return;
        }

        if (baseOptions.card !== this.player.base.internalName) {
            throw new TestSetupError(`Provided base name ${baseOptions.card} does not match player's base ${this.player.base.internalName}. Do not try to change base after test has initialized.`);
        }

        const baseCard = this.player.base;
        GameStateInjector.setBaseStatus(this.player, { damage: baseOptions.damage || 0 });

        if (baseOptions.capturedUnits) {
            this.setCapturedUnits(baseCard, baseOptions.capturedUnits);
        }

        if (baseOptions.upgrades) {
            this.setCardUpgrades(baseCard, baseOptions.upgrades);
        }

        Util.refreshGameState(this.game);
    }

    /**
     * Gets all cards in play for a player in the space arena
     * @return {BaseCard[]} - List of player's cards currently in play in the space arena
     */
    public get spaceArena() {
        return this.player.filterCardsInPlay((card: { zoneName: string }) => card.zoneName === 'spaceArena');
    }

    /**
     * List of player's units in the space arena
     * @return {BaseCard[]} - List of player's units currently in play in the space arena
     */
    public get spaceArenaUnits() {
        return this.spaceArena.filter((card: { isUnit: () => any }) => card.isUnit());
    }

    public setSpaceArenaUnits(newState = [], prevZones = ['deck', 'hand']) {
        this.setArenaUnits('spaceArena', this.spaceArena, newState, prevZones);
    }

    /**
     * Gets all cards in play for a player in the ground arena
     * @return {BaseCard[]} - List of player's cards currently in play in the ground arena
     */
    public get groundArena() {
        return this.player.filterCardsInPlay((card: { zoneName: string }) => card.zoneName === 'groundArena');
    }

    /**
     * List of player's units in the ground arena
     * @return {BaseCard[]} - List of player's units currently in play in the ground arena
     */
    public get groundArenaUnits() {
        return this.groundArena.filter((card: { isUnit: () => any }) => card.isUnit());
    }

    public setGroundArenaUnits(newState = [], prevZones = ['deck', 'hand']) {
        this.setArenaUnits('groundArena', this.groundArena, newState, prevZones);
    }

    /**
     * List of objects describing units in play and any upgrades:
     * Either as Object:
     * {
     *    card: String,
     *    exhausted: Boolean
     *    covert: Boolean,
     *    upgrades: String[],
     *    damage: Number
     *  }
     * or String containing name or id of the card
     * @param {String} arenaName - name of the arena to set the units in, either 'groundArena' or 'spaceArena'
     * @param {DrawCard[]} currentUnitsInArena - list of cards currently in the arena
     * @param {(Object|String)[]} newState - list of cards in play and their states
     */
    public setArenaUnits(arenaName: string, currentUnitsInArena: any[], newState = [], prevZones = ['deck', 'hand']) {
        // Return the units currently in this arena to the deck before resolving any new names, so a
        // mid-test re-set that reuses a card name currently on the board can find it again (see setHand's
        // comment). The injector's own "clear this arena" step then has nothing left to do.
        for (const card of currentUnitsInArena) {
            card.moveTo(DeckZoneDestination.DeckTop);
        }

        // All entries (and their upgrades/captured units) resolve names against the same pool in one pass,
        // before any of them moves, so a repeated name must not resolve to the same card object twice —
        // `claimed` is threaded through every resolution below to exclude cards already spoken for.
        const claimed: Card[] = [];

        const entries = newState.map((options) => {
            if (typeof options === 'string') {
                options = {
                    card: options
                };
            }
            if (!options.card) {
                throw new TestSetupError('You must provide a card name');
            }

            const opponentControlled = options.hasOwnProperty('owner') && options.owner !== this.player.name;

            let card: Card;
            if (Util.isTokenUnit(options.card)) {
                card = this.generateToken(this.player, options.card);
            } else {
                card = this.resolveCardsByName([options.card], prevZones, opponentControlled ? 'opponent' : null, claimed)[0];
            }
            claimed.push(card);

            if (!card.isUnit()) {
                throw new TestSetupError(`Attempting to add non-unit card ${card.internalName} to ${arenaName}`);
            } else if (card.defaultArena !== arenaName) {
                throw new TestSetupError(`Attempting to place ${card.internalName} in invalid arena '${arenaName}'`);
            }

            const upgrades = options.upgrades
                ? options.upgrades.map((upgrade: any) => {
                    const upgradeCard = this.resolveUpgradeCard(upgrade, prevZones, claimed);
                    claimed.push(upgradeCard);
                    return upgradeCard;
                })
                : undefined;
            const capturedUnits = options.capturedUnits
                ? options.capturedUnits.map((capturedUnit: any) => {
                    const capturedCard = this.resolveCapturedUnitCard(capturedUnit, prevZones, claimed);
                    claimed.push(capturedCard);
                    return capturedCard;
                })
                : undefined;

            return {
                card,
                controller: opponentControlled ? card.owner.opponent : undefined,
                exhausted: options.exhausted != null ? !!options.exhausted : false,
                damage: options.damage ?? 0,
                upgrades,
                capturedUnits,
            };
        });

        GameStateInjector.setArenaUnits(this.player, arenaName as Arena, entries);

        Util.refreshGameState(this.game);
    }

    private resolveUpgradeCard(upgrade: any, prevZones: string | string[] = 'any', excluding: Card[] = []): InPlayCard {
        const upgradeName = (typeof upgrade === 'string') ? upgrade : upgrade.card;
        if (Util.isTokenUpgrade(upgradeName)) {
            return this.generateToken(this.player, upgradeName) as InPlayCard;
        }
        return this.resolveCardsByName([upgradeName], prevZones, undefined, excluding)[0] as unknown as InPlayCard;
    }

    public setCardUpgrades(card: any, upgrades: any, prevZones: string | string[] = 'any') {
        const claimed: Card[] = [];
        for (const upgrade of upgrades) {
            const upgradeCard = this.resolveUpgradeCard(upgrade, prevZones, claimed);
            claimed.push(upgradeCard);
            GameStateInjector.attachUpgrade(upgradeCard, card);
        }
    }

    private resolveCapturedUnitCard(capturedUnit: any, prevZones: string | string[] = 'any', excluding: Card[] = []) {
        const capturedUnitName = (typeof capturedUnit === 'string') ? capturedUnit : capturedUnit.card;
        const side = (capturedUnit.hasOwnProperty('owner') && capturedUnit.owner === this.player.name) ? 'self' : 'opponent';
        if (Util.isTokenUnit(capturedUnitName)) {
            throw new TestSetupError(`Attempting to add token unit ${capturedUnitName} to a capture zone`);
        }
        return this.resolveCardsByName([capturedUnitName], prevZones, side, excluding)[0];
    }

    public setCapturedUnits(card: IAttackableCard, capturedUnits: any, prevZones: string | string[] = 'any') {
        const claimed: Card[] = [];
        for (const capturedUnit of capturedUnits) {
            const capturedUnitCard = this.resolveCapturedUnitCard(capturedUnit, prevZones, claimed);
            claimed.push(capturedUnitCard);
            GameStateInjector.captureCard(capturedUnitCard, card);
        }
    }

    public generateToken(player: any, tokenName: any) {
        return GameStateInjector.generateToken(player, tokenName);
    }

    public get deck() {
        return this.player.drawDeck;
    }

    public setDeck(newContents = [], prevZones = ['any']) {
        // Resolve names in the same order `GameStateInjector.setDeck` will place them in (reversed, since
        // it places `cards` so `cards[0]` ends on top) rather than the caller's order. For duplicate names
        // whose physical copies sit in different zones, resolution order determines which entry claims
        // which copy, and the pre-port helper resolved-then-immediately-moved in this same reversed order
        // (see `PlayerInteractionWrapper.setDeck` prior to the P2-C1 port). Reversing the resolved array
        // back afterward restores this method's own `cards[0]`-on-top contract for its caller.
        const cards = this.resolveCardsByName([...newContents].reverse(), prevZones).reverse();

        GameStateInjector.setDeck(this.player, cards);
    }

    public get resources() {
        return this.player.resources;
    }

    /**
     * Sets the player's resource count to the specified number, using
     * a default card name
     */
    public setResourceCount(count: any) {
        this.setResourceCards(Array(count).fill('underworld-thug'));
    }

    /**
     * List of objects describing cards in resource area
     * Either as Object:
     * {
     *    card: String,
     *    exhausted: Boolean
     *  }
     * or String containing name or id of the card
     * @param {(Object|String)[]} newState - list of cards in play and their states
     */
    public setResourceCards(newContents = [], prevZones = ['deck', 'hand']) {
        // See setHand's comment: return current resources to the deck before resolving names, so a
        // mid-test re-set (e.g. setResourceCount after resources already exist) can find a card name
        // that's currently resourced.
        for (const card of [...this.player.resourceZone.cards]) {
            card.moveTo(DeckZoneDestination.DeckTop);
        }

        const names = newContents.map((resource) => (typeof resource === 'string' ? resource : resource.card));
        // See setDeck's comment: resolve in the same reversed order `GameStateInjector.setResources`
        // places entries in, so duplicate-named entries claim the same physical copy the pre-port helper
        // did, then reverse back to restore the caller-order contract of `entries` below.
        const cards = this.resolveCardsByName([...names].reverse(), prevZones).reverse();
        const entries = newContents.map((resource, i) => ({
            card: cards[i] as ICardWithExhaustProperty,
            exhausted: typeof resource === 'string' ? false : resource.exhausted,
        }));

        GameStateInjector.setResources(this.player, entries);

        Util.refreshGameState(this.game);
    }

    public attachOpponentOwnedUpgrades(opponentOwnedUpgrades = []) {
        for (const upgrade of opponentOwnedUpgrades) {
            const upgradeCard = this.findCardByName(upgrade.card, 'any', 'opponent');
            const attachedCardAlsoOpponentControlled = upgrade.hasOwnProperty('attachedToOwner') && upgrade.attachedToOwner !== this.player.name;
            const attachTo = attachedCardAlsoOpponentControlled ? this.findCardByName(upgrade.attachedTo, 'any', 'opponent') : this.findCardByName(upgrade.attachedTo);
            GameStateInjector.attachUpgrade(upgradeCard, attachTo);
        }
    }

    public get handSize() {
        return this.player.hand.length;
    }

    public get deckSize() {
        return this.player.decklist.deckCards.length;
    }

    public get readyResourceCount() {
        return this.player.readyResourceCount;
    }

    public get exhaustedResourceCount() {
        return this.player.exhaustedResourceCount;
    }

    public get discard() {
        return this.player.discard;
    }

    /**
     * Sets the contents of the conflict discard pile
     * @param {String[]} newContents - list of names of cards to be put in conflict discard
     */
    public setDiscard(newContents = [], prevZones = ['deck']) {
        // See setHand's comment: return the current discard to the deck before resolving names, so a
        // mid-test re-set that reuses a card name currently in discard can find it again.
        for (const card of [...this.player.discardZone.cards]) {
            card.moveTo(DeckZoneDestination.DeckTop);
        }

        // See setDeck's comment: resolve in the same reversed order `GameStateInjector.setDiscard`
        // places cards in, then reverse back to restore the caller-order contract.
        const cards = this.resolveCardsByName([...newContents].reverse(), prevZones).reverse();

        GameStateInjector.setDiscard(this.player, cards);
    }

    public get initiativePlayer() {
        return this.game.initiativePlayer;
    }

    public get hasInitiative() {
        return this.game.initiativePlayer != null && this.game.initiativePlayer.id === this.player.id;
    }

    public get hasTheForce() {
        return this.player.hasTheForce;
    }

    public get credits() {
        return this.player.creditTokenCount;
    }

    public get actionPhaseActivePlayer() {
        return this.game.actionPhaseActivePlayer;
    }

    public get activePlayer() {
        return this.game.getActivePlayer();
    }

    public get opponent() {
        return this.player.opponent;
    }

    public currentPrompt() {
        return this.player.currentPrompt();
    }

    public get currentButtons() {
        const buttons = this.currentPrompt().buttons;
        return buttons.map((button: { text: { toString: () => any } }) => button.text.toString());
    }

    /**
     * Lists cards selectable by the player during the action
     * @return {DrawCard[]} - selectable cards
     */
    public get currentActionTargets() {
        return this.player.promptState.selectableCards;
    }

    /**
     * Lists cards currently selected by the player
     * @return {DrawCard[]} - selected cards
     */
    public get selectedCards() {
        return this.player.promptState.selectedCards;
    }

    /**
     * Determines whether a player can initiate actions
     * @return {Boolean} - whether the player can initiate actions or has to wait
     */
    public get canAct() {
        return !this.hasPrompt('Waiting for opponent to take an action or pass');
    }

    public findCardByName(name: string, zones: string | string[] = 'any', side?: string) {
        const cards = this.filterCardsByName(name, zones, side);
        // TODO: Update to throw exception when returning more or less than 1 card. This will require updates to the test suite.git
        if (cards.length === 0) {
            throw new TestSetupError(`Could not find any cards matching name ${name}`);
        }
        return cards[0];
    }

    public findCardsByName(names: any, zones: string | string[] = 'any', side?: any) {
        return this.filterCardsByName(names, zones, side);
    }

    /**
     * Resolves a list of names (or already-resolved cards) to distinct `Card` instances, preserving input
     * order. Two entries with the same name resolve to two different copies rather than the same card
     * object twice: each lookup excludes cards already claimed earlier in this same call (via `excluding`,
     * which the caller may pre-seed with cards claimed by a sibling resolution — e.g. a controller-arena
     * unit list and its own upgrades/captures resolved from the same pool). Injection operations that take
     * a whole list of pre-resolved cards in one call (`setHand`, `setDeck`, `setDiscard`, `setResources`,
     * `setArenaUnits`) rely on this: unlike the old helper methods, they no longer resolve one name and
     * immediately move it before resolving the next, so nothing else would break the tie between duplicate
     * names.
     */
    private resolveCardsByName(namesOrCards: any[], zones: string | string[] = 'any', side?: string, excluding: Card[] = []): Card[] {
        const resolved: Card[] = [];
        for (const nameOrCard of namesOrCards) {
            if (typeof nameOrCard !== 'string') {
                resolved.push(nameOrCard);
                continue;
            }

            const allMatches = this.filterCardsByName(nameOrCard, zones, side);
            const candidate = allMatches.find((card: Card) => !excluding.includes(card) && !resolved.includes(card));
            if (!candidate) {
                if (allMatches.length > 0) {
                    // At least one card named `nameOrCard` exists, but every copy is already claimed by an
                    // earlier entry in this same call (duplicate name requesting more copies than exist) —
                    // a distinct problem from "no such card", so it gets its own message rather than
                    // reusing findCardByName's "not found" wording, which would misdirect a spec author at
                    // the name instead of the actual copy-count shortfall.
                    throw new TestSetupError(`Not enough copies of '${nameOrCard}' available: requested more than the ${allMatches.length} distinct ${allMatches.length === 1 ? 'copy' : 'copies'} found in zones [${[].concat(zones).join(', ')}]`);
                }
                throw new TestSetupError(`Could not find any cards matching name ${nameOrCard}`);
            }
            resolved.push(candidate);
        }
        return resolved;
    }

    /**
     * Filters all of a player's cards using the name and zone of a card
     * @param {String} names - the names of the cards
     * @param {String[]|String} [zones = 'any'] - zones in which to look for. 'provinces' = 'province 1', 'province 2', etc.
     * @param {String?} side - set to 'opponent' to search in opponent's cards
     */
    public filterCardsByName(names: any, zones: string | string[] = 'any', side?: any) {
        // So that function can accept either lists or single zones
        const namesAra = Array.isArray(names) ? names : [names];
        if (zones !== 'any') {
            if (!Array.isArray(zones)) {
                zones = [zones];
            }
        }
        return this.filterCards(
            (card: { cardData: { internalName: any }; zoneName: string }) => namesAra.includes(card.cardData.internalName) && (zones === 'any' || zones.includes(card.zoneName)),
            side
        );
    }

    public findCard(condition: any, side: any) {
        const cards = this.filterCards(condition, side);
        if (cards.length === 0) {
            throw new TestSetupError('Could not find any matching cards');
        }
        return cards[0];
    }

    /**
     *   Filters cards by given condition
     *   @param {function(card: DrawCard)} condition - card matching function
     *   @param {String} [side] - set to 'opponent' to search in opponent's cards
     *   @returns {any[]}
     */
    public filterCards(condition: (card: any) => boolean, side: string) {
        let player = this.player;
        if (side === 'opponent') {
            player = this.opponent;
        }
        return player.decklist.allCards.map(
            (x: any) => this.game.getFromId(x)
        ).filter(condition);
    }

    public exhaustResources(number: any) {
        this.player.exhaustResources(number);
        Util.refreshGameState(this.game);
    }

    public setExactReadyResources(number: number) {
        const availableResources = this.player.resources.length;

        if (number > availableResources) {
            throw new TestSetupError(`Cannot set ready resources to ${number} as only ${availableResources} resources are available`);
        }

        this.player.readyResources(availableResources);

        const resourcesToExhaust = availableResources - number;
        this.player.exhaustResources(resourcesToExhaust);
        Util.refreshGameState(this.game);
    }

    public hasPrompt(title: string) {
        const currentPrompt = this.player.currentPrompt();

        // Evaluar si menuTitle es una función o un string
        const menuTitle =
            typeof currentPrompt.menuTitle === 'function'
                ? currentPrompt.menuTitle(this.player.context)
                : currentPrompt.menuTitle;

        // Evaluar si promptTitle es una función o un string
        const promptTitle =
            typeof currentPrompt.promptTitle === 'function'
                ? currentPrompt.promptTitle(this.player.context)
                : currentPrompt.promptTitle;

        return (
            !!currentPrompt &&
            (menuTitle && menuTitle.toLowerCase() === title.toLowerCase()) ||
            (menuTitle && (menuTitle.replace('(because you are choosing from a hidden zone you may choose nothing)', '').trim()
                .toLowerCase() === title.toLowerCase())) || (promptTitle && promptTitle.toLowerCase() === title.toLowerCase())
        );
    }

    public selectDeck(deck: any) {
        this.game.selectDeck(this.player.id, deck);
    }

    public clickPrompt(text: string) {
        text = text.toString();
        const currentPrompt = this.player.currentPrompt();
        let promptButton = currentPrompt.buttons.find(
            (button: { text: { toString: () => string } }) => button.text.toString().toLowerCase() === text.toLowerCase()
        );

        if (!promptButton && text.toLowerCase() === 'done') {
            promptButton = currentPrompt.buttons.find((button: { arg: string }) => button.arg === 'done');
        }

        if (!promptButton || promptButton.disabled) {
            throw new TestSetupError(
                `Couldn't click on '${text}' for ${this.player.name}. Current prompt is:\n${Util.formatBothPlayerPrompts(this.testContext)}`
            );
        }

        this.game.menuButton(this.player.id, promptButton.arg, promptButton.uuid, promptButton.method);
        this.game.continue();
        // this.checkUnserializableGameState();
    }

    public chooseListOption(text: any) {
        const currentPrompt = this.player.currentPrompt();
        const numberValue = Number(text);
        const isValidNumberPromptChoice =
          currentPrompt.selectNumber &&
          Number.isInteger(numberValue) &&
          numberValue >= currentPrompt.selectNumber.min &&
          numberValue <= currentPrompt.selectNumber.max;

        if (!currentPrompt.dropdownListOptions.includes(text) && !isValidNumberPromptChoice) {
            throw new TestSetupError(
                `Couldn't choose list option '${text}' for ${this.player.name}. Current prompt is:\n${Util.formatBothPlayerPrompts(this.testContext)}`
            );
        }

        // @ts-ignore
        this.game.menuButton(this.player.id, text, currentPrompt.promptUuid);
        this.game.continue();
        // this.checkUnserializableGameState();
    }

    public setDistributeDamagePromptState(cardDistributionMap: any) {
        this.setDistributeAmongTargetsPromptState(cardDistributionMap, 'distributeDamage');
    }

    public setDistributeIndirectDamagePromptState(cardDistributionMap: any) {
        this.setDistributeAmongTargetsPromptState(cardDistributionMap, 'distributeIndirectDamage');
    }

    public setDistributeHealingPromptState(cardDistributionMap: any) {
        this.setDistributeAmongTargetsPromptState(cardDistributionMap, 'distributeHealing');
    }

    /** Resolves a distribute prompt for any token upgrade (Experience, Advantage, Weakness) — they share the `distributeTokenUpgrade` prompt type. */
    public setDistributeTokenUpgradePromptState(cardDistributionMap: any) {
        this.setDistributeAmongTargetsPromptState(cardDistributionMap, 'distributeTokenUpgrade');
    }

    public setDistributeAmongTargetsPromptState(cardDistributionMap: any, type: string) {
        const currentPrompt = this.player.currentPrompt();

        const cardDistributionArray = [...cardDistributionMap].map(([card, amount]) => ({
            uuid: card.uuid,
            amount
        }));

        const promptResults: IStatefulPromptResults = {
            valueDistribution: cardDistributionArray,
            type: type as any
        };

        this.game.statefulPromptResults(this.player.id, promptResults, currentPrompt.promptUuid);
        this.game.continue();
        // this.checkUnserializableGameState();
    }

    public clickDisplayCardPromptButton(cardUuid: any, arg: any) {
        const currentPrompt = this.player.currentPrompt();

        // @ts-ignore
        this.game.perCardMenuButton(this.player.id, arg, cardUuid, currentPrompt.promptUuid);
        this.game.continue();
    }

    public clickCardInDisplayCardPrompt(card: { uuid: any; internalName: any }, allowClickUnselectable = false) {
        Util.checkNullCard(card);

        const currentPrompt = this.player.currentPrompt();

        const clickingCard = currentPrompt.displayCards.find(
            (cardEntry: { cardUuid: any }) => cardEntry.cardUuid === card.uuid
        );

        if (!clickingCard || (!allowClickUnselectable && (clickingCard.selectionState === 'unselectable' || clickingCard.selectionState === 'invalid'))) {
            throw new TestSetupError(
                `Couldn't click on '${card.internalName}' in card display prompt for ${this.player.name}. Current prompt is:\n${Util.formatBothPlayerPrompts(this.testContext)}`
            );
        }

        this.game.menuButton(this.player.id, card.uuid, currentPrompt.promptUuid, 'menuButton');
        this.game.continue();

        // this.checkUnserializableGameState();
        return card;
    }

    // click any N of the selectable cards available
    // used for randomly selecting resource cards to get through the setup phase
    public clickAnyOfSelectableCards(nCardsToChoose: number) {
        const availableCards = this.currentActionTargets;

        if (!availableCards || availableCards.length < nCardsToChoose) {
            throw new TestSetupError(`Insufficient card targets available for control, expected ${nCardsToChoose} found ${availableCards?.length ?? 0} prompt:\n${Util.formatBothPlayerPrompts(this.testContext)}`);
        }

        for (let i = 0; i < nCardsToChoose; i++) {
            this.game.cardClicked(this.player.id, availableCards[i].uuid);
        }
        this.game.continue();

        // this.checkUnserializableGameState();
    }

    public clickCardNonChecking(card: Pick<Card, 'name' | 'internalName' | 'uuid'> | string, zone = 'any', side = 'self') {
        this.clickCard(card, zone, side, false);
    }

    public clickCard(card: Pick<Card, 'name' | 'internalName' | 'uuid'> | string, zone = 'any', side = 'self', expectChange = true) {
        Util.checkNullCard(card);

        if (typeof card === 'string') {
            card = this.findCardByName(card, zone, side) as { name: string; internalName: string; uuid: string };
        }

        if (expectChange && !this.currentActionTargets.includes(card)) {
            throw new TestSetupError(
                `Couldn't click on '${card.internalName}' for ${this.player.name}. The card is not selectable!\nCurrent prompts:\n${Util.formatBothPlayerPrompts(this.testContext)}`
            );
        }

        let beforeClick = null;
        if (expectChange) {
            beforeClick = Util.getPlayerPromptState(this.player);
        }

        this.game.cardClicked(this.player.id, card.uuid);
        this.game.continue();

        if (expectChange) {
            const afterClick = Util.getPlayerPromptState(this.player);
            if (Util.promptStatesEqual(beforeClick, afterClick)) {
                throw new TestSetupError(`Nothing happened when ${this.player.name} clicked ${card.internalName} (prompt and board state did not change). Current prompts:\n${Util.formatBothPlayerPrompts(this.testContext)}`);
            }
        }

        // this.checkUnserializableGameState();
        return card;
    }

    /**
     * Clicks the first card in the specified zone.
     * @param {String} zone - The zone to click the first card in.
     * @param {Number} pos - The position of the card to click.
     */
    public clickCardPosInZone(zone: string, pos: number, side = 'self', expectChange = true) {
        if (pos < 0 || pos >= this.player[zone].length) {
            throw new TestSetupError(`Position ${pos} is out of bounds for ${zone} zone`);
        }

        return this.clickCard(this.player[zone][pos], zone, side, expectChange);
    }

    /**
     * Clicks the first card in the specified zone.
     * @param {String} zone - The zone to click the first card in.
     */
    public clickFirstCardInZone(zone: any, side = 'self', expectChange = true) {
        return this.clickCardPosInZone(zone, 0, side, expectChange);
    }

    /**
     * Clicks the card in the player's hand at the specified position.
     * @param {Number} pos - The position of the card to click.
     */
    public clickCardInHand(pos: number, expectChange = true) {
        return this.clickCardPosInZone('hand', pos, 'self', expectChange);
    }

    /**
     * Clicks the first card in the player's hand.
     */
    public clickFirstCardInHand(expectChange = true) {
        return this.clickCardInHand(0, expectChange);
    }

    /**
     * Clicks the second card in the player's hand.
     */
    public clickSecondCardInHand(expectChange = true) {
        return this.clickCardInHand(1, expectChange);
    }

    public clickMenu(card: { getMenu: () => any[]; name: any; uuid: any }, menuText: any) {
        if (typeof card === 'string') {
            card = this.findCardByName(card);
        }

        const items = card.getMenu().filter((item: { text: any }) => item.text === menuText);

        if (items.length === 0) {
            throw new TestSetupError(`Card ${card.name} does not have a menu item '${menuText}'`);
        }

        // @ts-ignore - Need to ignore type error because menuItemClick expects a MenuItem object but we're only passing the text property of the MenuItem for testing purposes
        this.game.menuItemClick(this.player.id, card.uuid, items[0]);
        this.game.continue();
        // this.checkUnserializableGameState();
    }

    public getCardsInZone(zone: any) {
        return this.player.getCardsInZone(zone);
    }

    public getArenaCards() {
        return this.player.getArenaCards();
    }

    public dragCard(card: { uuid: any; zoneName: any }, targetZone: any) {
        // @ts-ignore
        this.game.drop(this.player.id, card.uuid, card.zoneName, targetZone);
        this.game.continue();
        // this.checkUnserializableGameState();
    }

    /**
     * Moves cards between ZoneName
     * @param {String|DrawCard} card - card to be moved
     * @param {String} targetZone - zone where the card should be moved
     * @param {String | String[]} searchZones - zones where to find the
     * card object, if card parameter is a String
     */
    public moveCard(card: string | Card | { card: Card }, targetZone: string, searchZones = 'any') {
        // TODO: Check that space units can not be added to ground arena and vice versa
        if (!(card instanceof Card)) {
            const cardName = typeof card === 'string' ? card : card.card;
            card = this.mixedListToCardList([cardName], searchZones)[0];
        }
        // @ts-ignore - Need to ignore type error because moveTo expects a Zone object but we're only passing the zone name for testing purposes
        card.moveTo(targetZone === ZoneName.Deck ? DeckZoneDestination.DeckTop : targetZone);
        this.game.continue();
        return card;
    }

    /**
     * Moves cards between zones WITHOUT calling game.continue().
     * Use this for batch operations during test setup to avoid pipeline overhead.
     * Call Util.refreshGameState() once after all moves are complete.
     * @param {String|DrawCard} card - card to be moved
     * @param {String} targetZone - zone where the card should be moved
     * @param {String | String[]} searchZones - zones where to find the card object
     */
    public setupMoveCard(card: string | Card | { card: Card }, targetZone: MoveZoneDestination | ZoneName.Deck, searchZones: string | string[] = 'any') {
        if (!(card instanceof Card)) {
            const cardName = typeof card === 'string' ? card : card.card;
            card = this.mixedListToCardList([cardName], searchZones)[0];
        }
        card.moveTo(targetZone === ZoneName.Deck ? DeckZoneDestination.DeckTop : targetZone);
        return card;
    }

    public togglePromptedActionWindow(window: string | number, value: any) {
        this.player.promptedActionWindows[window] = value;
    }

    /**
     * Player's action of passing priority
     */
    public passAction() {
        if (!this.canAct) {
            throw new TestSetupError(`${this.name} can't pass, because they don't have priority`);
        }
        this.clickPrompt('Pass');
    }

    /**
     * Player clicks Done prompt
     */
    public clickDone() {
        const currentPrompt = this.player.currentPrompt();
        const doneButton = currentPrompt.buttons.find((button: { arg: string; text: { toString: () => string } }) =>
            button.arg === 'done' || button.text.toString().toLowerCase() === 'done'
        );

        if (!doneButton || doneButton.disabled) {
            throw new TestSetupError(`${this.name} can't click Done, because it is not present in the prompt:\n${Util.formatBothPlayerPrompts(this.testContext)}`);
        }

        this.game.menuButton(this.player.id, doneButton.arg, doneButton.uuid, doneButton.method);
        this.game.continue();
    }

    /**
     * Player's action of passing priority
     */
    public claimInitiative() {
        if (!this.canAct) {
            throw new TestSetupError(`${this.name} can't pass, because they don't have priority`);
        }
        this.clickPrompt('Claim Initiative');
    }

    /**
     *
     */
    public setActivePlayer() {
        this.game.actionPhaseActivePlayer = this.player;
        if (this.game.currentActionWindow) {
            // @ts-ignore - Need to ignore type error because activePlayer expects a Player object but we're only passing the player for testing purposes
            this.game.currentActionWindow.activePlayer = this.player;
        }
        Util.refreshGameState(this.game);
    }

    /**
     * Sets the Force Token state for the player
     * @param {Boolean} hasForce - true if the player should have the Force Token
     */
    public setHasTheForce(hasForce = true) {
        GameStateInjector.setHasTheForce(this.player, hasForce);
    }

    public setCreditTokenCount(count: number) {
        GameStateInjector.setCreditTokenCount(this.player, count);
    }

    public playAttachment(attachment: any, target: any) {
        const card = this.clickCard(attachment, 'hand');
        if (this.currentButtons.includes('Play ' + card.name + ' as an attachment')) {
            this.clickPrompt('Play ' + card.name + ' as an attachment');
        }
        this.clickCard(target, 'play area');
        return card;
    }

    public readyResources(number: any) {
        this.player.readyResources(number);
        Util.refreshGameState(this.game);
    }

    public playCharacterFromHand(card: any, fate = 0) {
        if (typeof card === 'string') {
            card = this.findCardByName(card, 'hand');
        }
        this.clickCard(card, 'hand');
        if (this.currentButtons.includes('Play this character')) {
            this.clickPrompt('Play this character');
        }
        this.clickPrompt(fate.toString());
        return card;
    }

    /**
     * Converts a mixed list of card objects and card names to a list of card objects
     * @param {(DrawCard|String)[]} mixed - mixed list of cards and names or ids
     * @param {String[]|String} zones - list of zones to get card objects from
     */
    public mixedListToCardList(mixed: any[], zones: string | string[] = 'any'): Card[] {
        if (!mixed) {
            return [];
        }
        // Yank all the non-string cards
        const cardList = mixed.filter((card: any) => typeof card !== 'string');
        mixed = mixed.filter((card: any) => typeof card === 'string');
        // Find cards objects for the rest
        mixed.forEach((card: any) => {
            // Find only those cards that aren't already in the list
            const cardObject = this.filterCardsByName(card, zones).find((card: any) => !cardList.includes(card));
            if (!cardObject) {
                throw new TestSetupError(`Could not find card named ${card}`);
            }
            cardList.push(cardObject);
        });

        return cardList;
    }

    /**
     * Removes cards unable to participate in a specified type of conflict from a list
     * @param {DrawCard[]} cardList - list of card objects
     * @param {String} type - type of conflict 'military' or 'political'
     */
    public filterUnableToParticipate(cardList: any[], type: any) {
        return cardList.filter((card: { hasDash: (arg0: any) => any }) => {
            if (!card) {
                return false;
            }
            return !card.hasDash(type);
        });
    }

    // checkUnserializableGameState() {
    //     let state = this.game.getState(this.player.id);
    //     let results = detectBinary(state);
    //     if (results.length !== 0) {
    //         throw new TestSetupError('Unable to serialize game state back to client:\n' + JSON.stringify(results));
    //     }
    // }

    public reduceDeckToNumber(number: number) {
        for (let i = this.deck.length - 1; i >= number; i--) {
            this.moveCard(this.deck[i], 'discard');
        }
    }

    /**
     * Return a tracked card metric for a card that was played.
     * @param {Card} card - The card that was played
     * @returns {TrackedGameCardMetric}
     */
    public played(card: Card) {
        return new TrackedGameCardMetric(this.game, GameCardMetric.Played, card, this.player);
    }

    /**
     * Return a tracked card metric for a card that was drawn.
     * @param {Card} card - The card that was drawn
     * @returns {TrackedGameCardMetric}
     */
    public drew(card: Card) {
        return new TrackedGameCardMetric(this.game, GameCardMetric.Drawn, card, this.player);
    }

    /**
     * Return a tracked card metric for a card that was discarded.
     * @param {Card} card - The card that was discarded
     * @returns {TrackedGameCardMetric}
     */
    public discarded(card: Card) {
        return new TrackedGameCardMetric(this.game, GameCardMetric.Discarded, card, this.player);
    }

    /**
     * Return a tracked card metric for a card that was resourced.
     * @param {Card} card - The card that was resourced
     * @returns {TrackedGameCardMetric}
     */
    public resourced(card: Card) {
        return new TrackedGameCardMetric(this.game, GameCardMetric.Resourced, card, this.player);
    }


    /**
     * Return a tracked card metric for a card that was activated.
     * @param {Card} card - The card that was activated
     * @returns {TrackedGameCardMetric}
     */
    public activated(card: Card) {
        return new TrackedGameCardMetric(this.game, GameCardMetric.Activated, card, this.player);
    }
}

module.exports = PlayerInteractionWrapper;
