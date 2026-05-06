import type { CardDataGetter } from '../../../utils/cardData/CardDataGetter';
import type { Deck } from '../../../utils/deck/Deck';
import {
    type CardEntry,
    type IBaseSpec,
    type ICustomSetupPlayerState,
    type ICustomSetupState,
    type ICustomSetupValidationError,
    type ILeaderSpec,
    type ResourceEntry,
    getAllowedPlayerKeys,
    getAllowedTopLevelKeys,
    isTokenUpgradeName,
} from './CustomSetupTypes';

/**
 * Validates that a parsed custom setup JSON is structurally well-formed and
 * that every named card is present in the corresponding player's deck.
 *
 * Returns an array of all errors found (empty array means valid). Validation
 * stops walking a sub-tree only when it can't make progress; otherwise it
 * collects every problem so the user sees them all at once.
 */
export class CustomSetupValidator {
    public static validate(
        setup: unknown,
        ownerDeck: Deck | undefined,
        opponentDeck: Deck | undefined,
        cardDataGetter: CardDataGetter,
    ): ICustomSetupValidationError[] {
        const errors: ICustomSetupValidationError[] = [];

        if (!isPlainObject(setup)) {
            errors.push({ path: '', message: 'Setup must be a JSON object' });
            return errors;
        }

        for (const key of Object.keys(setup)) {
            if (!getAllowedTopLevelKeys().has(key)) {
                errors.push({ path: key, message: `Unknown top-level key '${key}'` });
            }
        }

        if (Object.prototype.hasOwnProperty.call(setup, 'phase')) {
            const phase = setup.phase;
            if (phase !== 'action' && phase !== undefined) {
                errors.push({ path: 'phase', message: `Only 'action' phase is supported (got '${String(phase)}')` });
            }
        }

        if (!('player1' in setup)) {
            errors.push({ path: 'player1', message: 'Missing player1 block' });
        }
        if (!('player2' in setup)) {
            errors.push({ path: 'player2', message: 'Missing player2 block' });
        }

        if (setup.player1 !== undefined) {
            this.validatePlayer('player1', setup.player1, ownerDeck, cardDataGetter, errors);
        }
        if (setup.player2 !== undefined) {
            this.validatePlayer('player2', setup.player2, opponentDeck, cardDataGetter, errors);
        }

        const player1HasInit = isPlainObject(setup.player1) && setup.player1.hasInitiative === true;
        const player2HasInit = isPlainObject(setup.player2) && setup.player2.hasInitiative === true;
        if (player1HasInit && player2HasInit) {
            errors.push({ path: 'hasInitiative', message: 'Only one player can start with initiative' });
        }

        return errors;
    }

    private static validatePlayer(
        path: string,
        playerRaw: unknown,
        deck: Deck | undefined,
        cardDataGetter: CardDataGetter,
        errors: ICustomSetupValidationError[],
    ): void {
        if (!isPlainObject(playerRaw)) {
            errors.push({ path, message: 'Player block must be an object' });
            return;
        }
        const player = playerRaw as ICustomSetupPlayerState;

        for (const key of Object.keys(player)) {
            if (!getAllowedPlayerKeys().has(key)) {
                errors.push({ path: `${path}.${key}`, message: `Unknown player property '${key}'` });
            }
        }

        if (!deck) {
            errors.push({ path, message: 'No deck loaded for this player yet — both players must load a deck before applying a custom setup' });
            return;
        }

        const availableCards = collectDeckInternalNames(deck, cardDataGetter);

        this.validateLeader(`${path}.leader`, player.leader, deck, cardDataGetter, errors);
        this.validateBase(`${path}.base`, player.base, deck, cardDataGetter, errors);

        for (const zoneKey of ['hand', 'discard', 'deck'] as const) {
            const list = player[zoneKey];
            if (list === undefined) {
                continue;
            }
            if (!Array.isArray(list)) {
                errors.push({ path: `${path}.${zoneKey}`, message: 'Must be an array of card names' });
                continue;
            }
            list.forEach((entry, i) => {
                if (typeof entry !== 'string') {
                    errors.push({ path: `${path}.${zoneKey}[${i}]`, message: 'Must be a card internalName string' });
                    return;
                }
                if (!availableCards.has(entry)) {
                    errors.push({ path: `${path}.${zoneKey}[${i}]`, message: `Card '${entry}' is not in this player's deck` });
                }
            });
        }

        for (const arenaKey of ['groundArena', 'spaceArena'] as const) {
            const list = player[arenaKey];
            if (list === undefined) {
                continue;
            }
            if (!Array.isArray(list)) {
                errors.push({ path: `${path}.${arenaKey}`, message: 'Must be an array' });
                continue;
            }
            list.forEach((entry, i) => {
                this.validateCardEntry(`${path}.${arenaKey}[${i}]`, entry, availableCards, errors, true);
            });
        }

        if (player.resources !== undefined) {
            this.validateResources(`${path}.resources`, player.resources, availableCards, errors);
        }

        if (player.credits !== undefined && (typeof player.credits !== 'number' || !Number.isInteger(player.credits) || player.credits < 0)) {
            errors.push({ path: `${path}.credits`, message: 'Must be a non-negative integer' });
        }

        if (player.hasInitiative !== undefined && typeof player.hasInitiative !== 'boolean') {
            errors.push({ path: `${path}.hasInitiative`, message: 'Must be a boolean' });
        }
        if (player.hasForceToken !== undefined && typeof player.hasForceToken !== 'boolean') {
            errors.push({ path: `${path}.hasForceToken`, message: 'Must be a boolean' });
        }
    }

