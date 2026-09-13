import { PerGameAbilityLimit } from '../../../../server/game/core/ability/AbilityLimit';
import { save } from '../../../../server/game/core/stateSerialization/MatchSerializer';
import { scrubChatMessages } from '../../../../server/game/core/stateSerialization/ChatScrubber';
import { SavedCardRefResolver } from '../../../../server/game/core/stateSerialization/SavedCardRefResolver';

/**
 * Establishes P2-A's acceptance criteria for `MatchSerializer.save` against a real `Game`, calling it
 * directly rather than driving the writer through a production caller (this unit has none; see the owning
 * plan). Every position needed is built by the integration harness's normal setup options.
 */
describe('MatchSerializer.save', function() {
    integration(function(contextRef) {
        describe('AC1/AC2/AC8 — a representative board (losslessness, base attachments, and JSON safety)', function() {
            beforeEach(async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['vanquish', 'strike-true'],
                        discard: ['takedown', 'waylay'],
                        resources: [
                            { card: 'disarm', exhausted: true },
                            { card: 'the-emperors-legion', exhausted: false },
                        ],
                        groundArena: [
                            { card: 'lom-pyke#dealer-in-truths', damage: 1, exhausted: true, upgrades: ['academy-training'], capturedUnits: ['battlefield-marine'] },
                            'atat-suppressor',
                        ],
                        spaceArena: ['cartel-spacer'],
                        base: { card: 'echo-base', damage: 3, upgrades: ['military-academy'], capturedUnits: ['cartel-turncoat'] },
                        leader: { card: 'chancellor-palpatine#playing-both-sides' },
                    },
                    player2: {
                        groundArena: ['wampa'],
                    },
                });
            });

            it('losslessly reproduces every live zone the schema covers', function() {
                const { context } = contextRef;
                const document = save(context.game);
                const p1 = document.players[0];

                expect(document.players[0].seat).toBe('p1');
                expect(document.players[1].seat).toBe('p2');

                expect(p1.deck).toEqual(context.player1Object.deckZone.cards.map((c) => c.internalName));
                expect(p1.hand).toEqual(context.player1Object.hand.map((c) => c.internalName));
                expect(p1.discard).toEqual(context.player1Object.discard.map((c) => c.internalName));
                expect(p1.resources.map((r) => r.card)).toEqual(context.player1Object.resources.map((c) => c.internalName));
                expect(p1.resources.find((r) => r.card === 'disarm').exhausted).toBeTrue();
                expect(p1.resources.find((r) => r.card === 'the-emperors-legion').exhausted).toBeFalse();

                expect(p1.groundArena.length).toBe(2);
                const lomPykeEntry = p1.groundArena.find((e) => e.card === 'lom-pyke#dealer-in-truths');
                expect(lomPykeEntry.damage).toBe(1);
                expect(lomPykeEntry.exhausted).toBeTrue();
                expect(lomPykeEntry.upgrades.map((u) => u.card)).toEqual(['academy-training']);
                expect(lomPykeEntry.capturedCards.map((c) => c.card)).toEqual(['battlefield-marine']);

                expect(p1.spaceArena.map((e) => e.card)).toEqual(['cartel-spacer']);

                // AC1's deck is well over five cards: Game.captureGameState truncates to five, this must not.
                expect(p1.deck.length).toBeGreaterThan(5);
            });

            it('emits the base as an attachment parent with correctly seated upgrades and captures (AC2)', function() {
                const { context } = contextRef;
                const document = save(context.game);
                const baseEntry = document.players[0].base;

                expect(baseEntry.card).toBe('echo-base');
                expect(baseEntry.damage).toBe(3);
                expect(baseEntry.upgrades).toEqual([{ card: 'military-academy', ownerSeat: 'p1' }]);
                // Test-setup default: a capturedUnits entry with no explicit `owner` is assumed owned by
                // the capturing card's opponent (see DeckBuilder.getCapturedUnitsFromCard).
                expect(baseEntry.capturedCards).toEqual([{ card: 'cartel-turncoat', ownerSeat: 'p2' }]);
            });

            it('contains no uuid, no runtime counter, no Date object, and no undefined member, and survives a JSON round-trip (AC8)', function() {
                const { context } = contextRef;
                const document = save(context.game);

                const forbiddenKeys = new Set(['uuid', 'playEventId', 'inPlayId', 'attackId', 'eventId']);
                const seen = new Set<unknown>();

                function walk(value: unknown, path: string): void {
                    if (value === undefined) {
                        throw new Error(`Found an undefined member at ${path}`);
                    }
                    if (value instanceof Date) {
                        throw new Error(`Found a Date object at ${path}`);
                    }
                    if (value === null || typeof value !== 'object') {
                        return;
                    }
                    if (seen.has(value)) {
                        return;
                    }
                    seen.add(value);

                    if (Array.isArray(value)) {
                        value.forEach((element, index) => walk(element, `${path}[${index}]`));
                        return;
                    }

                    for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
                        if (forbiddenKeys.has(key)) {
                            throw new Error(`Found forbidden key "${key}" at ${path}.${key}`);
                        }
                        walk(nested, `${path}.${key}`);
                    }
                }

                walk(document, 'document');

                const roundTripped = JSON.parse(JSON.stringify(document));
                expect(roundTripped).toEqual(document);
            });
        });

        describe('AC9 — control changes and a flipped leader are representable', function() {
            it('records ownerSeat on the arena entry of a unit whose control was taken', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'emperor-palpatine#galactic-ruler' },
                    },
                    player2: {
                        groundArena: [{ card: 'lom-pyke#dealer-in-truths', damage: 1 }],
                    },
                    autoSingleTarget: true,
                });

                const { context } = contextRef;
                context.player1.clickCard(context.emperorPalpatine);
                context.player1.clickPrompt('Deploy Emperor Palpatine');

                const document = save(context.game);

                // The card is now controlled by p1 (but still owned by p2), so it appears under p1's
                // board, not p2's, with ownerSeat recording its original owner.
                const p1Entry = document.players[0].groundArena.find((e) => e.card === 'lom-pyke#dealer-in-truths');
                expect(p1Entry.ownerSeat).toBe('p2');

                const p2Entry = document.players[1].groundArena.find((e) => e.card === 'lom-pyke#dealer-in-truths');
                expect(p2Entry).toBeUndefined();
            });

            it('represents a flipped double-sided leader with a fixed, non-optional shape', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'chancellor-palpatine#playing-both-sides', flipped: true },
                    },
                });

                const { context } = contextRef;
                const document = save(context.game);
                const leaderEntry = document.players[0].leader;

                expect(leaderEntry.onStartingSide).toBeFalse();
                expect(leaderEntry.damage).toBe(0);
                expect(leaderEntry.deployed).toBeFalse();
                expect(leaderEntry.upgrades).toEqual([]);
                expect(leaderEntry.capturedCards).toEqual([]);
            });
        });

        describe('AC4 — epicDeployUsed is the only representation of the deploy limit', function() {
            it('marks epicDeployUsed without a matching entry in leader.limits', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'emperor-palpatine#galactic-ruler' },
                    },
                });

                const { context } = contextRef;
                context.player1.clickCard(context.emperorPalpatine);
                context.player1.clickPrompt('Deploy Emperor Palpatine');

                const document = save(context.game);
                const leaderEntry = document.players[0].leader;

                expect(leaderEntry.deployed).toBeTrue();
                expect(leaderEntry.epicDeployUsed).toBeTrue();
                expect(leaderEntry.limits.some((limit) => 'usesByPlayer' in limit || 'useCount' in limit)).toBeFalse();
            });
        });

        describe('AC3 — ability limits are tracked per card instance', function() {
            it('serializes a used, per-player-per-game limit on the copy that used it and omits it from an unused copy', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['kachirho-militia', 'kachirho-militia'],
                    },
                });

                const { context } = contextRef;
                const [usedCopy] = context.player1.findCardsByName('kachirho-militia');
                const ability = usedCopy.getTriggeredAbilities().find((a) => a.printedAbility);

                ability.limit.increment(context.player1Object);

                const document = save(context.game);
                const kallusEntries = document.players[0].groundArena.filter((e) => e.card === 'kachirho-militia');

                expect(kallusEntries.length).toBe(2);
                const withLimit = kallusEntries.filter((e) => e.limits.length > 0);
                const withoutLimit = kallusEntries.filter((e) => e.limits.length === 0);

                expect(withLimit.length).toBe(1);
                expect(withoutLimit.length).toBe(1);
                expect((withLimit[0].limits[0] as { usesByPlayer: Record<string, number> }).usesByPlayer).toEqual({ p1: 1 });
            });

            it('serializes a PerGameAbilityLimit as {useCount, currentUserSeat: null} rather than usesByPlayer', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['kachirho-militia'],
                    },
                });

                const { context } = contextRef;
                const ability = context.kachirhoMilitia.getTriggeredAbilities().find((a) => a.printedAbility);

                // No printed ability in the current card pool is ever constructed with a PerGameAbilityLimit
                // directly: the only two `AbilityHelper.limit.perGame(...)` call sites in server/game/cards
                // (ShienFlurry, JabbaTheHuttCrimeBoss) both pass it to `delayedCardEffect`, whose limit lives
                // on the ongoing effect's own props (`effect.impl.getValue().limit`), never on a `CardAbility`
                // reachable through `getLimitBearingAbilitySurface` -- so that branch is unreachable through
                // any card in the pool today. Swapping a real printed ability's limit instance at runtime
                // (identifier unchanged, so the pristine-drift guard is unaffected) exercises the schema's
                // other branch, mirroring the AC6 spec's precedent of tampering with a live ability field.
                ability.limit = new PerGameAbilityLimit(context.game, 1);
                ability.limit.increment(context.player1Object);

                const document = save(context.game);
                const entry = document.players[0].groundArena.find((e) => e.card === 'kachirho-militia');

                expect(entry.limits).toEqual([{ abilityIdentifier: ability.abilityIdentifier, useCount: 1, currentUserSeat: null }]);
                expect('usesByPlayer' in entry.limits[0]).toBeFalse();
            });
        });

        describe('AC5 — re-derivable constant abilities produce an empty manifest', function() {
            it('produces no engineOnlyFacts for a board that only registered printed constant abilities', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['wampa', 'pyke-sentinel'],
                        spaceArena: ['millennium-falcon#piece-of-junk', 'cartel-spacer'],
                    },
                });

                const { context } = contextRef;

                // Precondition: no watcher carries state on a freshly injected board.
                for (const watcher of context.game.stateWatcherRegistrar.registeredWatchers) {
                    expect(watcher.entryCount).toBe(0);
                }

                const document = save(context.game);
                expect(document.engineOnlyFacts).toEqual([]);
            });

            it('produces no engineOnlyFacts for a board instantiating the gained-constant chain (332nd Stalwart\'s Coordinate)', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['332nd-stalwart', 'wampa', 'pyke-sentinel', 'battlefield-marine'],
                    },
                });

                const { context } = contextRef;
                const document = save(context.game);

                expect(document.engineOnlyFacts).toEqual([]);
            });
        });

        describe('AC5 — the affirmative manifest fact shapes (step 6)', function() {
            it('emits a pilotLeader fact naming the host, for a pilot-attached leader', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'poe-dameron#i-can-fly-anything',
                        spaceArena: ['millennium-falcon#piece-of-junk'],
                        resources: 5,
                    },
                });

                const { context } = contextRef;
                context.player1.clickCard(context.poeDameron);
                context.player1.clickPrompt('Flip Poe Dameron and attach him as an upgrade to a friendly Vehicle unit without a Pilot on it');
                context.player1.clickCard(context.millenniumFalcon);

                const document = save(context.game);
                const pilotFact = document.engineOnlyFacts.find((fact) => fact.category === 'pilotLeader');

                expect(pilotFact).toBeDefined();
                expect(pilotFact.source).toEqual({ card: 'poe-dameron#i-can-fly-anything', controllerSeat: 'p1', zone: 'leader', ordinal: 0 });
                expect((pilotFact.target as { card: string }).card).toBe('millennium-falcon#piece-of-junk');
                expect(pilotFact.duration).toBeNull();
            });

            it('emits a gainedAbility fact for a re-derivable grant whose use count is not preserved (Improvised Identity, spent)', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'wampa', upgrades: ['improvised-identity'] }],
                    },
                });

                const { context } = contextRef;

                // Improvised Identity's granted action ability carries limit: perRound(1); spend it
                // directly rather than resolving the full search-and-attack chain.
                const grantedAbility = context.wampa.getActionAbilities().find((ability) => ability.printedAbility === false);
                expect(grantedAbility).toBeDefined();
                grantedAbility.limit.increment(context.player1Object);

                const document = save(context.game);
                const droppedCountFact = document.engineOnlyFacts.find((fact) =>
                    fact.category === 'gainedAbility' && (fact.target as { card: string })?.card === 'wampa');

                expect(droppedCountFact).toBeDefined();
                expect((droppedCountFact.source as { card: string }).card).toBe('improvised-identity');
                expect(droppedCountFact.description).toContain('use count is not preserved');
            });

            it('does not emit a gainedAbility fact when the granted ability is unspent', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'wampa', upgrades: ['improvised-identity'] }],
                    },
                });

                const { context } = contextRef;
                const document = save(context.game);

                expect(document.engineOnlyFacts).toEqual([]);
            });

            it('emits a lastingEffect fact for an active forThisPhaseCardEffect (rule 5)', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['disarm'],
                        groundArena: ['pyke-sentinel'],
                    },
                    player2: {
                        groundArena: ['atst'],
                    },
                });

                const { context } = contextRef;
                context.player1.clickCard(context.disarm);
                context.player1.clickCard(context.atst);

                const document = save(context.game);
                const lastingFact = document.engineOnlyFacts.find((fact) => fact.category === 'lastingEffect');

                expect(lastingFact).toBeDefined();
                // Disarm's event ability generates the forThisPhaseCardEffect with the event card itself as
                // context.source, so that is the fact's source.
                expect((lastingFact.source as { card: string }).card).toBe('disarm');
                expect((lastingFact.target as { card: string }).card).toBe('atst');
                expect(lastingFact.duration).toBe('untilEndOfPhase');
            });

            it('emits a delayedEffect fact for a pending delayed effect (rule 1)', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['jetpack'],
                        groundArena: ['battlefield-marine'],
                    },
                });

                const { context } = contextRef;
                context.player1.clickCard(context.jetpack);
                context.player1.clickCard(context.battlefieldMarine);

                const document = save(context.game);
                const delayedFact = document.engineOnlyFacts.find((fact) => fact.category === 'delayedEffect');

                expect(delayedFact).toBeDefined();
                // DelayedEffectSystem defaults duration to Duration.Persistent when the card doesn't
                // override it, and Jetpack's shield-defeat delayed effect doesn't; this is precisely why
                // rule 1 must precede rule 3 (a Persistent effect is not automatically re-derivable).
                expect(delayedFact.duration).toBe('persistent');
                expect((delayedFact.source as { card: string }).card).toBe('jetpack');
                // The delayed effect's single target is the Shield token Jetpack gave to Battlefield Marine,
                // not Battlefield Marine itself.
                expect((delayedFact.target as { card: string }).card).toBe('shield');
            });
        });

        describe('AC10 — stateWatchers ships empty, marked, and its state is declared dropped', function() {
            it('always emits stateWatchers: [] and, when a watcher holds entries, a matching watcherEntry fact', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['battlefield-marine'],
                    },
                });

                const { context } = contextRef;
                context.player1.clickCard(context.battlefieldMarine);

                const document = save(context.game);
                expect(document.stateWatchers).toEqual([]);

                const hasNonEmptyWatcher = context.game.stateWatcherRegistrar.registeredWatchers.some((watcher) => watcher.entryCount > 0);
                expect(hasNonEmptyWatcher).toBeTrue();
                expect(document.engineOnlyFacts.some((fact) => fact.category === 'watcherEntry')).toBeTrue();
            });
        });

        describe('step 7 — chat scrubbing', function() {
            it('removes every uuid and player id, converts dates to ISO strings, and keeps a card reference as its display name', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: { groundArena: ['wampa'] },
                });

                const { context } = contextRef;
                context.game.gameChat.addMessage('{0} plays a card', context.wampa);
                context.game.gameChat.addChatMessage(context.player1Object, 'hello there');

                const scrubbed = scrubChatMessages(context.game.gameChat.messages);

                // A substring scan over the serialized *message* content only (never `date`), not a
                // recursive key/string-membership walk: the schema's published guarantee
                // (SavedMatchInterfaces.ts) is that neither a uuid nor a player id appears anywhere in a
                // message, including inside a stringified fallback fragment, and an exact-membership check
                // over collected keys/values cannot see a uuid buried inside a larger string. `date` is
                // deliberately excluded from this scan: it's an ISO timestamp whose millisecond digits can
                // coincidentally contain a short numeric player id as a substring, which would make this
                // check flaky against a value the schema never claims is scrubbed in the first place.
                const serializedMessages = JSON.stringify(scrubbed.map((message) => message.message));
                expect(serializedMessages).not.toContain('uuid');
                expect(serializedMessages).not.toContain(context.player1Object.id);
                expect(serializedMessages).not.toContain(context.player2Object.id);

                for (const message of scrubbed) {
                    expect(typeof message.date).toBe('string');
                    expect(() => new Date(message.date).toISOString()).not.toThrow();
                }

                expect(serializedMessages).toContain('Wampa');
            });
        });
    });

    describe('SavedCardRefResolver (step 3)', function() {
        integration(function(contextRef) {
            it('resolves an upgrade, a captured card, and a deployed leader to the coordinate that indexes them', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [
                            { card: 'lom-pyke#dealer-in-truths', upgrades: ['academy-training'], capturedUnits: ['battlefield-marine'] },
                        ],
                        leader: { card: 'emperor-palpatine#galactic-ruler', deployed: true },
                    },
                });

                const { context } = contextRef;
                const resolver = new SavedCardRefResolver();

                resolver.indexTopLevel(context.lomPyke, 'p1', 'groundArena', 0);
                resolver.indexNested(context.academyTraining, 'p1', 'groundArena', 0, 'upgrades');
                resolver.indexNested(context.battlefieldMarine, 'p1', 'groundArena', 0, 'capturedCards');
                resolver.indexTopLevel(context.player1Object.deckLeader, 'p1', 'leader', 0);

                const upgradeRef = resolver.resolve(context.academyTraining, 'p1');
                expect(upgradeRef.zone).toBeNull();
                expect(upgradeRef.ordinal).toBeNull();
                expect(upgradeRef.parent).toEqual({ zone: 'groundArena', ordinal: 0, list: 'upgrades' });

                const capturedRef = resolver.resolve(context.battlefieldMarine, 'p1');
                expect(capturedRef.zone).toBeNull();
                expect(capturedRef.ordinal).toBeNull();
                expect(capturedRef.parent).toEqual({ zone: 'groundArena', ordinal: 0, list: 'capturedCards' });

                const leaderRef = resolver.resolve(context.player1Object.deckLeader, 'p1');
                expect(leaderRef.zone).toBe('leader');
                expect(leaderRef.ordinal).toBe(0);
                expect(leaderRef.parent).toBeUndefined();

                // A card that was never indexed resolves to the "not in any emitted position" form.
                const unindexedRef = resolver.resolve(context.wampa ?? context.player2Object.deckLeader, 'p2');
                expect(unindexedRef.zone).toBeNull();
                expect(unindexedRef.ordinal).toBeNull();
                expect(unindexedRef.parent).toBeUndefined();
            });

            it('throws SaveIntegrityError when the same card is indexed at more than one position', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: { groundArena: ['wampa'] },
                });

                const { context } = contextRef;
                const resolver = new SavedCardRefResolver();
                resolver.indexTopLevel(context.wampa, 'p1', 'groundArena', 0);

                expect(() => resolver.indexTopLevel(context.wampa, 'p1', 'groundArena', 1)).toThrow();
            });
        });
    });
});
