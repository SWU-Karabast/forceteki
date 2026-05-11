import { Aspect } from '../../../server/game/core/Constants';
import type { ISwuDbFormatDecklist } from '../../../server/utils/deck/DeckInterfaces';
import type { User } from '../../../server/utils/user/User';
import type { IMatchmakingPlayerEntry, MatchPreferences, OpponentArchetype } from '../../../server/gamenode/MatchmakingRules';
import { MatchmakingRule } from '../../../server/gamenode/MatchmakingRules';
import type { QueuedPlayer } from '../../../server/gamenode/QueueHandler';
import { QueuedPlayerState } from '../../../server/gamenode/QueueHandler';

function mockUser(userId: string): User {
    const partial = { getId: () => userId };
    return partial as unknown as User;
}

function mockDeck(leaderId: string, baseId: string): ISwuDbFormatDecklist {
    return {
        metadata: { name: 'test', author: 'test' },
        leader: { id: leaderId, count: 1 },
        base: { id: baseId, count: 1 },
    };
}

interface PlayerOverrides {
    matchPreferences?: MatchPreferences;
    baseAspects?: readonly string[];
}

function buildPlayer(userId: string, leaderId: string, baseId: string, overrides: PlayerOverrides = {}): QueuedPlayer {
    return {
        user: mockUser(userId),
        deck: mockDeck(leaderId, baseId),
        state: QueuedPlayerState.Connected,
        matchPreferences: overrides.matchPreferences,
        baseAspects: overrides.baseAspects,
    };
}

function buildPlayerWithoutLeaderOrBase(userId: string): QueuedPlayer {
    const deck: ISwuDbFormatDecklist = { metadata: { name: 'test', author: 'test' } };
    return {
        user: mockUser(userId),
        deck,
        state: QueuedPlayerState.Connected,
    };
}

function entry(player: QueuedPlayer): IMatchmakingPlayerEntry {
    return { player, baseAspects: player.baseAspects };
}

