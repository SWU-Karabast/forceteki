import { AnimationRecorder } from '../../../../server/game/core/animation/AnimationRecorder';
import { AnimationKind } from '../../../../server/game/core/animation/AnimationTypes';
import type { IAnimationDescriptor } from '../../../../server/game/core/animation/AnimationTypes';
import { EventName } from '../../../../server/game/core/Constants';

describe('Animation events', function() {
    integration(function (contextRef) {
        beforeEach(function () {
            return contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['wampa'],           // 4 power, 5 hp
                },
                player2: {
                    groundArena: ['battlefield-marine'], // 3 power, 3 hp
                }
            });
        });

        describe('damage records', function() {
            it('describes combat damage in both directions, with the attacker as the source', function () {
                const { context } = contextRef;
                const before = context.getAnimationRecords().length;

                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.battlefieldMarine);

                const damage = context.getAnimationRecords(before)
                    .filter((record) => record.kind === AnimationKind.Damage);

                const toMarine = damage.find((record) => record.target === context.battlefieldMarine.uuid);
                expect(toMarine).toBeDefined();
                // 4 power against 3 hp: the record reports the 3 that landed, not the 4 requested.
                expect(toMarine.amount).toBe(3);
                expect(toMarine.source).toBe(context.wampa.uuid);
                expect(toMarine.damageType).toBe('combat');
                expect(toMarine.isLethal).toBeTrue();

                const toWampa = damage.find((record) => record.target === context.wampa.uuid);
                expect(toWampa).toBeDefined();
                expect(toWampa.amount).toBe(3);
                expect(toWampa.source).toBe(context.battlefieldMarine.uuid);
                expect(toWampa.remainingHp).toBe(2);
                expect(toWampa.isLethal).toBeFalse();
            });

            it('reports the damage actually applied, not the amount requested', function () {
                const { context } = contextRef;
                const before = context.getAnimationRecords().length;

                // The marine has 3 hp and takes 4 power of combat damage; only 3 can land.
                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.battlefieldMarine);

                const toMarine = context.getAnimationRecords(before)
                    .find((record) => record.kind === AnimationKind.Damage && record.target === context.battlefieldMarine.uuid);

                expect(toMarine.remainingHp).toBe(0);
            });

            it('groups everything an attack resolves into one batch without merging the records', function () {
                const { context } = contextRef;
                const before = context.getAnimationRecords().length;

                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.battlefieldMarine);

                const damage = context.getAnimationRecords(before)
                    .filter((record) => record.kind === AnimationKind.Damage);

                // Wampa has Overwhelm, so the attack yields three separate records: the hit on the
                // marine, the marine's return hit, and the excess rolling onto the base. The server
                // neither sums nor dedupes them, and all three share one batch.
                expect(damage.length).toBe(3);
                expect(new Set(damage.map((record) => record.batch)).size).toBe(1);
            });

            it('attributes overwhelm damage on the base to the attacker', function () {
                const { context } = contextRef;
                const before = context.getAnimationRecords().length;

                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.battlefieldMarine);

                const overwhelm = context.getAnimationRecords(before)
                    .find((record) => record.kind === AnimationKind.Damage && record.damageType === 'overwhelm');

                expect(overwhelm).toBeDefined();
                expect(overwhelm.target).toBe(context.p2Base.uuid);
                expect(overwhelm.amount).toBe(1);
                expect(overwhelm.source).toBe(context.wampa.uuid);
            });
        });

        describe('defeat records', function() {
            it('names the defeated card, why it died and who killed it', function () {
                const { context } = contextRef;
                const before = context.getAnimationRecords().length;

                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.battlefieldMarine);

                const defeats = context.getAnimationRecords(before)
                    .filter((record) => record.kind === AnimationKind.Defeat);

                expect(defeats.length).toBe(1);
                expect(defeats[0].card).toBe(context.battlefieldMarine.uuid);
                expect(defeats[0].defeatedBy).toBe(context.wampa.uuid);
                expect(defeats[0].arena).toBe('groundArena');
                expect(defeats[0].controller).toBe(context.player2.id);
            });

            it('links a damage-driven defeat back to the damage via parentBatch', function () {
                const { context } = contextRef;
                const before = context.getAnimationRecords().length;

                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.battlefieldMarine);

                const records = context.getAnimationRecords(before);
                const lethalDamage = records.find((record) =>
                    record.kind === AnimationKind.Damage && record.target === context.battlefieldMarine.uuid);
                const defeat = records.find((record) => record.kind === AnimationKind.Defeat);

                // The defeat resolves in a subwindow, so it is deliberately a different batch.
                // parentBatch is what lets the client tie the two together.
                expect(defeat.batch).not.toBe(lethalDamage.batch);
                expect(defeat.parentBatch).toBe(lethalDamage.batch);
            });
        });

        describe('serialization', function() {
            it('delivers the same records to both players', function () {
                const { context } = contextRef;

                // In production every participant is served state at game start, which seats their
                // cursor at zero before anything has happened. Tests never serialize, so do it here.
                context.game.getState(context.player1.id);
                context.game.getState(context.player2.id);

                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.battlefieldMarine);

                const p1 = context.game.getState(context.player1.id) as any;
                const p2 = context.game.getState(context.player2.id) as any;

                expect(p1.newAnimations.length).toBeGreaterThan(0);
                expect(p2.newAnimations).toEqual(p1.newAnimations);
            });

            it('does not redeliver records once a participant has read them', function () {
                const { context } = contextRef;

                context.game.getState(context.player1.id);

                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.battlefieldMarine);

                const first = context.game.getState(context.player1.id) as any;
                const second = context.game.getState(context.player1.id) as any;

                expect(first.newAnimations.length).toBeGreaterThan(0);
                expect(second.newAnimations).toEqual([]);
                expect(second.animationOffset).toBe(first.totalAnimations);
            });

            it('starts a newly seen participant at the head instead of replaying the backlog', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.battlefieldMarine);

                // A spectator who joins mid-game wants the chat backlog but not every animation
                // the game has produced so far.
                //
                // The id must be unique per invocation: under ENABLE_UNDO_ALL_TESTS the body runs
                // twice, and a reused id is a KNOWN participant on the second pass, which correctly
                // receives everything since its cursor.
                const joiner = context.game.getState(`spectator-${Date.now()}-${Math.random()}`) as any;

                expect(joiner.newAnimations).toEqual([]);
                expect(joiner.totalAnimations).toBeGreaterThan(0);
                expect(joiner.animationsTruncated).toBeFalse();
            });
        });

        describe('rollback', function() {
            it('drops pending records and bumps the epoch', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.getAnimationRecords().length).toBeGreaterThan(0);

                context.game.getState(context.player1.id);
                const epochBefore = context.game.animations.epoch;
                context.game.animations.resetForRollback();

                expect(context.game.animations.records.length).toBe(0);
                expect(context.game.animations.epoch).toBe(epochBefore + 1);

                // Anyone reading after the reset sees the new epoch and nothing to play.
                const state = context.game.getState(context.player1.id) as any;
                expect(state.newAnimations).toEqual([]);
                expect(state.animationEpoch).toBe(epochBefore + 1);
            });
        });

        describe('error isolation', function() {
            it('does not let a throwing descriptor break the game action', function () {
                const { context } = contextRef;

                const exploding: IAnimationDescriptor = {
                    name: 'exploding-test-descriptor',
                    kinds: [AnimationKind.Damage],
                    when: { [EventName.OnDamageDealt]: () => {
                        throw new Error('descriptor blew up');
                    } },
                    build: () => null,
                    redact: (record) => record,
                };

                // Registers against the live game alongside the real recorder.
                // eslint-disable-next-line no-new
                new AnimationRecorder(context.game, [exploding]);

                expect(() => {
                    context.player1.clickCard(context.wampa);
                    context.player1.clickCard(context.battlefieldMarine);
                }).not.toThrow();

                // The real recorder still produced its records.
                expect(context.getAnimationRecords().some((record) => record.kind === AnimationKind.Damage)).toBeTrue();
                expect(context.battlefieldMarine.zoneName).toBe('discard');
            });
        });
    });
});
