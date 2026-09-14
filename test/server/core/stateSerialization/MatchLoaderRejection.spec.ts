import { save } from '../../../../server/game/core/stateSerialization/MatchSerializer';
import { loadAsync } from '../../../../server/game/core/stateSerialization/MatchLoader';
import { MatchLoadError } from '../../../../server/game/core/stateSerialization/MatchLoadError';
import { buildLoadConfig } from '../../../helpers/MatchLoaderHarness';
import type { ISavedMatch } from '../../../../server/game/core/stateSerialization/SavedMatchInterfaces';
import { ByoyomiTimer } from '../../../../server/game/core/actionTimer/ByoyomiTimer';
import { StateWatcherName } from '../../../../server/game/core/Constants';
import { getLimitBearingAbilitySurface } from '../../../../server/game/core/stateSerialization/SharedAbilitySurface';

/**
 * Establishes AC11/AC13: every load-side rejection is a `MatchLoadError` (never a bare `Game`, never a
 * silent degrade). Each case mutates a known-good document produced by a real `save()`, so the fixtures
 * cannot drift from the writer's actual output.
 */
describe('MatchLoader.loadAsync — rejection', function() {
    integration(function(contextRef) {
        let goodDocument: ISavedMatch;

        beforeEach(async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: { hand: ['vanquish'], groundArena: ['wampa'] },
                player2: { groundArena: ['battlefield-marine'] },
            });
            goodDocument = save(contextRef.context.game);
        });

        async function expectRejection(mutate: (doc: ISavedMatch) => void): Promise<void> {
            const document: ISavedMatch = JSON.parse(JSON.stringify(goodDocument));
            mutate(document);
            await expectAsync(loadAsync(document, buildLoadConfig(contextRef.context))).toBeRejectedWithError(MatchLoadError);
        }

        it('a document that loads successfully as a control (sanity check for every mutation below)', async function() {
            await expectAsync(loadAsync(goodDocument, buildLoadConfig(contextRef.context))).toBeResolved();
        });

        it('rejects a formatVersion mismatch', async function() {
            await expectRejection((doc) => {
                (doc as any).formatVersion = 999;
            });
        });

        it('rejects an unknown card internal name', async function() {
            await expectRejection((doc) => {
                doc.players[0].hand[0] = 'not-a-real-card-name';
            });
        });

        it('rejects an unknown token name', async function() {
            await expectRejection((doc) => {
                doc.players[0].outsideTheGame.push('not-a-real-token-name');
            });
        });

        it('rejects a truncated document (a required member deleted)', async function() {
            await expectRejection((doc) => {
                delete (doc as any).rng;
            });
        });

        it('rejects an invalid position (an upgrade whose host ordinal does not exist)', async function() {
            await expectRejection((doc) => {
                doc.players[0].groundArena[0].upgrades.push({ card: 'academy-training', ownerSeat: 'p1' });
                // Ensure the decklist can still cover the extra upgrade position so this fails at
                // injection (unresolvable host), not earlier at the decklist-coverage check.
                doc.players[0].decklist.deck.push({ id: doc.players[0].decklist.deck[0].id, count: 1 });
            });
        });

        it('a mainRemainingSeconds out of range rejects', async function() {
            await expectRejection((doc) => {
                doc.timers['p1'].mainRemainingSeconds = 0;
            });
        });

        it('two seats bound to the same username rejects', async function() {
            const document: ISavedMatch = JSON.parse(JSON.stringify(goodDocument));
            const config = buildLoadConfig(contextRef.context);
            const clashing = { ...config, seats: [config.seats[0], { seat: 'p2', user: { ...config.seats[0].user, id: 'a-different-id' } }] };
            await expectAsync(loadAsync(document, clashing)).toBeRejectedWithError(MatchLoadError);
        });

        it('rejects game.phase !== action', async function() {
            await expectRejection((doc) => {
                doc.game.phase = 'setup';
            });
        });

        it('rejects staging residue (a zone array omits a card the decklist contains)', async function() {
            await expectRejection((doc) => {
                doc.players[0].hand.pop();
            });
        });

        it('rejects a gutted decklist.deck with a decklist-flavoured diagnostic', async function() {
            const document: ISavedMatch = JSON.parse(JSON.stringify(goodDocument));
            document.players[0].decklist.deck = [];
            let caught: unknown;
            try {
                await loadAsync(document, buildLoadConfig(contextRef.context));
            } catch (error) {
                caught = error;
            }
            expect(caught).toBeInstanceOf(MatchLoadError);
            expect((caught as Error).message.toLowerCase()).toContain('decklist');
        });

        it('rejects a decklist that cannot cover the document\'s own card positions, naming the sideboarding cause', async function() {
            const document: ISavedMatch = JSON.parse(JSON.stringify(goodDocument));
            // Replace the decklist's deck with a single filler entry totalling the structural minimum (so
            // the earlier "gutted decklist" check does not fire first) that covers none of the document's
            // actual hand/arena card positions -- exactly what a Bo3 sideboard move leaves behind, since
            // `originalDeckList` still names the pre-sideboard cards.
            const fillerSetCode = document.players[0].decklist.deck[0].id;
            document.players[0].decklist.deck = [{ id: fillerSetCode, count: 8 }];

            let caught: unknown;
            try {
                await loadAsync(document, buildLoadConfig(contextRef.context));
            } catch (error) {
                caught = error;
            }
            expect(caught).toBeInstanceOf(MatchLoadError);
            expect((caught as Error).message.toLowerCase()).toContain('sideboard');
        });

        it('rejects a corrupted rng.state rather than loading with silently wrong randomness', async function() {
            // `seedrandom` passes a well-formed { i, j, S } state through verbatim (no validation of its
            // values), so the round-trip guard cannot catch a mutated-but-shaped state -- but a state
            // missing its required fields makes `seedrandom` re-derive a fresh one from the seed alone,
            // which the round-trip read-back *does* catch (it will not equal the document's own `rng.state`).
            await expectRejection((doc) => {
                doc.rng.state = {};
            });
        });

        it('rejects an unknown ability identifier in a saved limit', async function() {
            await expectRejection((doc) => {
                doc.players[0].groundArena[0].limits.push({ abilityIdentifier: 'not-a-real-identifier', useCount: 1, currentUserSeat: null });
            });
        });

        it('rejects a document naming the leader\'s deploy limit in leader.limits', async function() {
            // A literal 'deploy' cannot match a real minted identifier (Card.ts mints
            // `<internalName>_<abilityTypeDescriptor>_<idx>`), so using one here would exercise only the
            // "unknown ability identifier" branch and leave the double-count guard this test names
            // (AbilityLimitRestorer's `limit === deployEpicActionLimit` check) with zero coverage. Resolve
            // the leader's own real deploy-action identifier via the same ability-surface function the
            // restorer uses, so this document actually reaches that guard.
            const leaderCard = contextRef.context.player1Object.deckLeader;
            const deployAbility = getLimitBearingAbilitySurface(leaderCard).find((ability) => ability.limit === leaderCard.deployEpicActionLimit);
            expect(deployAbility).withContext('the seated leader must have a limit-bearing deploy ability to exercise this')
                .toBeDefined();

            await expectRejection((doc) => {
                doc.players[0].leader.limits.push({ abilityIdentifier: deployAbility.abilityIdentifier, useCount: 1, currentUserSeat: null });
            });
        });

        it('stops both players\' real action timers when a failure occurs after the driven setup armed them (no timer leak)', async function() {
            // runSetupPhase drives the constructed game to a live ActionWindow prompt, which arms a real
            // per-player timer (UiPrompt.setPrompt -> startPlayerActionTimer) when settings.useActionTimer is
            // true. Steps 4-6 have no try/finally guarding that armed timer against a later failure -- here,
            // a corrupted rng.state -- so without the fix the active player's timer is left running and
            // fires for real, 20-140s later, into a Game nobody holds a reference to.
            //
            // The driven setup itself calls start()/stop()/pause() on both players' timers many times as an
            // ordinary part of prompt cycling (not a leak), so a raw call count on `stop` cannot discriminate
            // the fix from its absence. What can: capturing the two live `ByoyomiTimer` instances (via a
            // `start` wrapper, since both players are guaranteed to have `start` invoked on them during
            // setup even if only one is ever paused) and asserting neither is *currently running* once
            // `loadAsync` has rejected -- true only if something explicitly stopped the one left active by
            // setup, which is exactly what the fix's `finally` block does and the pre-fix code did not.
            const document: ISavedMatch = JSON.parse(JSON.stringify(goodDocument));
            document.settings.useActionTimer = true;
            document.rng.state = {};

            // A plain monkeypatch, not `spyOn`: under `ENABLE_UNDO_ALL_TESTS`, `undoIt` replays this same
            // `it` body a second time (through rollback) within one Jasmine spec, and `spyOn` refuses to spy
            // the same method twice without an intervening spec boundary to reset it.
            const originalStart = ByoyomiTimer.prototype.start;
            const timerInstances = new Set<ByoyomiTimer>();
            ByoyomiTimer.prototype.start = function(this: ByoyomiTimer, ...args: Parameters<typeof originalStart>) {
                timerInstances.add(this);
                return originalStart.apply(this, args);
            };

            try {
                await expectAsync(loadAsync(document, buildLoadConfig(contextRef.context))).toBeRejectedWithError(MatchLoadError);

                expect(timerInstances.size).toBe(2);
                for (const timer of timerInstances) {
                    expect(timer.isRunning).toBeFalse();
                }
            } finally {
                ByoyomiTimer.prototype.start = originalStart;
            }
        });

        it('rejects a nested card whose recorded controller diverges from its owner, naming the real cause', async function() {
            // `ISavedAttachedCard` records only `{card, ownerSeat}` -- no controller field -- because
            // `MatchPositionInjector` always places a nested card under its owner's control. A real card
            // (`EvidenceOfTheCrime` and several others) can leave a live board with a nested upgrade whose
            // controller differs from its owner; this document format cannot represent that, and the loader
            // must reject loudly naming the cause rather than surface a confusing "could not resolve a saved
            // card reference" or silently load the wrong controller. Reproducing that exact live scenario is
            // not necessary to exercise the failure: any other part of the document that independently names
            // the nested card's real controller (as `SavedCardRefResolver.resolve` does for every ordinary
            // watcher entry, from the card's live `controller` at save time) disagreeing with the owner seat
            // the card was placed under is the same detectable shape, so this synthesizes that disagreement
            // directly -- a minimal `CardsDrawnThisPhase` entry pointing at a synthetic nested upgrade.
            const document: ISavedMatch = JSON.parse(JSON.stringify(goodDocument));
            document.players[0].groundArena[0].upgrades.push({ card: 'academy-training', ownerSeat: 'p1' });

            const cardDataGetter = contextRef.context.game.cardDataGetter;
            let academyTrainingSetCode: string | undefined;
            for (const [setCode, internalId] of cardDataGetter.setCodeMap) {
                if (cardDataGetter.cardMap.get(internalId)?.internalName === 'academy-training') {
                    academyTrainingSetCode = setCode;
                    break;
                }
            }
            expect(academyTrainingSetCode).withContext('academy-training must resolve to a set code in the current card data')
                .toBeDefined();
            document.players[0].decklist.deck.push({ id: academyTrainingSetCode, count: 1 });

            document.stateWatchers.push({
                watcher: StateWatcherName.CardsDrawnThisPhase,
                entries: [{
                    player: 'p1',
                    card: {
                        card: 'academy-training',
                        controllerSeat: 'p2',
                        zone: null,
                        ordinal: null,
                        parent: { seat: 'p1', zone: 'groundArena', ordinal: 0, list: 'upgrades' },
                    },
                }],
            } as any);

            let caught: unknown;
            try {
                await loadAsync(document, buildLoadConfig(contextRef.context));
            } catch (error) {
                caught = error;
            }
            expect(caught).toBeInstanceOf(MatchLoadError);
            expect((caught as Error).message).toContain('cannot be represented');
        });

        it('does not gate on a cardDataVersion mismatch (documents a non-case)', async function() {
            const document: ISavedMatch = JSON.parse(JSON.stringify(goodDocument));
            document.cardDataVersion = 'some-other-version';
            const config = buildLoadConfig(contextRef.context, { currentCardDataVersion: 'the-current-version' });
            await expectAsync(loadAsync(document, config)).toBeResolved();
        });

        it('rejects a non-array players cleanly, rather than a raw TypeError', async function() {
            // `saved.players ?? []` only guards null/undefined; a non-array, non-null value (an object,
            // here) used to reach a bare `.map` call before validate()'s own structural throw, escaping as
            // a raw TypeError instead of a MatchLoadError naming the real cause.
            await expectRejection((doc) => {
                (doc as any).players = { not: 'an array' };
            });
        });

        it('rejects an out-of-range creditTokens count', async function() {
            // Measured against the unfixed loader: 5000 silently allocated 5000 real Card objects, 2.5
            // loaded a fractional count, and 1e7 hung for over 600s. This document only needs to demonstrate
            // the bound rejects; it does not attempt the pathological counts themselves.
            await expectRejection((doc) => {
                doc.players[0].creditTokens = 1_000_000;
            });
        });

        it('rejects a fractional creditTokens count', async function() {
            await expectRejection((doc) => {
                doc.players[0].creditTokens = 2.5;
            });
        });
    });
});
