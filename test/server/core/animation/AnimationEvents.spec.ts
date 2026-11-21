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

                const toMarine = damage.find((record) => record.cardId === context.battlefieldMarine.uuid);
                expect(toMarine).toBeDefined();
                // 4 power against 3 hp: 3 lands.
                expect(toMarine.amount).toBe(3);
                expect(toMarine.sourceCardIds).toEqual([context.wampa.uuid]);

                const toWampa = damage.find((record) => record.cardId === context.wampa.uuid);
                expect(toWampa).toBeDefined();
                expect(toWampa.amount).toBe(3);
                expect(toWampa.sourceCardIds).toEqual([context.battlefieldMarine.uuid]);
            });

            it('reports the damage actually applied, not the amount requested', function () {
                const { context } = contextRef;
                const before = context.getAnimationRecords().length;

                // 4 power against 3 hp: 3 lands.
                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.battlefieldMarine);

                const toMarine = context.getAnimationRecords(before)
                    .find((record) => record.kind === AnimationKind.Damage && record.cardId === context.battlefieldMarine.uuid);

                expect(toMarine.amount).toBe(3);
            });

            it('groups everything an attack resolves into one batch without merging the records', function () {
                const { context } = contextRef;
                const before = context.getAnimationRecords().length;

                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.battlefieldMarine);

                const damage = context.getAnimationRecords(before)
                    .filter((record) => record.kind === AnimationKind.Damage);

                // Wampa -> marine, marine -> Wampa, and Overwhelm onto the base.
                expect(damage.length).toBe(3);
                expect(new Set(damage.map((record) => record.batch)).size).toBe(1);
            });

            it('attributes overwhelm damage on the base to the attacker', function () {
                const { context } = contextRef;
                const before = context.getAnimationRecords().length;

                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.battlefieldMarine);

                const overwhelm = context.getAnimationRecords(before)
                    .find((record) => record.kind === AnimationKind.Damage && record.cardId === context.p2Base.uuid);

                expect(overwhelm).toBeDefined();
                expect(overwhelm.cardId).toBe(context.p2Base.uuid);
                expect(overwhelm.amount).toBe(1);
                expect(overwhelm.sourceCardIds).toEqual([context.wampa.uuid]);
            });
        });

        describe('defeat records', function() {
            it('names the defeated card', function () {
                const { context } = contextRef;
                const before = context.getAnimationRecords().length;

                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.battlefieldMarine);

                const defeats = context.getAnimationRecords(before)
                    .filter((record) => record.kind === AnimationKind.Defeat);

                expect(defeats.length).toBe(1);
                expect(defeats[0].cardId).toBe(context.battlefieldMarine.uuid);
            });

            it('puts a damage-driven defeat in the batch right after the damage', function () {
                const { context } = contextRef;
                const before = context.getAnimationRecords().length;

                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.battlefieldMarine);

                const records = context.getAnimationRecords(before);
                const lethalDamage = records.find((record) =>
                    record.kind === AnimationKind.Damage && record.cardId === context.battlefieldMarine.uuid);
                const defeat = records.find((record) => record.kind === AnimationKind.Defeat);

                expect(defeat.batch).toBe(lethalDamage.batch + 1);

                for (let i = 1; i < records.length; i++) {
                    expect(records[i].batch).toBeGreaterThanOrEqual(records[i - 1].batch);
                }
            });
        });

        describe('serialization', function() {
            it('delivers the same records to both players', function () {
                const { context } = contextRef;

                // Read once first so each player has a cursor before the attack.
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

                // Unique per run, because undo mode runs the body twice.
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
                    summarizeFor: (record) => record,
                };

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

describe('Animation events with a multi-target attack', function() {
    integration(function (contextRef) {
        it('names every defender as a source of the combined return damage', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['darth-maul#revenge-at-last'],
                },
                player2: {
                    groundArena: ['wampa', 'battlefield-marine'],
                }
            });
            const { context } = contextRef;
            const before = context.getAnimationRecords().length;

            context.player1.clickCard(context.darthMaul);
            context.player1.clickCard(context.wampa);
            context.player1.clickCard(context.battlefieldMarine);
            context.player1.clickDone();

            const toMaul = context.getAnimationRecords(before)
                .filter((record) => record.kind === AnimationKind.Damage && record.cardId === context.darthMaul.uuid);

            // 4 + 3 = 7 combined, capped at Maul's 6 hp.
            expect(toMaul.length).toBe(1);
            expect(toMaul[0].amount).toBe(6);
            expect(toMaul[0].sourceCardIds).toEqual(jasmine.arrayWithExactContents([context.wampa.uuid, context.battlefieldMarine.uuid]));
        });
    });
});

