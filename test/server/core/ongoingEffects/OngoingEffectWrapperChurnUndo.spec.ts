import { SnapshotType, KeywordName } from '../../../../server/game/core/Constants';
import type { Card } from '../../../../server/game/core/card/Card';
import type { Player } from '../../../../server/game/core/Player';
import { GainKeyword } from '../../../../server/game/core/ongoingEffect/effectImpl/GainKeyword';

/**
 * p1-a work item A, end-to-end proof (hardened): drives real cards through the fixed
 * DynamicOngoingEffectImpl / GainKeyword / OngoingEffect.refreshContext paths and confirms, via a
 * manual-snapshot rollback, that (a) the OngoingEffectValueWrapper family stops growing while a new
 * MutableOngoingEffectValueWrapper stays flat at one per (effect, target), (b) the rollback seam itself
 * registers no new GameObject, and (c) values and context are correctly restored afterward. Uses
 * `undoIntegration` (not `it`) so it is skipped under whole-suite undo mode, where its own manual
 * snapshot management would otherwise nest inside the suite's automatic rollback replay.
 */
describe('DynamicOngoingEffectImpl wrapper churn under undo', function() {
    undoIntegration(function(contextRef) {
        interface IRegistrarInternals {
            lastGameObjectId: number;
            allGameObjects: { uuid: string }[];
        }

        function getRegistrar(game): IRegistrarInternals {
            return game.gameObjectManager as unknown as IRegistrarInternals;
        }

        function getAllGameObjects(game): { uuid: string }[] {
            return getRegistrar(game).allGameObjects;
        }

        // Reads `allGameObjects` uuids directly rather than calling `buildGameStateForSnapshot()`, whose
        // first statement is `removeUnusedGameObjects()`: that sweeps ref-less GameObjects as a side
        // effect, and this helper is called repeatedly mid-action-phase at moments the engine itself
        // wouldn't sweep, which would otherwise be a latent flake source.
        function countWrapperFamilies(game) {
            const uuids = getRegistrar(game).allGameObjects.map((go) => go.uuid);
            return {
                // Every pre-existing OngoingEffectValueWrapper subclass inherits the base class's
                // getGameObjectName() and so shares this prefix (boundary case 6).
                oldFamily: uuids.filter((uuid) => uuid.startsWith('OngoingEffectValueWrapper_')).length,
                mutableFamily: uuids.filter((uuid) => uuid.startsWith('MutableOngoingEffectValueWrapper_')).length,
            };
        }

        function getRaidAmount(card: Card): number {
            const raidKeyword = card.keywords.find((keyword) => keyword.name === KeywordName.Raid);
            if (!raidKeyword || !raidKeyword.hasNumericValue()) {
                return 0;
            }
            return raidKeyword.value;
        }

        it('keeps the pre-existing wrapper family flat and grows exactly one mutable wrapper across repeated value changes', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['97th-legion#keeping-the-peace-on-sullust'],
                    resources: 3,
                },
            });
            const { context } = contextRef;

            expect(context._97thLegion.getPower()).toBe(3);
            const baseline = countWrapperFamilies(context.game);

            for (const resourceCount of [5, 2, 6, 1]) {
                context.player1.setResourceCount(resourceCount);
                expect(context._97thLegion.getPower()).toBe(resourceCount);
                expect(context._97thLegion.getHp()).toBe(resourceCount);

                const counts = countWrapperFamilies(context.game);
                expect(counts.oldFamily).toBe(baseline.oldFamily);
                expect(counts.mutableFamily).toBe(1);
            }
        });

        it('registers nothing across the rollback seam, restores in-place values, and refreshes context on every live effect', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: [
                        '97th-legion#keeping-the-peace-on-sullust',
                        'avar-kriss#for-light-and-life',
                        { card: 'bokatan-kryze#for-all-of-mandalore', upgrades: ['the-darksaber#icon-of-leadership'] }
                    ],
                    hand: ['wampa'],
                    resources: 3,
                },
                player2: {
                    groundArena: ['battlefield-marine'],
                },
            });
            const { context } = contextRef;
            const game = context.game;

            expect(context._97thLegion.getPower()).toBe(3);
            expect(context._97thLegion.getHp()).toBe(3);
            // Avar Kriss prints Raid 1, plus her ability grants Raid equal to her other friendly units
            // (97th Legion, Bo-Katan = 2), for a total of 3.
            expect(getRaidAmount(context.avarKriss)).toBe(3);

            const snapshotId = game.takeManualSnapshot(context.player1Object);

            // Change both a raw-value dynamic effect (97th Legion's stats) and a GainKeyword dynamic
            // effect (Avar Kriss's Raid) in the same timepoint.
            context.player1.setResourceCount(6);
            context.player1.setupMoveCard('wampa', 'groundArena');
            game.resolveGameState(true);

            expect(context._97thLegion.getPower()).toBe(6);
            expect(context._97thLegion.getHp()).toBe(6);
            // Now 3 other friendly units (97th Legion, Bo-Katan, Wampa): printed 1 + granted 3 = 4.
            expect(getRaidAmount(context.avarKriss)).toBe(4);

            // The tight seam: SnapshotManager.rollbackTo alone, excluding postRollbackOperations (which
            // legitimately rebuilds the pipeline and can allocate). Every GameObjectBase registers
            // unconditionally at construction, so lastGameObjectId is an exact allocation counter across
            // this seam for every class, including the four this unit's fixes target (OngoingEffectValueWrapper,
            // MutableOngoingEffectValueWrapper, GainKeyword, OngoingEffectSource).
            // Poison every live effect's context fields with an obviously-wrong sentinel before rolling
            // back. `context` is a plain (non-decorated) field, so rollback's state restore does not touch
            // it directly; only the `afterSetAllState` -> `refreshContext` hook can put it right. Without
            // this poisoning, the loop below would pass even if refreshContext were never called (this
            // board has no effect whose `abilityPlayer()` changes across the rollback, and `source` /
            // `ongoingEffect` are already correct pre-rollback), so it could only fail if refreshContext
            // threw. Test B (OngoingEffectContextCaching.spec.ts) carries the falsifiable player-reassignment
            // case; this poisoning makes this end-to-end test independently falsifiable too.
            const poisonPlayer = {} as unknown as Player;
            const poisonSource = {} as unknown as Card;
            const poisonOngoingEffect = {} as unknown as typeof game.ongoingEffectEngine.effects[0]['ongoingEffect'];
            for (const effect of game.ongoingEffectEngine.effects) {
                effect.context.player = poisonPlayer;
                effect.context.source = poisonSource;
                effect.context.ongoingEffect = poisonOngoingEffect;
            }

            const registrar = getRegistrar(game);
            const lastIdBeforeRollback = registrar.lastGameObjectId;
            const rollbackResult = game.snapshotManager.rollbackTo({
                type: SnapshotType.Manual,
                playerId: context.player1Object.id,
                snapshotId,
            });
            expect(rollbackResult.success).toBeTrue();
            expect(registrar.lastGameObjectId).toBe(lastIdBeforeRollback);

            // Restore a consistent game for the harness's afterEach, replaying what
            // Game.rollbackToSnapshotInternal does next (outside the measured seam).
            if (rollbackResult.success) {
                game.postRollbackOperations(rollbackResult.entryPoint);
            }
            game.continue();

            // AC5: the reused mutable wrapper's value was restored from decorated state, not left stale.
            expect(context._97thLegion.getPower()).toBe(3);
            expect(context._97thLegion.getHp()).toBe(3);
            expect(getRaidAmount(context.avarKriss)).toBe(3);
            expect(context.bokatanKryze).toHaveExactUpgradeNames(['the-darksaber#icon-of-leadership']);

            // AC6/context refresh: every live ongoing effect's context agrees with the effect's current
            // fields after the rollback - the falsifiable player-reassignment case is covered by test B.
            for (const effect of game.ongoingEffectEngine.effects) {
                const abilityPlayer = (effect as unknown as { abilityPlayer(): Player }).abilityPlayer();
                expect(effect.context.player).toBe(abilityPlayer);
                expect(effect.context.source).toBe(effect.source);
                expect(effect.context.ongoingEffect).toBe(effect.ongoingEffect);
            }
        });

        it('allocates nothing for an unchanged dynamic keyword total and reallocates when the total actually changes', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['avar-kriss#for-light-and-life', 'wampa'],
                    hand: ['moisture-farmer'],
                    resources: 3,
                },
            });
            const { context } = contextRef;
            const game = context.game;

            // Printed Raid 1, plus granted Raid 1 for the one other friendly unit (Wampa).
            expect(getRaidAmount(context.avarKriss)).toBe(2);
            const registrar = getRegistrar(game);

            // Re-resolving game state with no board change at all: the Raid total is unchanged, so the
            // GainKeyword wrap path must not even be reached (A1's early return) across repeated passes.
            const lastIdBeforeNeutralChange = registrar.lastGameObjectId;
            game.resolveGameState(true);
            game.resolveGameState(true);
            expect(getRaidAmount(context.avarKriss)).toBe(2);
            expect(registrar.lastGameObjectId).toBe(lastIdBeforeNeutralChange);

            // Playing a new friendly unit changes the computed Raid total, so a new (still-immutable,
            // per A3's unchanged retention model) GainKeyword must be allocated and the total must move.
            // A bare lastGameObjectId increase would be satisfied by any of the many objects a card play
            // allocates (the unit itself, its abilities, etc.) and would be no evidence that a GainKeyword
            // was actually (re)allocated, so diff the object set across the seam and require a genuine
            // GainKeyword instance to appear in it. (GainKeyword does not override getGameObjectName(), so
            // its uuid carries the inherited 'OngoingEffectValueWrapper_' prefix, not 'GainKeyword_' -
            // checking the instance type directly is both correct and immune to that naming detail.)
            const objectsBeforePlay = new Set(getAllGameObjects(game));
            context.player1.clickCard('moisture-farmer');
            expect(getRaidAmount(context.avarKriss)).toBe(3);
            expect(registrar.lastGameObjectId).toBeGreaterThan(lastIdBeforeNeutralChange);

            const newObjects = getAllGameObjects(game).filter((go) => !objectsBeforePlay.has(go));
            expect(newObjects.some((go) => go instanceof GainKeyword)).toBeTrue();
        });
    });
});
