
describe('Three Lessons', function () {
    integration(function (contextRef) {
        describe('Three Lessons\'s ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'han-solo#audacious-smuggler',
                        hand: ['three-lessons', 'rebel-pathfinder', 'alliance-xwing', 'vulptex'],
                        groundArena: ['battlefield-marine'],
                        resources: 10,
                    },
                    player2: {
                        groundArena: ['isb-agent'],
                        spaceArena: ['green-squadron-awing']
                    },
                });
            });

            it('should allow the player to play a ground unit, give it Hidden, give it an Experience token, and give it a Shield token', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.threeLessons);
                context.player1.clickCard(context.rebelPathfinder);

                expect(context.player1.exhaustedResourceCount).toBe(4);

                expect(context.rebelPathfinder).toHaveExactUpgradeNames(['experience', 'shield']);
                expect(context.rebelPathfinder.hasSomeKeyword('hidden')).toBeTrue();
                expect(context.player2).toBeActivePlayer();

                // the enter-play effects are logged as a single message crediting Three Lessons, not the played unit
                expect(context.getChatLogs(5)).toContain('player1 uses Three Lessons to give an Experience token to Rebel Pathfinder and to give a Shield token to Rebel Pathfinder');

                context.player2.clickCard(context.isbAgent);
                expect(context.player2).toBeAbleToSelectExactly([context.battlefieldMarine, context.p1Base]);
                context.player2.clickCard(context.p1Base);
                expect(context.player1).toBeActivePlayer();
            });

            it('should allow the player to play a space unit, give it Hidden, give it an Experience token, and give it a Shield token', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.threeLessons);
                context.player1.clickCard(context.allianceXwing);

                expect(context.player1.exhaustedResourceCount).toBe(4);

                expect(context.allianceXwing).toHaveExactUpgradeNames(['experience', 'shield']);
                expect(context.allianceXwing.hasSomeKeyword('hidden')).toBeTrue();
                expect(context.player2).toBeActivePlayer();

                context.player2.clickCard(context.greenSquadronAwing);
                expect(context.player2).toBeAbleToSelectExactly([context.p1Base]);
                context.player2.clickCard(context.p1Base);
                expect(context.player1).toBeActivePlayer();
            });

            it('should allow the player to play a unit that already has Hidden, give it an Experience token, and give it a Shield token', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.threeLessons);
                context.player1.clickCard(context.vulptex);

                expect(context.player1.exhaustedResourceCount).toBe(4);

                expect(context.vulptex).toHaveExactUpgradeNames(['experience', 'shield']);
                expect(context.vulptex.hasSomeKeyword('hidden')).toBeTrue();
                expect(context.player2).toBeActivePlayer();

                context.player2.clickCard(context.isbAgent);
                expect(context.player2).toBeAbleToSelectExactly([context.battlefieldMarine, context.p1Base]);
                context.player2.clickCard(context.p1Base);
                expect(context.player1).toBeActivePlayer();
            });
        });

        it('Three Lessons\'s ability should not allow selecting targets that can\'t be afforded', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['wampa', 'three-lessons'],
                    leader: 'han-solo#audacious-smuggler',
                    base: 'command-center',
                    resources: 3,
                    discard: ['timely-intervention', 'jedi-knight'],
                },
                player2: {
                    groundArena: ['rugged-survivors']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.threeLessons);
            context.player1.clickCard(context.wampa);

            expect(context.wampa).toBeInZone('hand');
            expect(context.player1.exhaustedResourceCount).toBe(2);
            expect(context.player2).toBeActivePlayer();
        });

        it('should do nothing when choosing nothing from hand', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['poe-dameron#quick-to-improvise', 'wampa', 'three-lessons'],
                    leader: 'han-solo#audacious-smuggler',
                    base: 'command-center',
                    resources: 10,
                    discard: ['atst', 'jedi-knight'],
                },
                player2: {
                    groundArena: ['rugged-survivors']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.threeLessons);
            context.player1.clickPrompt('Choose nothing');

            expect(context.player1.exhaustedResourceCount).toBe(2);

            expect(context.poeDameron).toBeInZone('hand');
            expect(context.wampa).toBeInZone('hand');
            expect(context.player2).toBeActivePlayer();
        });
        it('should only play pilots as units', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['poe-dameron#quick-to-improvise', 'wampa', 'three-lessons', 'luke-skywalker#you-still-with-me'],
                    spaceArena: ['wing-leader'],
                    leader: 'han-solo#audacious-smuggler',
                    base: 'command-center',
                    resources: 5,
                    discard: ['atst', 'jedi-knight'],
                },
                player2: {
                    groundArena: ['rugged-survivors']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.threeLessons);
            context.player1.clickCard(context.lukeSkywalkerYouStillWithMe);
            expect(context.player1.exhaustedResourceCount).toBe(4);

            expect(context.lukeSkywalkerYouStillWithMe).toBeInZone('groundArena');
            expect(context.lukeSkywalkerYouStillWithMe).toHaveExactUpgradeNames(['experience', 'shield']);
            expect(context.lukeSkywalkerYouStillWithMe.hasSomeKeyword('hidden')).toBeTrue();
            expect(context.player2).toBeActivePlayer();

            context.player2.clickCard(context.ruggedSurvivors);
            expect(context.player2).toBeAbleToSelectExactly([context.p1Base]);
            context.player2.clickCard(context.p1Base);
            expect(context.player1).toBeActivePlayer();
        });

        it('should let a low-HP unit survive Supreme Leader Snoke because the Experience token is given as it enters play', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['three-lessons', 'vulptex'],
                    resources: 10,
                },
                player2: {
                    groundArena: ['supreme-leader-snoke#shadow-ruler'],
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.threeLessons);
            context.player1.clickCard(context.vulptex);

            // Vulptex (3/2) + Experience is 4/3; with Snoke's -2/-2 it survives at 2/1.
            expect(context.vulptex).toBeInZone('groundArena');
            expect(context.vulptex).toHaveExactUpgradeNames(['experience', 'shield']);
            expect(context.vulptex.hasSomeKeyword('hidden')).toBeTrue();
            expect(context.player2).toBeActivePlayer();
        });

        // Ruling 2026-02-10: for a modified Play a Card action like "Play a unit and give it an
        // Experience token," the unit enters play and is given the token simultaneously. So a
        // low-HP unit can survive an enemy -X/-X aura that would otherwise defeat it on entry,
        // because the +1/+1 Experience (and Shield) are applied at the same time it enters.
        xit('a low-HP unit played under an enemy -2/-2 aura (Snoke) survives because the Experience is given simultaneously', function () {
            // Opponent controls Supreme Leader Snoke (each enemy non-leader unit gets -2/-2). Play a
            // 2-HP unit via Three Lessons. The unit enters and is given Experience (+1/+1) and a
            // Shield simultaneously, so it is not defeated by Snoke's -2/-2 on entry.
        });
    });
});