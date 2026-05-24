import { validateGameState, parseGameState, validateGameHistory, parseGameHistory } from '../../../server/game/core/gameStateFormat/GameStateFormatValidator';
import type { IGameStateValidationError } from '../../../server/game/core/gameStateFormat/GameStateFormatTypes';

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Minimal structurally-valid player state — leader and base are always required. */
const MINIMAL_PLAYER = {
    leader: 'SOR_001',
    base: 'SOR_229',
};

/** Returns a player state object with the required fields plus any overrides. */
function playerWith(overrides: Record<string, unknown> = {}): Record<string, unknown> {
    return { ...MINIMAL_PLAYER, ...overrides };
}

/** A structurally-valid game state with no optional fields set. */
function minimalState(overrides: Record<string, unknown> = {}): unknown {
    return {
        player1: MINIMAL_PLAYER,
        player2: MINIMAL_PLAYER,
        ...overrides,
    };
}

function errorPaths(errors: IGameStateValidationError[]): string[] {
    return errors.map((e) => e.path);
}

function errorMessages(errors: IGameStateValidationError[]): string[] {
    return errors.map((e) => e.message);
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('GameStateFormatValidator', function () {
    // ── Smoke test ────────────────────────────────────────────────────────────

    describe('smoke', function () {
        it('accepts a minimal valid state', function () {
            expect(validateGameState(minimalState())).toEqual([]);
        });

        it('accepts a fully-populated state', function () {
            const errors = validateGameState({
                phase: 'action',
                player1: {
                    leader: { card: 'SOR_001', deployed: true, damage: 3, exhausted: true, upgrades: ['shield'] },
                    base: { card: 'SOR_229', damage: 10 },
                    groundArena: [
                        {
                            card: 'SOR_010',
                            damage: 2,
                            exhausted: true,
                            upgrades: [{ card: 'SOR_050', owner: 2, controller: 1 }],
                            capturedUnits: [{ card: 'SOR_020', owner: 2 }],
                        },
                    ],
                    spaceArena: [{ card: 'JTL_042b', owner: 2 }],
                    hand: ['SOR_011', 'SOR_012'],
                    deck: ['SOR_013', 'SOR_014'],
                    discard: ['SOR_015'],
                    resources: [{ card: 'SOR_016', exhausted: true }, 'SOR_017'],
                    hasInitiative: true,
                    hasForceToken: true,
                    credits: 2,
                },
                player2: {
                    leader: 'SOR_002',
                    base: 'SOR_230',
                    resources: [],
                },
            });
            expect(errors).toEqual([]);
        });
    });

    // ── Card identifiers ──────────────────────────────────────────────────────
    //
    // The regex and token list could have typos — a few acceptance/rejection
    // cases are worth keeping to catch those.

    describe('card identifiers', function () {
        function stateWithHandCard(cardId: unknown): unknown {
            return { player1: playerWith({ hand: [cardId] }), player2: MINIMAL_PLAYER };
        }

        it('accepts valid set-code strings', function () {
            expect(validateGameState(stateWithHandCard('SOR_001'))).toEqual([]);
            expect(validateGameState(stateWithHandCard('JTL_042b'))).toEqual([]);
            expect(validateGameState(stateWithHandCard('TS26_010'))).toEqual([]);
        });

        it('accepts all known token names', function () {
            const tokens = [
                'shield', 'experience', 'advantage',
                'clone-trooper', 'battle-droid', 'tie-fighter',
                'xwing', 'mandalorian', 'spy',
                'the-force', 'credit',
            ];
            for (const token of tokens) {
                expect(validateGameState(stateWithHandCard(token))).toEqual([], `"${token}" should be a valid card id`);
            }
        });

        it('rejects a lowercase set abbreviation', function () {
            expect(validateGameState(stateWithHandCard('sor_001')).length).toBeGreaterThan(0);
        });

        it('rejects an unknown slug that is not a token name', function () {
            expect(validateGameState(stateWithHandCard('battlefield-marine')).length).toBeGreaterThan(0);
        });
    });

    // ── Cross-field constraints ───────────────────────────────────────────────

    describe('cross-field constraints', function () {
        it('rejects both players having hasInitiative: true', function () {
            const errors = validateGameState(minimalState({
                player1: playerWith({ hasInitiative: true }),
                player2: playerWith({ hasInitiative: true }),
            }));
            expect(errors.length).toBeGreaterThan(0);
            expect(errorMessages(errors).some((m) => m.toLowerCase().includes('initiative'))).toBeTrue();
        });

        it('accepts one player having hasInitiative: true', function () {
            expect(validateGameState(minimalState({
                player1: playerWith({ hasInitiative: true }),
                player2: MINIMAL_PLAYER,
            }))).toEqual([]);
        });

        it('rejects a leader with damage > 0 when deployed: false', function () {
            const errors = validateGameState({
                player1: playerWith({ leader: { card: 'SOR_001', deployed: false, damage: 2 } }),
                player2: MINIMAL_PLAYER,
            });
            expect(errors.length).toBeGreaterThan(0);
            expect(errorMessages(errors).some((m) => m.toLowerCase().includes('damage'))).toBeTrue();
        });

        it('rejects a leader with upgrades when deployed: false', function () {
            const errors = validateGameState({
                player1: playerWith({ leader: { card: 'SOR_001', deployed: false, upgrades: ['shield'] } }),
                player2: MINIMAL_PLAYER,
            });
            expect(errors.length).toBeGreaterThan(0);
            expect(errorMessages(errors).some((m) => m.toLowerCase().includes('upgrade'))).toBeTrue();
        });

        it('accepts a leader with damage: 0 when deployed: false', function () {
            expect(validateGameState({
                player1: playerWith({ leader: { card: 'SOR_001', deployed: false, damage: 0 } }),
                player2: MINIMAL_PLAYER,
            })).toEqual([]);
        });
    });

    // ── Error path formatting ─────────────────────────────────────────────────
    //
    // formatZodPath is custom logic — verify it produces readable dot/bracket paths.

    describe('error path formatting', function () {
        it('formats a path into a hand array element', function () {
            const errors = validateGameState({
                player1: playerWith({ hand: ['SOR_001', 'bad-id'] }),
                player2: MINIMAL_PLAYER,
            });
            expect(errorPaths(errors)).toContain('player1.hand[1]');
        });

        it('formats a nested path into a groundArena card', function () {
            const errors = validateGameState({
                player1: playerWith({ groundArena: [{ card: 'bad-id' }] }),
                player2: MINIMAL_PLAYER,
            });
            expect(errorPaths(errors).some((p) => p.startsWith('player1.groundArena[0]'))).toBeTrue();
        });

        it('formats a path for a superRefine constraint violation', function () {
            const errors = validateGameState({
                player1: playerWith({ leader: { card: 'SOR_001', deployed: false, damage: 5 } }),
                player2: MINIMAL_PLAYER,
            });
            expect(errorPaths(errors).some((p) => p.includes('leader'))).toBeTrue();
        });
    });

    // ── parseGameState ────────────────────────────────────────────────────────

    describe('parseGameState', function () {
        it('returns the typed game state on success', function () {
            const result = parseGameState(minimalState({ phase: 'action' }));
            expect(result).not.toBeNull();
            if (result !== null) {
                expect(result.phase).toBe('action');
                expect(result.player1).toEqual(MINIMAL_PLAYER);
            }
        });

        it('returns null on failure', function () {
            expect(parseGameState({ player1: playerWith({ hand: ['bad-id'] }), player2: MINIMAL_PLAYER })).toBeNull();
        });

        it('calls onError with the full error list on failure', function () {
            let capturedErrors: IGameStateValidationError[] = [];
            parseGameState(
                { player1: playerWith({ hand: ['bad-id'] }), player2: MINIMAL_PLAYER },
                (errors) => {
                    capturedErrors = errors;
                }
            );
            expect(capturedErrors.length).toBeGreaterThan(0);
        });

        it('does not call onError when the input is valid', function () {
            let callCount = 0;
            parseGameState(minimalState(), () => {
                callCount++;
            });
            expect(callCount).toBe(0);
        });
    });

    // ── round and actionNumber ────────────────────────────────────────────────
    //
    // Only structural acceptance is tested here — the numeric constraints
    // (int, positive) are standard Zod primitives and not re-tested.

    describe('round and actionNumber', function () {
        it('accepts a state with both round and actionNumber', function () {
            expect(validateGameState(minimalState({ round: 3, actionNumber: 7 }))).toEqual([]);
        });

        it('accepts a state with only round (actionNumber is optional)', function () {
            expect(validateGameState(minimalState({ round: 1 }))).toEqual([]);
        });
    });
});

// ── validateGameHistory / parseGameHistory ────────────────────────────────────

// ── Helpers ───────────────────────────────────────────────────────────────────

const MINIMAL_STATE = { player1: MINIMAL_PLAYER, player2: MINIMAL_PLAYER };

/** A minimal valid history entry with no action (e.g. the initial-state entry). */
function historyEntry(overrides: Record<string, unknown> = {}): Record<string, unknown> {
    return { seq: 1, round: 1, state: MINIMAL_STATE, ...overrides };
}

/** A minimal valid history object. */
function minimalHistory(overrides: Record<string, unknown> = {}): unknown {
    return { entries: [], ...overrides };
}

/** A valid player-initiated action summary. */
function playerAction(type: string, overrides: Record<string, unknown> = {}): Record<string, unknown> {
    return { type, actingPlayer: 1, ...overrides };
}

describe('validateGameHistory', function () {
    // ── Smoke ─────────────────────────────────────────────────────────────────

    describe('smoke', function () {
        it('accepts an empty entries list', function () {
            expect(validateGameHistory(minimalHistory())).toEqual([]);
        });

        it('accepts a history with a no-action initial entry', function () {
            expect(validateGameHistory(minimalHistory({ entries: [historyEntry()] }))).toEqual([]);
        });

        it('accepts a fully-populated history', function () {
            const errors = validateGameHistory({
                entries: [
                    historyEntry({ seq: 1, round: 1 }),
                    historyEntry({ seq: 2, round: 1, action: playerAction('playCard', { sourceCard: 'SOR_010' }) }),
                    historyEntry({ seq: 3, round: 1, action: playerAction('attack', { sourceCard: 'SOR_010', targetCard: 'SOR_229' }) }),
                    historyEntry({ seq: 4, round: 1, action: { type: 'phaseStart' } }),
                ],
                result: { winner: 1, reason: 'baseDestroyed' },
            });
            expect(errors).toEqual([]);
        });
    });

    // ── Action types ──────────────────────────────────────────────────────────
    //
    // One acceptance test per ActionType value confirms the complete enum.
    // The phaseStart ↔ actingPlayer constraint is the custom cross-field rule.

    describe('action types', function () {
        const PLAYER_TYPES = [
            'playCard', 'attack', 'useAbility', 'pass', 'claimInitiative',
            'resource', 'mulligan', 'keepHand', 'concede',
        ] as const;

        for (const type of PLAYER_TYPES) {
            it(`accepts player action type "${type}" with actingPlayer`, function () {
                const entry = historyEntry({ action: playerAction(type) });
                expect(validateGameHistory(minimalHistory({ entries: [entry] }))).toEqual([]);
            });
        }

        it('accepts phaseStart without actingPlayer', function () {
            const entry = historyEntry({ action: { type: 'phaseStart' } });
            expect(validateGameHistory(minimalHistory({ entries: [entry] }))).toEqual([]);
        });

        it('rejects phaseStart with actingPlayer', function () {
            const entry = historyEntry({ action: { type: 'phaseStart', actingPlayer: 1 } });
            const errors = validateGameHistory(minimalHistory({ entries: [entry] }));
            expect(errors.length).toBeGreaterThan(0);
            expect(errors.some((e) => e.path.includes('actingPlayer'))).toBe(true);
        });

        it('rejects a player-initiated action without actingPlayer', function () {
            const entry = historyEntry({ action: { type: 'playCard', sourceCard: 'SOR_010' } });
            const errors = validateGameHistory(minimalHistory({ entries: [entry] }));
            expect(errors.length).toBeGreaterThan(0);
            expect(errors.some((e) => e.path.includes('actingPlayer'))).toBe(true);
        });

        it('accepts resource with no sourceCard (player declined to resource)', function () {
            const entry = historyEntry({ action: playerAction('resource') });
            expect(validateGameHistory(minimalHistory({ entries: [entry] }))).toEqual([]);
        });
    });

    // ── Error path formatting ─────────────────────────────────────────────────

    it('reports an error path that traverses into the entries array', function () {
        const errors = validateGameHistory(minimalHistory({ entries: [historyEntry({ seq: 0 })] }));
        expect(errors.some((e) => e.path.startsWith('entries[0]'))).toBe(true);
    });

    // ── result ────────────────────────────────────────────────────────────────

    it('accepts a valid result', function () {
        expect(validateGameHistory(minimalHistory({ result: { winner: 1, reason: 'baseDestroyed' } }))).toEqual([]);
    });
});

// ── parseGameHistory ──────────────────────────────────────────────────────────

describe('parseGameHistory', function () {
    it('returns the typed history on success', function () {
        const result = parseGameHistory(minimalHistory({ entries: [historyEntry()] }));
        expect(result).not.toBeNull();
        expect(result?.entries.length).toBe(1);
    });

    it('returns null on failure', function () {
        expect(parseGameHistory({ entries: [historyEntry({ seq: 0 })] })).toBeNull();
    });

    it('calls onError with the full error list on failure', function () {
        let capturedErrors: IGameStateValidationError[] = [];
        parseGameHistory(
            { entries: [historyEntry({ seq: -1 })] },
            (errors) => {
                capturedErrors = errors;
            }
        );
        expect(capturedErrors.length).toBeGreaterThan(0);
    });

    it('does not call onError when the input is valid', function () {
        let callCount = 0;
        parseGameHistory(minimalHistory(), () => {
            callCount++;
        });
        expect(callCount).toBe(0);
    });
});