    private static validateLeader(
        path: string,
        leader: string | ILeaderSpec | undefined,
        deck: Deck,
        cardDataGetter: CardDataGetter,
        errors: ICustomSetupValidationError[],
    ): void {
        if (leader === undefined) {
            return;
        }
        const deckLeaderName = resolveInternalName(deck.leader.id, cardDataGetter);
        if (typeof leader === 'string') {
            if (leader !== deckLeaderName) {
                errors.push({
                    path,
                    message: `Leader '${leader}' does not match the player's deck leader '${deckLeaderName}'`,
                });
            }
            return;
        }
        if (!isPlainObject(leader)) {
            errors.push({ path, message: 'Leader must be a string or an object' });
            return;
        }
        if (leader.card !== undefined && leader.card !== deckLeaderName) {
            errors.push({
                path: `${path}.card`,
                message: `Leader '${leader.card}' does not match the player's deck leader '${deckLeaderName}'`,
            });
            return;
        }
        if (typeof leader !== 'string') {
            if (leader.deployed === false) {
                if (typeof leader.damage === 'number' && leader.damage > 0) {
                    errors.push({ path: `${path}.damage`, message: 'Leader cannot have damage when not deployed' });
                }
                if (Array.isArray(leader.upgrades) && leader.upgrades.length > 0) {
                    errors.push({ path: `${path}.upgrades`, message: 'Leader cannot have upgrades when not deployed' });
                }
            }
            if (leader.upgrades !== undefined) {
                if (!Array.isArray(leader.upgrades)) {
                    errors.push({ path: `${path}.upgrades`, message: 'Must be an array' });
                } else {
                    const availableCards = collectDeckInternalNames(deck, cardDataGetter);
                    leader.upgrades.forEach((u, i) => {
                        this.validateCardEntry(`${path}.upgrades[${i}]`, u, availableCards, errors, false);
                    });
                }
            }
        }
    }

    private static validateBase(
        path: string,
        base: string | IBaseSpec | undefined,
        deck: Deck,
        cardDataGetter: CardDataGetter,
        errors: ICustomSetupValidationError[],
    ): void {
        if (base === undefined) {
            return;
        }
        const deckBaseName = resolveInternalName(deck.base.id, cardDataGetter);
        if (typeof base === 'string') {
            if (base !== deckBaseName) {
                errors.push({
                    path,
                    message: `Base '${base}' does not match the player's deck base '${deckBaseName}'`,
                });
            }
            return;
        }
        if (!isPlainObject(base)) {
            errors.push({ path, message: 'Base must be a string or an object' });
            return;
        }
        if (base.card !== undefined && base.card !== deckBaseName) {
            errors.push({
                path: `${path}.card`,
                message: `Base '${base.card}' does not match the player's deck base '${deckBaseName}'`,
            });
        }
        if (base.damage !== undefined && (typeof base.damage !== 'number' || base.damage < 0)) {
            errors.push({ path: `${path}.damage`, message: 'Must be a non-negative number' });
        }
    }