describe('Animation event batches', function() {
    integration(function (contextRef) {
        function damageTo(records: any[], card: any) {
            return records.filter((record) => record.kind === AnimationKind.Damage && record.cardId === card.uuid);
        }

        function defeatOf(records: any[], card: any) {
            return records.find((record) => record.kind === AnimationKind.Defeat && record.cardId === card.uuid);
        }

        function expectBatchesInOrder(records: any[]) {
            for (let i = 1; i < records.length; i++) {
                expect(records[i].batch).toBeGreaterThanOrEqual(records[i - 1].batch);
            }
        }

        it('puts a shield defeat in the same batch as the rest of the attack damage', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['wampa'],
                },
                player2: {
                    groundArena: [{ card: 'battlefield-marine', upgrades: ['shield'] }],
                }
            });
            const { context } = contextRef;
            const shield = context.battlefieldMarine.upgrades[0];
            const before = context.getAnimationRecords().length;

            context.player1.clickCard(context.wampa);
            context.player1.clickCard(context.battlefieldMarine);

            const records = context.getAnimationRecords(before);
            const toWampa = damageTo(records, context.wampa);
            const shieldDefeat = defeatOf(records, shield);

            // The shield replaces the damage to the marine, so there is no record of it.
            expect(damageTo(records, context.battlefieldMarine)).toEqual([]);
            expect(toWampa.length).toBe(1);
            expect(shieldDefeat).toBeDefined();
            expect(shieldDefeat.batch).toBe(toWampa[0].batch);
            expectBatchesInOrder(records);
        });

        it('puts redirected combat damage in the same batch as the rest of the attack damage', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['maul#shadow-collective-visionary', 'mercenary-company'],
                },
                player2: {
                    groundArena: ['luminara-unduli#softspoken-master'],
                }
            });
            const { context } = contextRef;
            const before = context.getAnimationRecords().length;

            context.player1.clickCard(context.maul);
            context.player1.clickCard(context.luminaraUnduli);
            context.player1.clickCard(context.mercenaryCompany);

            const records = context.getAnimationRecords(before);
            const toLuminara = damageTo(records, context.luminaraUnduli);
            const toMercenaryCompany = damageTo(records, context.mercenaryCompany);

            // Maul's damage is replaced by damage to Mercenary Company, so there is no record of it.
            expect(damageTo(records, context.maul)).toEqual([]);
            expect(toMercenaryCompany.length).toBe(1);
            expect(toMercenaryCompany[0].amount).toBe(4);
            expect(toMercenaryCompany[0].sourceCardIds).toEqual([context.luminaraUnduli.uuid]);
            expect(toMercenaryCompany[0].batch).toBe(toLuminara[0].batch);
            expectBatchesInOrder(records);
        });

        it('puts an upgrade defeated with its unit in the same batch as the unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: [{ card: 'wampa', upgrades: ['experience', 'experience'] }],
                },
                player2: {
                    groundArena: [{ card: 'battlefield-marine', upgrades: ['experience'] }],
                }
            });
            const { context } = contextRef;
            const experience = context.battlefieldMarine.upgrades[0];
            const before = context.getAnimationRecords().length;

            context.player1.clickCard(context.wampa);
            context.player1.clickCard(context.battlefieldMarine);

            const records = context.getAnimationRecords(before);
            const toMarine = damageTo(records, context.battlefieldMarine);
            const marineDefeat = defeatOf(records, context.battlefieldMarine);
            const experienceDefeat = defeatOf(records, experience);

            expect(marineDefeat).toBeDefined();
            expect(experienceDefeat).toBeDefined();
            expect(experienceDefeat.batch).toBe(marineDefeat.batch);
            expect(marineDefeat.batch).toBe(toMarine[0].batch + 1);
            expectBatchesInOrder(records);
        });

        it('puts damage from a When Defeated ability in a later batch than the defeat', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['wampa'],
                },
                player2: {
                    groundArena: ['hk87-assassin-droid', 'battlefield-marine'],
                }
            });
            const { context } = contextRef;
            const before = context.getAnimationRecords().length;

            context.player1.clickCard(context.wampa);
            context.player1.clickCard(context.hk87AssassinDroid);

            const records = context.getAnimationRecords(before);
            const toHk87 = damageTo(records, context.hk87AssassinDroid);
            const hk87Defeat = defeatOf(records, context.hk87AssassinDroid);
            const triggerDamage = records.filter((record) => record.kind === AnimationKind.Damage && record.batch > hk87Defeat.batch);
            const wampaDefeat = defeatOf(records, context.wampa);

            expect(hk87Defeat.batch).toBe(toHk87[0].batch + 1);

            // HK-87 deals 2 to each ground unit: the marine and the Wampa.
            expect(triggerDamage.map((record) => record.cardId)).toEqual(jasmine.arrayWithExactContents([context.battlefieldMarine.uuid, context.wampa.uuid]));
            expect(triggerDamage.every((record) => record.sourceCardIds.includes(context.hk87AssassinDroid.uuid))).toBeTrue();
            expect(new Set(triggerDamage.map((record) => record.batch)).size).toBe(1);
            expect(wampaDefeat.batch).toBe(triggerDamage[0].batch + 1);
            expectBatchesInOrder(records);
        });
    });
});
