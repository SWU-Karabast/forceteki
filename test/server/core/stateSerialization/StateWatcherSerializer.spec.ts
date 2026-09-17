import { StateWatcherName } from '../../../../server/game/core/Constants';
import { save } from '../../../../server/game/core/stateSerialization/MatchSerializer';
import { PRIOR_STINT_ID, SaveIntegrityError } from '../../../../server/game/core/stateSerialization/SavedMatchInterfaces';
import { SavedCardRefResolver } from '../../../../server/game/core/stateSerialization/SavedCardRefResolver';
import { encodeDamageDealt, registeredWatcherEncoderNames } from '../../../../server/game/core/stateSerialization/StateWatcherSerializer';
import { CounterSpaces, EntryReferenceEncoder, deriveCounterSpaceSizes, mintCounterId, resolveStintId, spaceOf } from '../../../../server/game/core/stateSerialization/WatcherEntryEncoding';
import type { ISavedMatch, ISavedStateWatcherSection } from '../../../../server/game/core/stateSerialization/SavedMatchInterfaces';

function sectionFor(document: ISavedMatch, watcher: StateWatcherName): ISavedStateWatcherSection | undefined {
    return document.stateWatchers.find((section) => section.watcher === watcher);
}

function entriesFor(document: ISavedMatch, watcher: StateWatcherName): any[] {
    return (sectionFor(document, watcher)?.entries ?? []) as any[];
}

/** The live, unmapped entries of one watcher, for comparing a published value against its source verbatim. */
function rawEntriesFor(context: any, watcher: StateWatcherName): any[] {
    const registered = context.game.stateWatcherRegistrar.registeredWatchers.find((candidate) => candidate.name === watcher);
    return [...(registered?.rawEntries ?? [])];
}

function watcherEntryFacts(document: ISavedMatch) {
    return document.engineOnlyFacts.filter((fact) => fact.category === 'watcherEntry');
}

/**
 * Establishes P2-A2's acceptance criteria for the `stateWatchers` section against a real `Game`, calling
 * `save` directly (the writer still has no production caller). Watcher state only exists after an actual
 * action: the harness registers every watcher, but card placement bypasses the systems that fire the
 * events they listen for, so every fixture here performs one.
 */