    private static validateCardEntry(
        path: string,
        entry: CardEntry,
        availableCards: Set<string>,
        errors: ICustomSetupValidationError[],
        allowUpgrades: boolean,
    ): void {
        if (typeof entry === 'string') {
            if (!availableCards.has(entry)) {
                errors.push({ path, message: `Card '${entry}' is not in this player's deck` });
            }
            return;
        }
        if (!isPlainObject(entry) || typeof entry.card !== 'string') {
            errors.push({ path, message: 'Must be a card name string or an object with a card field' });
            return;
        }
        if (!availableCards.has(entry.card)) {
            errors.push({ path: `${path}.card`, message: `Card '${entry.card}' is not in this player's deck` });
        }
        if (entry.damage !== undefined && (typeof entry.damage !== 'number' || entry.damage < 0)) {
            errors.push({ path: `${path}.damage`, message: 'Must be a non-negative number' });
        }
        if (entry.exhausted !== undefined && typeof entry.exhausted !== 'boolean') {
            errors.push({ path: `${path}.exhausted`, message: 'Must be a boolean' });
        }
        if (entry.upgrades !== undefined) {
            if (!allowUpgrades) {
                errors.push({ path: `${path}.upgrades`, message: 'Upgrades are not allowed here' });
            } else if (!Array.isArray(entry.upgrades)) {
                errors.push({ path: `${path}.upgrades`, message: 'Must be an array' });
            } else {
                entry.upgrades.forEach((u, i) => {
                    if (typeof u === 'string') {
                        if (isTokenUpgradeName(u)) {
                            return;
                        }
                        if (!availableCards.has(u)) {
                            errors.push({ path: `${path}.upgrades[${i}]`, message: `Upgrade '${u}' is not in this player's deck` });
                        }
                    } else if (isPlainObject(u) && typeof u.card === 'string') {
                        if (isTokenUpgradeName(u.card)) {
                            return;
                        }
                        if (!availableCards.has(u.card)) {
                            errors.push({ path: `${path}.upgrades[${i}].card`, message: `Upgrade '${u.card}' is not in this player's deck` });
                        }
                    } else {
                        errors.push({ path: `${path}.upgrades[${i}]`, message: 'Must be a card name string or an object with a card field' });
                    }
                });
            }
        }
    }

    private static validateResources(
        path: string,
        resources: number | ResourceEntry[],
        availableCards: Set<string>,
        errors: ICustomSetupValidationError[],
    ): void {
        if (typeof resources === 'number') {
            if (!Number.isInteger(resources) || resources < 0) {
                errors.push({ path, message: 'Must be a non-negative integer' });
            }
            return;
        }
        if (!Array.isArray(resources)) {
            errors.push({ path, message: 'Must be a number or an array of card names' });
            return;
        }
        resources.forEach((entry, i) => {
            if (typeof entry === 'string') {
                if (!availableCards.has(entry)) {
                    errors.push({ path: `${path}[${i}]`, message: `Card '${entry}' is not in this player's deck` });
                }
                return;
            }
            if (!isPlainObject(entry) || typeof entry.card !== 'string') {
                errors.push({ path: `${path}[${i}]`, message: 'Must be a card name string or an object with a card field' });
                return;
            }
            if (!availableCards.has(entry.card)) {
                errors.push({ path: `${path}[${i}].card`, message: `Card '${entry.card}' is not in this player's deck` });
            }
            if (entry.exhausted !== undefined && typeof entry.exhausted !== 'boolean') {
                errors.push({ path: `${path}[${i}].exhausted`, message: 'Must be a boolean' });
            }
        });
    }
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Looks up a card's actual `internalName` slug (e.g. "porg") from its set
 * code. We can't trust `IInternalCardEntry.internalName` because
 * `Deck.buildDecklistEntry` populates it with the cardMap entry's `id` field
 * (e.g. "porg-id"), which is the wrong field. Resolving via setCodeMap +
 * cardMap gives us the real internalName players type into the JSON.
 */
function resolveInternalName(setCode: string, cardDataGetter: CardDataGetter): string | undefined {
    const internalId = cardDataGetter.setCodeMap.get(setCode);
    if (internalId == null) {
        return undefined;
    }
    return cardDataGetter.cardMap.get(internalId)?.internalName;
}

function collectDeckInternalNames(deck: Deck, cardDataGetter: CardDataGetter): Set<string> {
    const set = new Set<string>();
    const leaderName = resolveInternalName(deck.leader.id, cardDataGetter);
    if (leaderName) {
        set.add(leaderName);
    }
    const baseName = resolveInternalName(deck.base.id, cardDataGetter);
    if (baseName) {
        set.add(baseName);
    }
    for (const entry of deck.getDecklist().deck) {
        const name = resolveInternalName(entry.id, cardDataGetter);
        if (name) {
            set.add(name);
        }
    }
    return set;
}
