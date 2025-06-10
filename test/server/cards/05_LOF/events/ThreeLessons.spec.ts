
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
    });
});