describe('MatchSerializer state-watcher encoding', function() {
    describe('AC3 — the encoder registry is exhaustive', function() {
        it('has exactly one encoder per StateWatcherName (T1)', function() {
            expect(registeredWatcherEncoderNames().sort()).toEqual(Object.values(StateWatcherName).sort());
        });
    });

    describe('AC5/AC6 — the loader half of each encoding, as pure functions', function() {
        it('resolves a stint against the loaded card\'s own key, and every prior stint below every key (T6)', function() {
            // The values §6 of the plan says actually occur: -1 (placed into a non-hidden zone and never
            // moved), 0 (deck-origin, never played -- the common case, NOT -1), 1 (a deck-origin card's
            // first in-play stint), and an arbitrary later stint. Asserted as pass-through rather than
            // against hard-coded expectations, so this cannot re-encode the "-1" assumption.
            for (const key of [-1, 0, 1, 7]) {
                expect(resolveStintId('live', key)).toBe(key);
                expect(resolveStintId('prior', key)).toBe(PRIOR_STINT_ID);
                expect(PRIOR_STINT_ID).toBeLessThan(key);
                expect(resolveStintId(null, key)).toBeNull();
            }

            // 'live' with no live key is unreachable by construction; the loader coalesces anyway.
            expect(resolveStintId('live', null)).toBeNull();
        });

        it('mints strictly negative, order-preserving counter ids and refuses an out-of-range ordinal (T7)', function() {
            const spaceSize = 3;
            const minted = [0, 1, 2].map((ordinal) => mintCounterId(ordinal, spaceSize));

            expect(minted).toEqual([-3, -2, -1]);
            for (const id of minted) {
                expect(id).toBeLessThan(0);
            }
            expect(minted[0]).toBeLessThan(minted[1]);
            expect(minted[1]).toBeLessThan(minted[2]);

            // The under-derived-spaceSize failure mode: loud, never a silently non-negative id that would
            // collide with a live attack id.
            expect(() => mintCounterId(3, 3)).toThrowError(SaveIntegrityError);
            expect(() => mintCounterId(-1, 3)).toThrowError(SaveIntegrityError);
            expect(() => mintCounterId(1.5, 3)).toThrowError(SaveIntegrityError);
        });
    });

    integration(function(contextRef) {
        describe('AC1 — the singleton and nested positions resolve', function() {
            it('resolves a deployed leader and a healed base without degrading (T2)', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['make-an-opening'],
                        groundArena: ['wampa'],
                        base: { card: 'echo-base', damage: 5 },
                        leader: { card: 'emperor-palpatine#galactic-ruler' },
                        resources: 10,
                    },
                    player2: {
                        groundArena: ['battlefield-marine'],
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.emperorPalpatine);
                context.player1.clickPrompt('Deploy Emperor Palpatine');
                context.player2.passAction();
                context.player1.clickCard(context.makeAnOpening);
                context.player1.clickCard(context.wampa);

                const document = save(context.game);

                const deployed = entriesFor(document, StateWatcherName.LeadersDeployedThisPhase);
                expect(deployed.length).toBe(1);
                expect(deployed[0].card).toEqual({
                    card: 'emperor-palpatine#galactic-ruler',
                    controllerSeat: 'p1',
                    zone: 'leader',
                    ordinal: 0,
                });

                const healed = entriesFor(document, StateWatcherName.BasesHealedThisPhase);
                expect(healed.length).toBe(1);
                expect(healed[0].base).toEqual({
                    card: 'echo-base',
                    controllerSeat: 'p1',
                    zone: 'base',
                    ordinal: 0,
                });

                expect(watcherEntryFacts(document)).toEqual([]);
            });

            it('names the parent\'s seat, not the nested card\'s controller, for an upgrade whose host changed hands (T3)', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['academy-training'],
                        groundArena: [{ card: 'wampa', damage: 1 }],
                        resources: 10,
                    },
                    player2: {
                        leader: { card: 'emperor-palpatine#galactic-ruler' },
                        resources: 10,
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.academyTraining);
                context.player1.clickCard(context.wampa);

                // Emperor Palpatine's deploy trigger needs a damaged non-leader unit, which is why the
                // fixture gives Wampa damage. The target is clicked explicitly: autoSingleTarget is
                // forbidden in new specs.
                context.player2.clickCard(context.emperorPalpatine);
                context.player2.clickPrompt('Deploy Emperor Palpatine');
                context.player2.clickCard(context.wampa);

                const document = save(context.game);

                const played = entriesFor(document, StateWatcherName.CardsPlayedThisPhase)
                    .find((entry) => entry.card?.card === 'academy-training');
                expect(played).toBeDefined();

                // TakeControlOfUnitSystem re-controls only *token* upgrades, so this non-token upgrade
                // keeps p1 as its controller while its host now sits in p2's ground arena.
                expect(played.card.controllerSeat).toBe('p1');
                expect(played.card.parent.seat).toBe('p2');
                expect(played.card.parent.zone).toBe('groundArena');
                expect(played.card.parent.list).toBe('upgrades');

                // The coordinate must actually index the host in *that* seat's array.
                const hostEntry = document.players[1].groundArena[played.card.parent.ordinal];
                expect(hostEntry.card).toBe('wampa');
                expect(hostEntry.upgrades.map((upgrade) => upgrade.card)).toContain('academy-training');
            });

            it('resolves a base-zone Credit and Force token rather than dropping the entry (T17)', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['unmarked-credits', 'youngling-padawan'],
                        resources: 10,
                    },
                    player2: {},
                });

                const { context } = contextRef;

                // Both are ordinary play paths: each fires OnTokensCreated and moves the token to the base
                // zone, where nothing else in the document indexes it. Without a coordinate of its own,
                // every such entry was dropped and `TheClientPleaseLowerYourBlaster` /
                // `JarJarBinksBombadGeneral` would evaluate false after a load.
                // The Padawan is played first: with a Credit already in the base zone, paying for it opens a
                // "use Credit tokens?" prompt, which is noise this test does not need.
                context.player1.clickCard(context.younglingPadawan);
                context.player2.passAction();
                context.player1.clickCard(context.unmarkedCredits);

                const document = save(context.game);

                expect(document.players[0].creditTokens).toBe(1);
                expect(document.players[0].hasTheForce).toBeTrue();

                const created = entriesFor(document, StateWatcherName.TokensCreatedThisPhase);
                expect(created.length).toBe(2);
                for (const entry of created) {
                    expect(entry.createdBy).toBe('p1');
                }

                const credit = created.find((entry) => entry.token.card === 'credit');
                expect(credit).toBeDefined();
                expect(credit.token).toEqual({ card: 'credit', controllerSeat: 'p1', zone: 'creditTokens', ordinal: 0 });

                const force = created.find((entry) => entry.token.card === 'the-force');
                expect(force).toBeDefined();
                expect(force.token).toEqual({ card: 'the-force', controllerSeat: 'p1', zone: 'forceToken', ordinal: 0 });

                // The whole point: a clean play path produces no degradation at all.
                expect(watcherEntryFacts(document)).toEqual([]);
            });

            it('resolves a captured unit through its captor\'s capturedCards sub-position (T4)', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['take-captive'],
                        groundArena: ['wampa'],
                        resources: 10,
                    },
                    player2: {
                        groundArena: ['battlefield-marine'],
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.takeCaptive);
                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.battlefieldMarine);

                const document = save(context.game);

                const leftPlay = entriesFor(document, StateWatcherName.CardsLeftPlayThisPhase)
                    .find((entry) => entry.card?.card === 'battlefield-marine');
                expect(leftPlay).toBeDefined();
                expect(leftPlay.card.zone).toBeNull();
                expect(leftPlay.card.ordinal).toBeNull();
                expect(leftPlay.card.parent.list).toBe('capturedCards');
                expect(leftPlay.card.parent.seat).toBe('p1');
                expect(leftPlay.card.parent.zone).toBe('groundArena');

                expect(watcherEntryFacts(document)).toEqual([]);
            });
        });

        describe('AC5 — in-play-id fields encode relative to their own referent', function() {
            it('marks a superseded stint prior and an untouched one live (T5)', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['wampa', 'battlefield-marine'],
                        resources: 10,
                    },
                    player2: {
                        hand: ['waylay'],
                        resources: 10,
                    },
                });

                const { context } = contextRef;

                // Attack recorded against this copy of Battlefield Marine...
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.p2Base);

                // ...then the copy is superseded: returned to hand and replayed as a new copy.
                context.player2.clickCard(context.waylay);
                context.player2.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.battlefieldMarine);
                context.player2.passAction();

                // A second attack, by a unit that has not left play since it attacked.
                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.p2Base);

                const document = save(context.game);
                const attacks = entriesFor(document, StateWatcherName.AttacksThisPhase);

                expect(attacks.length).toBe(2);
                expect(attacks[0].attacker.card).toBe('battlefield-marine');
                expect(attacks[0].attackerInPlayId).toBe('prior');
                expect(attacks[1].attacker.card).toBe('wampa');
                expect(attacks[1].attackerInPlayId).toBe('live');
            });

            it('marks a defeated card now in discard as live (T6)', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['wampa'],
                    },
                    player2: {
                        hand: ['vanquish'],
                        resources: 10,
                    },
                });

                const { context } = contextRef;

                context.player1.passAction();
                context.player2.clickCard(context.vanquish);
                context.player2.clickCard(context.wampa);

                const document = save(context.game);

                const defeated = entriesFor(document, StateWatcherName.CardsDefeatedThisPhase);
                expect(defeated.length).toBe(1);
                expect(defeated[0].card.card).toBe('wampa');
                expect(defeated[0].card.zone).toBe('discard');
                expect(defeated[0].inPlayId).toBe('live');

                const leftPlay = entriesFor(document, StateWatcherName.CardsLeftPlayThisPhase)
                    .find((entry) => entry.card?.card === 'wampa');
                expect(leftPlay.inPlayId).toBe('live');
            });

            it('classifies each element of an index-aligned stint array against its own referent (T8)', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['wampa', 'pyke-sentinel'],
                        resources: 10,
                    },
                    player2: {
                        hand: ['waylay'],
                        resources: 10,
                    },
                });

                const { context } = contextRef;

                // Bounce and replay Wampa so the two units hold *different* live stint keys. That is the
                // discriminating premise below: with equal keys, an encoder that read one fixed index would
                // be indistinguishable from one that reads element i.
                context.player1.passAction();
                context.player2.clickCard(context.waylay);
                context.player2.clickCard(context.wampa);
                context.player1.clickCard(context.wampa);
                context.player2.passAction();
                context.player1.clickCard(context.pykeSentinel);
                context.player1.clickCard(context.p2Base);

                const document = save(context.game);
                const damageEntries = entriesFor(document, StateWatcherName.DamageDealtThisPhase);

                expect(damageEntries.length).toBeGreaterThan(0);
                for (const entry of damageEntries) {
                    expect(entry.damageSourceInPlayIds.length).toBe(entry.damageSourceCards.length);
                }

                // The card pool affords no fixture that puts two damage sources in one live entry with
                // different stints (that needs a multi-defender combat), so the contract is established
                // through the encoder itself rather than through `save`. Going through `encodeDamageDealt`
                // is the point: calling `classifyStint` directly would leave both plausible defects --
                // `classifyStint(rawStints[0], …)` and `classifyStint(…, cardOf(damageSources[0]))` --
                // untouched, which is exactly what the previous form of this test permitted.
                const wampa = context.wampa;
                const sentinel = context.pykeSentinel;
                expect(wampa.inPlayId).not.toBe(sentinel.inPlayId);

                const resolver = new SavedCardRefResolver();
                resolver.indexTopLevel(wampa, 'p1', 'groundArena', 0);
                resolver.indexTopLevel(sentinel, 'p1', 'groundArena', 1);
                resolver.indexTopLevel(context.p2Base, 'p2', 'base', 0);

                const seatByUuid = new Map<string, string>([
                    [context.player1Object.uuid, 'p1'],
                    [context.player2Object.uuid, 'p2'],
                ]);

                const encodeTwoSources = (rawStints: number[]) => {
                    const refs = new EntryReferenceEncoder(resolver, seatByUuid);
                    const saved = encodeDamageDealt({
                        damageType: damageEntries[0].damageType,
                        damageSourceCards: [wampa.uuid, sentinel.uuid],
                        damageSourceInPlayIds: rawStints,
                        damageSourceCardTypes: [wampa.type, sentinel.type],
                        damageSourcePlayer: context.player1Object.uuid,
                        damageSourceEventId: undefined,
                        targets: [context.p2Base.uuid],
                        targetType: context.p2Base.type,
                        targetController: context.player2Object.uuid,
                        amount: 1,
                        isIndirect: false,
                        activeAttackId: undefined,
                    } as any, refs, new CounterSpaces());

                    expect(refs.unrepresentableField).toBeNull();
                    expect(saved.damageSourceCards.map((ref) => ref.card)).toEqual([wampa.internalName, sentinel.internalName]);
                    return saved.damageSourceInPlayIds;
                };

                // Both sources at their own current stint. Reading a fixed index or a fixed referent yields
                // ['live', 'prior'] here, because the two keys differ.
                expect(encodeTwoSources([wampa.inPlayId, sentinel.inPlayId])).toEqual(['live', 'live']);

                // And a genuinely superseded stint in the second slot still reads 'prior'.
                expect(encodeTwoSources([wampa.inPlayId, sentinel.inPlayId - 1])).toEqual(['live', 'prior']);
            });

            it('emits an event card\'s played entry with a null stint rather than dropping it (T14)', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['vanquish'],
                        resources: 10,
                    },
                    player2: {
                        groundArena: ['wampa'],
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.vanquish);
                context.player1.clickCard(context.wampa);

                let document: ISavedMatch;
                expect(() => {
                    document = save(context.game);
                }).not.toThrow();

                const played = entriesFor(document, StateWatcherName.CardsPlayedThisPhase)
                    .find((entry) => entry.card?.card === 'vanquish');

                // An EventCard has no isInPlay()/inPlayId surface at all, so its stint is null -- and a null
                // stint is not an unresolvable referent, so the entry survives.
                expect(played).toBeDefined();
                expect(played.card.zone).toBe('discard');
                expect(played.inPlayId).toBeNull();
                expect(played.parentCard).toBeNull();
                expect(played.parentCardInPlayId).toBeNull();
                expect(watcherEntryFacts(document)).toEqual([]);
            });
        });

        describe('a non-card damage source records a null card type, not undefined', function() {
            it('writes null for framework-sourced ability damage from an empty-deck draw', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['patrolling-vwing'],
                        deck: [],
                    },
                    player2: {
                        hasInitiative: true,
                    },
                });

                const { context } = contextRef;

                // Patrolling V-Wing draws on play. With an empty deck, DrawSystem instead deals damage
                // through a *framework* context, whose source is an OngoingEffectSource rather than a
                // card -- so the watcher has no card type to record for this entry.
                context.player2.passAction();
                context.player1.clickCard(context.patrollingVwing);

                const liveEntries = rawEntriesFor(context, StateWatcherName.DamageDealtThisPhase);
                expect(liveEntries.length).toBe(1);
                expect(liveEntries[0].damageSourceCardTypes.length).toBe(1);

                // The point of the test: null, and specifically *not* undefined. Asserted with identity
                // checks rather than a toEqual against [null], because jasmine's equality treats
                // [undefined] and [null] as matching -- the same coercion that let this stay latent
                // through the v8.serialize path. The state encoder rejects an undefined array element by
                // design, so an undefined here is a live encode failure at every snapshot point.
                expect(liveEntries[0].damageSourceCardTypes[0] === null).toBeTrue();
                expect(liveEntries[0].damageSourceCardTypes[0] === undefined).toBeFalse();

                // Such an entry never reaches a save file: its damageSourceCards references the framework
                // source, which has no position, so the entry is dropped and the drop is enumerated. That
                // is why ISavedDamageDealtEntry.damageSourceCardTypes stays non-optional.
                const document = save(context.game);
                expect(entriesFor(document, StateWatcherName.DamageDealtThisPhase)).toEqual([]);
                expect(watcherEntryFacts(document).length).toBe(1);
                expect(watcherEntryFacts(document)[0].description).toContain('damageSourceCards');
            });
        });

        describe('AC6 — counters are minted into shared, document-scoped spaces', function() {
            it('assigns attack ordinals in attack order and groups each damage entry with its attack (T7)', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['pyke-sentinel'],
                        groundArena: ['wampa', 'battlefield-marine'],
                        resources: 10,
                    },
                    player2: {},
                });

                const { context } = contextRef;

                context.player1.clickCard(context.pykeSentinel);
                context.player2.passAction();
                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.p2Base);
                context.player2.passAction();
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.p2Base);

                const document = save(context.game);
                const attacks = entriesFor(document, StateWatcherName.AttacksThisPhase);
                const damage = entriesFor(document, StateWatcherName.DamageDealtThisPhase);
                const played = entriesFor(document, StateWatcherName.CardsPlayedThisPhase);

                expect(attacks.length).toBe(2);
                expect(attacks.map((entry) => entry.attackId)).toEqual([0, 1]);

                const ordinalByAttacker = new Map(attacks.map((entry) => [entry.attacker.card, entry.attackId]));
                expect(damage.length).toBe(2);
                for (const entry of damage) {
                    const attacker = entry.damageSourceCards[0].card;
                    // Cross-watcher grouping: a damage entry still resolves to its own attack after minting.
                    expect(entry.activeAttackId).toBe(ordinalByAttacker.get(attacker));
                }

                // `playEventId` is the sole member of the other space, and nothing else pins it: a dropped
                // `record` call would leave it null in every played-card entry of every save while the whole
                // suite stayed green.
                expect(played.length).toBe(1);
                expect(played[0].card.card).toBe('pyke-sentinel');
                expect(played.map((entry) => entry.playEventId)).toEqual([0]);

                // The sizes a loader must use, derived from the whole document rather than per section.
                expect(deriveCounterSpaceSizes(document)).toEqual({ attackIds: 2, gameEventIds: 1 });
            });

            it('derives a counter space size across every section that contributes to it (T15)', function() {
                // Two attacks, but only the first dealt damage -- so the damage section alone contains no
                // ordinal above 0. This is the shape that makes a per-section derivation wrong.
                const document = {
                    stateWatchers: [
                        { watcher: StateWatcherName.AttacksThisPhase, entries: [{ attackId: 0 }, { attackId: 1 }] },
                        { watcher: StateWatcherName.DamageDealtThisPhase, entries: [{ activeAttackId: 0 }] },
                        { watcher: StateWatcherName.CardsPlayedThisPhase, entries: [{ playEventId: 0 }, { playEventId: 1 }, { playEventId: 2 }] },
                    ],
                } as unknown as ISavedMatch;

                const sizes = deriveCounterSpaceSizes(document);
                expect(sizes).toEqual({ attackIds: 2, gameEventIds: 3 });

                // The damage entry and the attack it belongs to must mint to the same id.
                expect(mintCounterId(0, sizes.attackIds)).toBe(mintCounterId(0, sizes.attackIds));
                expect([0, 1].map((ordinal) => mintCounterId(ordinal, sizes.attackIds))).toEqual([-2, -1]);

                // What a per-section derivation would have produced for the damage section: size 1, which
                // mints the damage entry to -1 -- the id of the *second* attack -- with no error raised.
                expect(mintCounterId(0, 1)).toBe(-1);

                expect(deriveCounterSpaceSizes({ stateWatchers: [] } as unknown as ISavedMatch))
                    .toEqual({ attackIds: 0, gameEventIds: 0 });
            });

            it('mints and derives through one shared member-to-space table (T19)', function() {
                // The writer half. `record` takes no space argument: it resolves one from the table, so a
                // member the table does not list cannot enter a space at all.
                const attack: any = { attackId: null };
                const laterAttack: any = { attackId: null };
                const damage: any = { activeAttackId: null };
                const played: any = { playEventId: null };

                const counters = new CounterSpaces();
                counters.record(StateWatcherName.AttacksThisPhase, attack, 'attackId', 5);
                counters.commitEntry();
                counters.record(StateWatcherName.AttacksThisPhase, laterAttack, 'attackId', 7);
                counters.commitEntry();
                counters.record(StateWatcherName.DamageDealtThisPhase, damage, 'activeAttackId', 7);
                counters.commitEntry();
                counters.record(StateWatcherName.CardsPlayedThisPhase, played, 'playEventId', 9);
                counters.commitEntry();
                counters.assignOrdinals();

                // The damage entry shares the attack space, so it takes the *second* attack's ordinal. Were
                // it minting into a space of its own it would be 0, like the lone game-event member.
                expect([attack.attackId, laterAttack.attackId]).toEqual([0, 1]);
                expect(damage.activeAttackId).toBe(1);
                expect(played.playEventId).toBe(0);

                // The loader half derives from the same table, so it sees the same grouping.
                const document = {
                    stateWatchers: [
                        { watcher: StateWatcherName.AttacksThisPhase, entries: [attack, laterAttack] },
                        { watcher: StateWatcherName.DamageDealtThisPhase, entries: [damage] },
                        { watcher: StateWatcherName.CardsPlayedThisPhase, entries: [played] },
                    ],
                } as unknown as ISavedMatch;
                expect(deriveCounterSpaceSizes(document)).toEqual({ attackIds: 2, gameEventIds: 1 });

                // The linkage control: a member with no row has no space, on either side. This is what a
                // future `damageSourceEventId` repair hits if it adds a `record` call and forgets the row,
                // instead of silently under-deriving the space it meant to join.
                expect(() => spaceOf(StateWatcherName.DamageDealtThisPhase, 'damageSourceEventId')).toThrowError(SaveIntegrityError);
                expect(() => spaceOf(StateWatcherName.ActionsThisPhase, 'actionNumber')).toThrowError(SaveIntegrityError);
                expect(() => (new CounterSpaces() as any).record(StateWatcherName.DamageDealtThisPhase, {}, 'damageSourceEventId', 4))
                    .toThrowError(SaveIntegrityError);

                // ...and it refuses even when the live value is absent, so the omission cannot lie dormant
                // until a board that happens to populate the member.
                expect(() => (new CounterSpaces() as any).record(StateWatcherName.DamageDealtThisPhase, {}, 'damageSourceEventId', undefined))
                    .toThrowError(SaveIntegrityError);

                // A malformed ordinal under-derives its space if it is skipped, so it is refused.
                const malformed = {
                    stateWatchers: [{ watcher: StateWatcherName.AttacksThisPhase, entries: [{ attackId: 0 }, { attackId: 1.5 }] }],
                } as unknown as ISavedMatch;
                expect(() => deriveCounterSpaceSizes(malformed)).toThrowError(SaveIntegrityError);
            });

            it('keeps a surviving ordinal dense over survivors when an entry sharing its space is dropped (T16)', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['battle-droid', 'wampa'],
                    },
                    player2: {
                        hand: ['vanquish'],
                        resources: 10,
                    },
                });

                const { context } = contextRef;

                // The token attacks first, so it holds the *lower* raw attack id. It is then defeated and
                // removed from the game, which leaves its watcher entries referencing nothing.
                context.player1.clickCard(context.battleDroid);
                context.player1.clickCard(context.p2Base);
                context.player2.clickCard(context.vanquish);
                context.player2.clickCard(context.battleDroid);
                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.p2Base);
                context.game.removeTokenFromPlay(context.battleDroid);

                const document = save(context.game);
                const attacks = entriesFor(document, StateWatcherName.AttacksThisPhase);
                const damage = entriesFor(document, StateWatcherName.DamageDealtThisPhase);

                // The drop must actually have happened, or the rest of this proves nothing.
                const attackDrops = watcherEntryFacts(document)
                    .filter((fact) => fact.description.startsWith(StateWatcherName.AttacksThisPhase));
                expect(attackDrops.length).toBe(1);

                // Dense over survivors only: were the dropped entry's raw value committed to the space, the
                // surviving attack would be ordinal 1 and the space would be size 2.
                expect(attacks.length).toBe(1);
                expect(attacks[0].attacker.card).toBe('wampa');
                expect(attacks[0].attackId).toBe(0);

                expect(damage.length).toBe(1);
                expect(damage[0].damageSourceCards[0].card).toBe('wampa');
                expect(damage[0].activeAttackId).toBe(0);

                expect(deriveCounterSpaceSizes(document).attackIds).toBe(1);
            });
        });

        describe('AC9 — actionNumber is preserved verbatim', function() {
            it('records the live action number rather than re-minting it (T9)', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['wampa'],
                    },
                    player2: {},
                });

                const { context } = contextRef;

                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.p2Base);

                const document = save(context.game);

                const actions = entriesFor(document, StateWatcherName.ActionsThisPhase);
                const attacks = entriesFor(document, StateWatcherName.AttacksThisPhase);
                const liveActions = rawEntriesFor(context, StateWatcherName.ActionsThisPhase);
                const liveAttacks = rawEntriesFor(context, StateWatcherName.AttacksThisPhase);

                expect(attacks.length).toBe(1);
                expect(actions.length).toBeGreaterThan(0);

                // Verbatim against the live entries: an encoder that treated actionNumber as a counter and
                // re-minted it would produce different values here, breaking FullyArmedAndOperational, which
                // compares an entry's value against the same restored space `game.actionNumber` lives in.
                expect(attacks.map((entry) => entry.actionNumber)).toEqual(liveAttacks.map((entry) => entry.actionNumber));
                expect(actions.map((entry) => entry.actionNumber)).toEqual(liveActions.map((entry) => entry.actionNumber));
                expect(document.game.actionNumber).toBe(context.game.actionNumber);
                expect(attacks[0].actionNumber).toBeGreaterThanOrEqual(0);
            });
        });

        describe('AC4 — Set payloads are serialized, not dropped', function() {
            it('encodes every Set<Trait> as a sorted tagged set matching the live set (T10)', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['wampa'],
                    },
                    player2: {
                        groundArena: ['battlefield-marine'],
                    },
                });

                const { context } = contextRef;

                const wampaTraits = [...context.wampa.traits].sort();
                const marineTraits = [...context.battlefieldMarine.traits].sort();

                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.battlefieldMarine);

                const document = save(context.game);

                const attack = entriesFor(document, StateWatcherName.AttacksThisPhase)[0];
                expect(attack.attackerAttributes.traits.$set).toEqual(wampaTraits);

                // JSON.stringify turns a bare Set into {}, the silent loss the design forbids.
                const defeated = entriesFor(document, StateWatcherName.CardsDefeatedThisPhase)
                    .find((entry) => entry.card?.card === 'battlefield-marine');
                expect(defeated).toBeDefined();
                expect(defeated.lastKnownInformation.traits.$set).toEqual(marineTraits);
                expect(defeated.lastKnownInformation.type).toBe(context.battlefieldMarine.type);

                const roundTripped = JSON.parse(JSON.stringify(document));
                expect(roundTripped.stateWatchers).toEqual(document.stateWatchers);
            });
        });

        describe('AC7 — an unresolvable referent drops its entry and is enumerated', function() {
            it('drops only the offending entry and names the watcher, index and field (T11)', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['droid-deployment'],
                        resources: 10,
                    },
                    player2: {
                        hand: ['vanquish'],
                        resources: 10,
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.droidDeployment);

                const tokens = context.player1.findCardsByName('battle-droid');
                expect(tokens.length).toBe(2);

                const [removedToken, survivingToken] = tokens;

                context.player2.clickCard(context.vanquish);
                context.player2.clickCard(removedToken);

                // AsToken.removeFromGame nulls the zone but leaves the object registered, so the watcher
                // entry still holds a live id that occupies no position anywhere in the document.
                context.game.removeTokenFromPlay(removedToken);

                const document = save(context.game);

                const created = entriesFor(document, StateWatcherName.TokensCreatedThisPhase);
                expect(created.length).toBe(1);
                expect(created[0].token.card).toBe(survivingToken.internalName);

                const tokenFacts = watcherEntryFacts(document)
                    .filter((fact) => fact.description.startsWith(StateWatcherName.TokensCreatedThisPhase));
                expect(tokenFacts.length).toBe(1);
                expect(tokenFacts[0].description).toContain('entry 0 dropped');
                expect(tokenFacts[0].description).toContain('field "token"');
                expect(tokenFacts[0].target).toBeNull();

                // Every drop is enumerated: no entry disappears without a fact naming where it came from.
                for (const fact of watcherEntryFacts(document)) {
                    expect(fact.description).toMatch(/^[\w-]+ entry \d+ dropped: field "[\w.]+" \w/);
                }
            });

            it('emits sections in StateWatcherName declaration order, not registration order (T18)', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['pyke-sentinel'],
                        groundArena: ['wampa'],
                        resources: 10,
                    },
                    player2: {
                        hand: ['vanquish'],
                        resources: 10,
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.pykeSentinel);
                context.player2.clickCard(context.vanquish);
                context.player2.clickCard(context.wampa);

                const document = save(context.game);
                const emitted = document.stateWatchers.map((section) => section.watcher);
                expect(emitted.length).toBeGreaterThan(2);

                const declarationOrder = Object.values(StateWatcherName).filter((name) => emitted.includes(name));
                expect(emitted).toEqual(declarationOrder);

                // The control that makes the assertion above load-bearing: registration order for the same
                // watchers is a different sequence, so an encoder iterating `registeredWatchers` -- which
                // compiles and passes every membership and shape assertion in this file -- would fail here.
                const registrationOrder = context.game.stateWatcherRegistrar.registeredWatchers
                    .map((watcher) => watcher.name)
                    .filter((name) => emitted.includes(name));
                expect(registrationOrder.slice().sort()).toEqual(declarationOrder.slice().sort());
                expect(registrationOrder).not.toEqual(declarationOrder);
            });

            it('emits no section for a watcher with no entries, and no fact (T13)', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['wampa', 'pyke-sentinel'],
                    },
                    player2: {
                        groundArena: ['battlefield-marine'],
                    },
                });

                const { context } = contextRef;

                // Precondition: a freshly built board carries no watcher state at all.
                for (const watcher of context.game.stateWatcherRegistrar.registeredWatchers) {
                    expect(watcher.entryCount).toBe(0);
                }

                const emptyBoardDocument = save(context.game);
                expect(emptyBoardDocument.stateWatchers).toEqual([]);
                expect(watcherEntryFacts(emptyBoardDocument)).toEqual([]);

                // And after one action, only the watchers that actually recorded something get a section.
                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.p2Base);

                const document = save(context.game);
                const emptyWatchers = context.game.stateWatcherRegistrar.registeredWatchers.filter((watcher) => watcher.entryCount === 0);

                expect(emptyWatchers.length).toBeGreaterThan(0);
                for (const watcher of emptyWatchers) {
                    expect(sectionFor(document, watcher.name)).toBeUndefined();
                }
                for (const section of document.stateWatchers) {
                    expect(section.entries.length).toBeGreaterThan(0);
                }
            });
        });

        describe('AC8 — the section carries no raw runtime value', function() {
            it('passes a typed sweep over a richly populated board (T12)', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['take-captive', 'make-an-opening'],
                        groundArena: ['wampa', 'atat-suppressor'],
                        base: { card: 'echo-base', damage: 5 },
                        leader: { card: 'emperor-palpatine#galactic-ruler' },
                        resources: 20,
                    },
                    player2: {
                        hand: ['vanquish'],
                        groundArena: ['battlefield-marine', 'pyke-sentinel'],
                        resources: 20,
                    },
                });

                const { context } = contextRef;

                // Pyke Sentinel has Sentinel, so it is the only legal attack target while it is in play.
                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.pykeSentinel);
                context.player2.clickCard(context.vanquish);
                context.player2.clickCard(context.atatSuppressor);
                context.player1.clickCard(context.takeCaptive);
                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.battlefieldMarine);
                context.player2.passAction();
                context.player1.clickCard(context.makeAnOpening);
                context.player1.clickCard(context.wampa);

                const document = save(context.game);
                expect(document.stateWatchers.length).toBeGreaterThan(3);

                const stintMembers = new Set([
                    'attackerInPlayId', 'inPlayId', 'discardedPlayId', 'parentCardInPlayId',
                ]);
                const stintArrayMembers = new Set(['damageSourceInPlayIds']);
                const counterMembers = new Set(['attackId', 'playEventId', 'activeAttackId']);
                const deadMembers = new Set(['targetInPlayId', 'damageSourceEventId']);
                const uuidShape = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

                function assertStint(value: unknown, path: string): void {
                    expect(['live', 'prior', null]).withContext(path)
                        .toContain(value as any);
                }

                function walk(value: unknown, path: string): void {
                    expect(value).withContext(`${path} is undefined`).not.toBeUndefined();
                    expect(value instanceof Date).withContext(`${path} is a Date`)
                        .toBeFalse();

                    if (typeof value === 'string') {
                        expect(uuidShape.test(value)).withContext(`${path} looks like a uuid`)
                            .toBeFalse();
                        return;
                    }
                    if (value === null || typeof value !== 'object') {
                        return;
                    }
                    if (Array.isArray(value)) {
                        value.forEach((element, index) => walk(element, `${path}[${index}]`));
                        return;
                    }

                    for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
                        const nestedPath = `${path}.${key}`;

                        if (deadMembers.has(key)) {
                            // Exactly null, not merely nullish: tsconfig enables neither strict nor
                            // strictNullChecks, so a passed-through undefined would type-check against the
                            // schema's `null` declaration. This assertion is what actually holds it.
                            expect(nested).withContext(nestedPath)
                                .toBeNull();
                            continue;
                        }
                        if (stintMembers.has(key)) {
                            assertStint(nested, nestedPath);
                            continue;
                        }
                        if (stintArrayMembers.has(key)) {
                            expect(Array.isArray(nested)).withContext(nestedPath)
                                .toBeTrue();
                            (nested as unknown[]).forEach((element, index) => assertStint(element, `${nestedPath}[${index}]`));
                            continue;
                        }
                        if (counterMembers.has(key)) {
                            if (nested !== null) {
                                expect(Number.isInteger(nested)).withContext(nestedPath)
                                    .toBeTrue();
                                expect(nested as number).withContext(nestedPath)
                                    .toBeGreaterThanOrEqual(0);
                            }
                            continue;
                        }

                        walk(nested, nestedPath);
                    }
                }

                walk(document.stateWatchers, 'stateWatchers');

                expect(JSON.parse(JSON.stringify(document.stateWatchers))).toEqual(document.stateWatchers);
            });
        });
    });
});