describe('MatchmakingRule.leaderArchetypeFilter', function() {
    const rule = MatchmakingRule.leaderArchetypeFilter();

    describe('when neither player has matchPreferences', function() {
        it('matches any opponent (preserves default behavior)', function() {
            const p1 = buildPlayer('u1', 'SOR_001', 'SOR_022', { baseAspects: ['command'] });
            const p2 = buildPlayer('u2', 'SOR_002', 'SOR_023', { baseAspects: ['vigilance'] });
            expect(rule.canMatch(entry(p1), entry(p2))).toBeTrue();
        });
    });

    describe('when prefs are disabled or empty', function() {
        it('matches anyone when enabled=false', function() {
            const prefs: MatchPreferences = { enabled: false, allowedArchetypes: [{ leaderId: 'OTHER' }] };
            const p1 = buildPlayer('u1', 'SOR_001', 'SOR_022', { matchPreferences: prefs, baseAspects: ['command'] });
            const p2 = buildPlayer('u2', 'SOR_002', 'SOR_023', { baseAspects: ['vigilance'] });
            expect(rule.canMatch(entry(p1), entry(p2))).toBeTrue();
        });

        it('matches anyone when allowedArchetypes is empty', function() {
            const prefs: MatchPreferences = { enabled: true, allowedArchetypes: [] };
            const p1 = buildPlayer('u1', 'SOR_001', 'SOR_022', { matchPreferences: prefs, baseAspects: ['command'] });
            const p2 = buildPlayer('u2', 'SOR_002', 'SOR_023', { baseAspects: ['vigilance'] });
            expect(rule.canMatch(entry(p1), entry(p2))).toBeTrue();
        });
    });

    describe('with leader-only archetype', function() {
        it('rejects when opponent leader is not in allowlist', function() {
            const archetype: OpponentArchetype = { leaderId: 'SOR_005' };
            const prefs: MatchPreferences = { enabled: true, allowedArchetypes: [archetype] };
            const p1 = buildPlayer('u1', 'SOR_001', 'SOR_022', { matchPreferences: prefs, baseAspects: ['command'] });
            const p2 = buildPlayer('u2', 'SOR_999', 'SOR_023', { baseAspects: ['vigilance'] });
            expect(rule.canMatch(entry(p1), entry(p2))).toBeFalse();
        });

        it('matches when opponent leader is in allowlist (and opponent has no filter)', function() {
            const archetype: OpponentArchetype = { leaderId: 'SOR_005' };
            const prefs: MatchPreferences = { enabled: true, allowedArchetypes: [archetype] };
            const p1 = buildPlayer('u1', 'SOR_001', 'SOR_022', { matchPreferences: prefs, baseAspects: ['command'] });
            const p2 = buildPlayer('u2', 'SOR_005', 'LOF_023', { baseAspects: ['command'] });
            expect(rule.canMatch(entry(p1), entry(p2))).toBeTrue();
        });

        it('matches against any base when no baseConstraint is set', function() {
            const archetype: OpponentArchetype = { leaderId: 'SOR_005' };
            const prefs: MatchPreferences = { enabled: true, allowedArchetypes: [archetype] };
            const p1 = buildPlayer('u1', 'SOR_001', 'SOR_022', { matchPreferences: prefs, baseAspects: ['command'] });
            const p2 = buildPlayer('u2', 'SOR_005', 'SOR_999', { baseAspects: ['villainy'] });
            expect(rule.canMatch(entry(p1), entry(p2))).toBeTrue();
        });
    });

    describe('with leader + aspect base constraint', function() {
        const archetype: OpponentArchetype = {
            leaderId: 'SOR_005',
            baseConstraint: { kind: 'aspect', aspect: Aspect.Vigilance },
        };
        const prefs: MatchPreferences = { enabled: true, allowedArchetypes: [archetype] };

        it('matches when opponent\'s base aspect satisfies the constraint', function() {
            const p1 = buildPlayer('u1', 'SOR_001', 'SOR_022', { matchPreferences: prefs, baseAspects: ['command'] });
            const p2 = buildPlayer('u2', 'SOR_005', 'JTL_023', { baseAspects: ['vigilance'] });
            expect(rule.canMatch(entry(p1), entry(p2))).toBeTrue();
        });

        it('rejects when opponent\'s base aspect doesn\'t match', function() {
            const p1 = buildPlayer('u1', 'SOR_001', 'SOR_022', { matchPreferences: prefs, baseAspects: ['command'] });
            const p2 = buildPlayer('u2', 'SOR_005', 'LOF_022', { baseAspects: ['cunning'] });
            expect(rule.canMatch(entry(p1), entry(p2))).toBeFalse();
        });

        it('rejects when opponent base aspects are unknown', function() {
            const p1 = buildPlayer('u1', 'SOR_001', 'SOR_022', { matchPreferences: prefs, baseAspects: ['command'] });
            const p2 = buildPlayer('u2', 'SOR_005', 'SOR_999', { baseAspects: undefined });
            expect(rule.canMatch(entry(p1), entry(p2))).toBeFalse();
        });
    });

    describe('with leader + baseType (single-id) constraint', function() {
        const archetype: OpponentArchetype = {
            leaderId: 'JTL_005',
            baseConstraint: { kind: 'baseType', baseIds: ['JTL_023'] },
        };
        const prefs: MatchPreferences = { enabled: true, allowedArchetypes: [archetype] };

        it('matches when opponent baseId is in the single-id set', function() {
            const p1 = buildPlayer('u1', 'SOR_001', 'SOR_022', { matchPreferences: prefs, baseAspects: ['command'] });
            const p2 = buildPlayer('u2', 'JTL_005', 'JTL_023', { baseAspects: ['vigilance'] });
            expect(rule.canMatch(entry(p1), entry(p2))).toBeTrue();
        });

        it('rejects when opponent baseId is not in the single-id set', function() {
            const p1 = buildPlayer('u1', 'SOR_001', 'SOR_022', { matchPreferences: prefs, baseAspects: ['command'] });
            const p2 = buildPlayer('u2', 'JTL_005', 'LOF_999', { baseAspects: ['vigilance'] });
            expect(rule.canMatch(entry(p1), entry(p2))).toBeFalse();
        });
    });

    describe('with leader + baseType (multi-id) constraint', function() {
        const archetype: OpponentArchetype = {
            leaderId: 'JTL_005',
            baseConstraint: {
                kind: 'baseType',
                baseIds: ['LOF_023', 'LOF_026', 'LOF_027'],
            },
        };
        const prefs: MatchPreferences = { enabled: true, allowedArchetypes: [archetype] };

        it('matches when opponent baseId is any member of the type', function() {
            const p1 = buildPlayer('u1', 'SOR_001', 'SOR_022', { matchPreferences: prefs, baseAspects: ['command'] });
            const p2 = buildPlayer('u2', 'JTL_005', 'LOF_026', { baseAspects: ['aggression'] });
            expect(rule.canMatch(entry(p1), entry(p2))).toBeTrue();
        });

        it('rejects when opponent baseId is not in the type', function() {
            const p1 = buildPlayer('u1', 'SOR_001', 'SOR_022', { matchPreferences: prefs, baseAspects: ['command'] });
            const p2 = buildPlayer('u2', 'JTL_005', 'LAW_026', { baseAspects: ['aggression'] });
            expect(rule.canMatch(entry(p1), entry(p2))).toBeFalse();
        });
    });

    describe('with multiple allowed archetypes', function() {
        it('matches if any one archetype accepts the opponent', function() {
            const prefs: MatchPreferences = {
                enabled: true,
                allowedArchetypes: [
                    { leaderId: 'SOR_005' },
                    { leaderId: 'JTL_005', baseConstraint: { kind: 'aspect', aspect: Aspect.Vigilance } },
                ],
            };
            const p1 = buildPlayer('u1', 'SOR_001', 'SOR_022', { matchPreferences: prefs, baseAspects: ['command'] });

            // matches second archetype: leader=JTL_005 + base aspect=vigilance
            const p2 = buildPlayer('u2', 'JTL_005', 'JTL_023', { baseAspects: ['vigilance'] });
            expect(rule.canMatch(entry(p1), entry(p2))).toBeTrue();
        });

        it('rejects when no archetype accepts the opponent', function() {
            const prefs: MatchPreferences = {
                enabled: true,
                allowedArchetypes: [
                    { leaderId: 'SOR_005' },
                    { leaderId: 'JTL_005', baseConstraint: { kind: 'aspect', aspect: Aspect.Vigilance } },
                ],
            };
            const p1 = buildPlayer('u1', 'SOR_001', 'SOR_022', { matchPreferences: prefs, baseAspects: ['command'] });

            // leader=JTL_005 but base aspect=cunning, and not in any archetype
            const p2 = buildPlayer('u2', 'JTL_005', 'LOF_022', { baseAspects: ['cunning'] });
            expect(rule.canMatch(entry(p1), entry(p2))).toBeFalse();
        });
    });

    describe('with mutual filters (both players opt in)', function() {
        it('matches only when both filters accept the other', function() {
            const p1Prefs: MatchPreferences = {
                enabled: true,
                allowedArchetypes: [{ leaderId: 'JTL_005' }],
            };
            const p2Prefs: MatchPreferences = {
                enabled: true,
                allowedArchetypes: [{ leaderId: 'SOR_001' }],
            };
            const p1 = buildPlayer('u1', 'SOR_001', 'SOR_022', { matchPreferences: p1Prefs, baseAspects: ['command'] });
            const p2 = buildPlayer('u2', 'JTL_005', 'JTL_023', { matchPreferences: p2Prefs, baseAspects: ['vigilance'] });
            expect(rule.canMatch(entry(p1), entry(p2))).toBeTrue();
        });

        it('rejects asymmetric: p1 accepts p2 but p2 rejects p1', function() {
            const p1Prefs: MatchPreferences = {
                enabled: true,
                allowedArchetypes: [{ leaderId: 'JTL_005' }],
            };
            const p2Prefs: MatchPreferences = {
                enabled: true,
                allowedArchetypes: [{ leaderId: 'SOMEONE_ELSE' }],
            };
            const p1 = buildPlayer('u1', 'SOR_001', 'SOR_022', { matchPreferences: p1Prefs, baseAspects: ['command'] });
            const p2 = buildPlayer('u2', 'JTL_005', 'JTL_023', { matchPreferences: p2Prefs, baseAspects: ['vigilance'] });
            expect(rule.canMatch(entry(p1), entry(p2))).toBeFalse();
        });

        it('rejects when both filters reject the other', function() {
            const p1Prefs: MatchPreferences = {
                enabled: true,
                allowedArchetypes: [{ leaderId: 'NOT_P2' }],
            };
            const p2Prefs: MatchPreferences = {
                enabled: true,
                allowedArchetypes: [{ leaderId: 'NOT_P1' }],
            };
            const p1 = buildPlayer('u1', 'SOR_001', 'SOR_022', { matchPreferences: p1Prefs, baseAspects: ['command'] });
            const p2 = buildPlayer('u2', 'JTL_005', 'JTL_023', { matchPreferences: p2Prefs, baseAspects: ['vigilance'] });
            expect(rule.canMatch(entry(p1), entry(p2))).toBeFalse();
        });
    });

    describe('per-archetype enabled flag', function() {
        it('skips archetypes whose enabled is explicitly false', function() {
            const prefs: MatchPreferences = {
                enabled: true,
                allowedArchetypes: [
                    { leaderId: 'SEC_010', enabled: false },
                    { leaderId: 'JTL_005', enabled: true },
                ],
            };
            const p1 = buildPlayer('u1', 'SOR_001', 'SOR_022', { matchPreferences: prefs, baseAspects: ['command'] });
            // SEC_010 archetype is disabled, so this opponent should not match
            const p2 = buildPlayer('u2', 'SEC_010', 'JTL_021', { baseAspects: ['vigilance'] });
            expect(rule.canMatch(entry(p1), entry(p2))).toBeFalse();
        });

        it('matches when only enabled archetypes accept the opponent', function() {
            const prefs: MatchPreferences = {
                enabled: true,
                allowedArchetypes: [
                    { leaderId: 'SEC_010', enabled: false },
                    { leaderId: 'JTL_005' },
                ],
            };
            const p1 = buildPlayer('u1', 'SOR_001', 'SOR_022', { matchPreferences: prefs, baseAspects: ['command'] });
            const p2 = buildPlayer('u2', 'JTL_005', 'JTL_021', { baseAspects: ['vigilance'] });
            expect(rule.canMatch(entry(p1), entry(p2))).toBeTrue();
        });

        it('matches anyone when every archetype is disabled (empty active set)', function() {
            const prefs: MatchPreferences = {
                enabled: true,
                allowedArchetypes: [
                    { leaderId: 'SEC_010', enabled: false },
                    { leaderId: 'JTL_005', enabled: false },
                ],
            };
            const p1 = buildPlayer('u1', 'SOR_001', 'SOR_022', { matchPreferences: prefs, baseAspects: ['command'] });
            // Empty active set is treated as "match anyone" — matches the
            // top-level disabled / empty-allowedArchetypes behavior.
            const p2 = buildPlayer('u2', 'XYZ_999', 'JTL_021', { baseAspects: ['vigilance'] });
            expect(rule.canMatch(entry(p1), entry(p2))).toBeTrue();
        });
    });

    describe('edge cases', function() {
        it('treats opponent with missing leader id as not matching any archetype', function() {
            const prefs: MatchPreferences = {
                enabled: true,
                allowedArchetypes: [{ leaderId: 'SOR_005' }],
            };
            const p1 = buildPlayer('u1', 'SOR_001', 'SOR_022', { matchPreferences: prefs, baseAspects: ['command'] });
            const p2 = buildPlayerWithoutLeaderOrBase('u2');
            expect(rule.canMatch(entry(p1), entry(p2))).toBeFalse();
        });
    });
});
