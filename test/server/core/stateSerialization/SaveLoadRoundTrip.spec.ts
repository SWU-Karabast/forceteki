import { save } from '../../../../server/game/core/stateSerialization/MatchSerializer';
import { StateWatcherName } from '../../../../server/game/core/Constants';
import { expectRoundTripEqual, saveLoadSaveAsync } from '../../../helpers/SaveLoadHarness';

/**
 * `P2-E` group 1 (AC1-AC3): the save -> load -> save round-trip property, for two rich non-degraded
 * positions disjoint from `MatchLoader.spec.ts` AC1's own fixture, the watcher-normalization premise
 * (AC2), and the degraded round trip (AC3). See `.anvil/p2-e/plan-rev1.md` §3 step 2.
 */
describe('Save -> load -> save round trip', function() {
    integration(function(contextRef) {
        it('AC1 — rich position A: a flipped undeployed leader, unit tokens, a damaged base with an upgrade and a captured card', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    // {deployed: true, flipped: true} silently ignores `flipped`
                    // (PlayerInteractionWrapper.ts:135); flipped-and-not-deployed is the constructible form.
                    leader: { card: 'chancellor-palpatine#playing-both-sides', flipped: true },
                    groundArena: [{ card: 'wampa', upgrades: ['shield', 'experience'] }],
                    resources: [{ card: 'pyke-sentinel', exhausted: true }, ...Array.from({ length: 19 }, () => ({ card: 'pyke-sentinel', exhausted: false }))],
                    base: { card: 'echo-base', damage: 3, upgrades: ['military-academy'], capturedUnits: ['cartel-turncoat'] },
                },
                player2: {
                    groundArena: ['battlefield-marine'],
                },
            });
            const { context } = contextRef;

            const before = save(context.game);
            expect(before.engineOnlyFacts).withContext('this fixture must be non-degraded, or the round-trip below would prove the wrong property')
                .toEqual([]);

            // Positive content assertions on `before`: a symmetry comparison is blind to anything the
            // writer never emits, so these must be checked directly rather than inferred from equality.
            expect(before.players[0].leader.onStartingSide).toBeFalse();
            expect(before.players[0].leader.deployed).toBeFalse();
            const wampaEntry = before.players[0].groundArena.find((entry) => entry.card === 'wampa');
            expect(wampaEntry?.upgrades.map((upgrade) => upgrade.card).sort()).toEqual(['experience', 'shield']);
            expect(before.players[0].resources.filter((entry) => entry.exhausted).length).toBe(1);
            expect(before.players[0].base.damage).toBe(3);
            expect(before.players[0].base.upgrades.map((upgrade) => upgrade.card)).toEqual(['military-academy']);
            expect(before.players[0].base.capturedCards.map((entry) => entry.card)).toEqual(['cartel-turncoat']);

            const { saveAgain } = await saveLoadSaveAsync(context);
            expectRoundTripEqual(before, saveAgain());
        });

        it('AC1 — rich position B: round 2, non-initiative player active, watcher entries from a resolved attack and a card play', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['wampa'],
                    groundArena: ['atat-suppressor'],
                    resources: 4,
                    // Pinned so player1 -- who owns the card played below -- is deterministically the
                    // non-initiative player once round 2 begins.
                    hasInitiative: false,
                },
                player2: {
                    groundArena: ['pyke-sentinel'],
                    hasInitiative: true,
                },
            });
            const { context } = contextRef;

            // Player2 holds initiative, so it acts first in round 1.
            context.player2.passAction();
            context.player1.clickCard(context.atatSuppressor);
            context.player1.clickCard(context.pykeSentinel);
            context.moveToNextActionPhase();

            // Round 2: the initiative player passes first, leaving the non-initiative player (player1)
            // active.
            context.player2.passAction();
            context.player1.clickCard(context.wampa);

            const before = save(context.game);
            expect(before.engineOnlyFacts).withContext('this fixture must be non-degraded, or the round-trip below would prove the wrong property')
                .toEqual([]);

            expect(before.game.roundNumber).toBe(2);
            const cardsEnteredPlay = before.stateWatchers.find((section) => section.watcher === StateWatcherName.CardsEnteredPlayThisPhase);
            expect(cardsEnteredPlay?.entries.length).toBeGreaterThan(0);

            const { saveAgain } = await saveLoadSaveAsync(context);
            expectRoundTripEqual(before, saveAgain());
        });

        it('AC2 — a watcher registered but holding no entries emits no section on either side, and the loaded registrar is a strict, non-empty subset', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: { groundArena: ['atat-suppressor'] },
                player2: { groundArena: ['wampa'] },
            });
            const { context } = contextRef;

            context.player1.clickCard(context.atatSuppressor);
            context.player1.clickCard(context.wampa);

            const before = save(context.game);
            // AttacksThisPhase/DamageDealtThisPhase/UnitsDamagedThisPhase are populated; nothing here draws
            // or discards a card, so CardsDrawnThisPhase stays registered-but-empty on the source game.
            expect(before.stateWatchers.some((section) => section.watcher === StateWatcherName.CardsDrawnThisPhase)).toBeFalse();

            // The premise this asserts: at the *document* level, "absent" and "registered but empty" are
            // the same thing today (the writer omits empty sections, `StateWatcherSerializer.spec.ts:774`
            // T13), which is exactly why the raw-array comparison in `MatchLoader.spec.ts` AC1 works and why
            // AC1 above can compare `stateWatchers` at all. The map normalization in
            // `normalizeSavedMatch`/`expectRoundTripEqual` ships regardless (the plan doc mandates it) and
            // is what keeps AC1 true the day a future writer starts emitting empty sections; this spec
            // states the premise directly rather than depending on it implicitly.
            const { loadedGame, saveAgain } = await saveLoadSaveAsync(context);
            const sourceRegisteredNames = new Set(context.game.stateWatcherRegistrar.registeredWatchers.map((watcher) => watcher.name));
            const loadedRegisteredNames = new Set(loadedGame.stateWatcherRegistrar.registeredWatchers.map((watcher) => watcher.name));

            expect(loadedRegisteredNames.size).toBeGreaterThan(0);
            expect(loadedRegisteredNames.size).withContext('the loader must register only the watchers the document named, strictly fewer than every registered watcher')
                .toBeLessThan(sourceRegisteredNames.size);
            expect(loadedRegisteredNames.has(StateWatcherName.CardsDrawnThisPhase)).toBeFalse();
            for (const name of loadedRegisteredNames) {
                expect(sourceRegisteredNames.has(name)).toBeTrue();
            }

            const after = saveAgain();
            expect(after.stateWatchers.some((section) => section.watcher === StateWatcherName.CardsDrawnThisPhase)).toBeFalse();
        });

        it('AC3 — a degraded lastingEffect (Disarm) round-trips modulo the manifest, and the re-save carries no manifest', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: { hand: ['disarm'] },
                player2: { groundArena: ['atst'] },
            });
            const { context } = contextRef;

            // Disarm's effect changes no printed stat and defeats nothing, so the position is identical
            // with or without it: the document equality below is a real property, not an artefact of the
            // dropped fact happening to coincide with the base position.
            context.player1.clickCard(context.disarm);
            context.player1.clickCard(context.atst);

            const before = save(context.game);
            expect(before.engineOnlyFacts.some((fact) => fact.category === 'lastingEffect')).toBeTrue();

            const { saveAgain } = await saveLoadSaveAsync(context);
            expectRoundTripEqual(before, saveAgain(), { degraded: true });
        });

        it('AC3 — a degraded gainedAbility (spent Improvised Identity) round-trips modulo the manifest, and the re-save carries no manifest', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: { groundArena: [{ card: 'wampa', upgrades: ['improvised-identity'] }] },
            });
            const { context } = contextRef;

            const grantedAbility = context.wampa.getActionAbilities().find((ability) => ability.printedAbility === false);
            expect(grantedAbility).toBeDefined();
            grantedAbility.limit.increment(context.player1Object);

            const before = save(context.game);
            expect(before.engineOnlyFacts.some((fact) => fact.category === 'gainedAbility')).toBeTrue();

            // EngineOnlyFacts emits the gainedAbility fact only when the use count is provably non-zero, so
            // a post-load count of 0 yields an empty re-save manifest -- the sharpest available statement
            // of "the dropped facts no longer exist to drop".
            const { saveAgain } = await saveLoadSaveAsync(context);
            expectRoundTripEqual(before, saveAgain(), { degraded: true });
        });
    });
});
