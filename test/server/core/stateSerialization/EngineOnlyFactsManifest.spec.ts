import { save } from '../../../../server/game/core/stateSerialization/MatchSerializer';

/**
 * `P2-E` group 3 (AC5): every existing manifest-category shape spec locates its fact with `.find(...)` and
 * asserts nothing about the rest of the manifest. This establishes the complete manifest, per category:
 * "and nothing else". See `.anvil/p2-e/plan-rev1.md` §3 step 4.
 */
describe('EngineOnlyFacts — complete manifest per category', function() {
    integration(function(contextRef) {
        it('pilotLeader — a pilot-attached leader emits exactly one fact naming the host', async function() {
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

            expect(document.engineOnlyFacts.length).toBe(1);
            const fact = document.engineOnlyFacts[0];
            expect(fact.category).toBe('pilotLeader');
            expect(fact.source).toEqual({ card: 'poe-dameron#i-can-fly-anything', controllerSeat: 'p1', zone: 'leader', ordinal: 0 });
            expect((fact.target as { card: string }).card).toBe('millennium-falcon#piece-of-junk');
            expect(fact.duration).toBeNull();
            expect(fact.description).toContain('pilot');
        });

        it('gainedAbility — a spent Improvised Identity grant emits exactly one fact', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: [{ card: 'wampa', upgrades: ['improvised-identity'] }],
                },
            });
            const { context } = contextRef;
            const grantedAbility = context.wampa.getActionAbilities().find((ability) => ability.printedAbility === false);
            expect(grantedAbility).toBeDefined();
            grantedAbility.limit.increment(context.player1Object);

            const document = save(context.game);

            expect(document.engineOnlyFacts.length).toBe(1);
            const fact = document.engineOnlyFacts[0];
            expect(fact.category).toBe('gainedAbility');
            expect((fact.source as { card: string }).card).toBe('improvised-identity');
            expect((fact.target as { card: string }).card).toBe('wampa');
            expect(fact.description).toContain('use count is not preserved');
        });

        it('lastingEffect — an active forThisPhaseCardEffect (Disarm) emits exactly one fact', async function() {
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

            expect(document.engineOnlyFacts.length).toBe(1);
            const fact = document.engineOnlyFacts[0];
            expect(fact.category).toBe('lastingEffect');
            expect((fact.source as { card: string }).card).toBe('disarm');
            expect((fact.target as { card: string }).card).toBe('atst');
            expect(fact.duration).toBe('untilEndOfPhase');
        });

        it('delayedEffect — a pending delayed effect (Jetpack) emits exactly one fact', async function() {
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

            expect(document.engineOnlyFacts.length).toBe(1);
            const fact = document.engineOnlyFacts[0];
            expect(fact.category).toBe('delayedEffect');
            expect(fact.duration).toBe('persistent');
            expect((fact.source as { card: string }).card).toBe('jetpack');
            expect((fact.target as { card: string }).card).toBe('shield');
        });

        it('watcherEntry — an unresolvable referent (a removed token) drops every entry that named it, and nothing else', async function() {
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
            const [removedToken] = context.player1.findCardsByName('battle-droid');

            context.player2.clickCard(context.vanquish);
            context.player2.clickCard(removedToken);
            // AsToken.removeFromGame nulls the zone but leaves the object registered, so every watcher
            // entry that recorded this token's id still holds a live id that occupies no position anywhere
            // in the document -- more than one watcher recorded it (its creation and its defeat), so this
            // is the exact-set form rather than a single exact value.
            context.game.removeTokenFromPlay(removedToken);

            const document = save(context.game);
            const watcherFacts = document.engineOnlyFacts.filter((fact) => fact.category === 'watcherEntry');

            // Exact-set: every fact in the manifest is a watcherEntry fact naming this drop, and nothing else.
            expect(document.engineOnlyFacts.length).toBe(watcherFacts.length);
            expect(watcherFacts.length).toBeGreaterThan(0);
            for (const fact of watcherFacts) {
                expect(fact.target).toBeNull();
                expect(fact.description).toMatch(/^[\w-]+ entry \d+ dropped: field "[\w.]+" \w/);
            }
            // Every drop traces back to the same removed token's watcher name(s); the total count is
            // pinned to what this exact fixture produces so a future regression that drops (or gains) an
            // extra entry is visible here rather than only at the `.find(...)`-level shape specs. The
            // removed token was created (tokensCreatedThisPhase), entered play (cardsEnteredPlayThisPhase),
            // was defeated by Vanquish (cardsDefeatedThisPhase), and then left play for good
            // (cardsLeftPlayThisPhase) -- four separate watchers each recorded it once, and
            // `removeTokenFromPlay` makes every one of those recorded referents unresolvable.
            const droppedWatcherNames = watcherFacts.map((fact) => fact.description.split(' entry ')[0]).sort();
            expect(droppedWatcherNames).toEqual(['cardsDefeatedThisPhase', 'cardsEnteredPlayThisPhase', 'cardsLeftPlayThisPhase', 'tokensCreatedThisPhase']);
        });
    });
});
