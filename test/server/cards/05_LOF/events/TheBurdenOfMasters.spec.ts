describe('The Burden Of Masters', function () {
    integration(function (contextRef) {
        describe('The Burden of Masters\'s ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'hera-syndulla#spectre-two',
                        hand: ['the-burden-of-masters', 'rebel-pathfinder', 'alliance-xwing'],
                        groundArena: ['battlefield-marine'],
                        resources: 10,
                        discard: ['timely-intervention', 'jedi-knight'],
                    },
                    player2: {
                        groundArena: ['isb-agent'],
                    },
                });
            });

            it('should allow the player to put a Force unit from the discard pile on the bottom of the deck, then play a unit and give it 2 experience', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.theBurdenOfMasters);

                context.player1.clickCard(context.jediKnight);
                expect(context.jediKnight).toBeInBottomOfDeck(context.player1, 1);
                expect(context.player1.exhaustedResourceCount).toBe(1);

                context.player1.clickCard(context.rebelPathfinder);
                expect(context.rebelPathfinder).toHaveExactUpgradeNames(['experience', 'experience']);
                expect(context.player2).toBeActivePlayer();
            });
        });

        it('The Burden of Masters\'s ability should not allow selecting targets that can\'t be afforded', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['poe-dameron#quick-to-improvise', 'the-burden-of-masters'],
                    leader: 'han-solo#worth-the-risk',
                    base: 'command-center',
                    resources: 5,
                    discard: ['timely-intervention', 'jedi-knight'],
                },
                player2: {
                    groundArena: ['rugged-survivors']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.theBurdenOfMasters);

            context.player1.clickCard(context.jediKnight);
            expect(context.player1.exhaustedResourceCount).toBe(1);
            expect(context.jediKnight).toBeInBottomOfDeck(context.player1, 1);
            expect(context.player2).toBeActivePlayer();
        });

        it('should do nothing when choosing nothing from discard', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['poe-dameron#quick-to-improvise', 'wampa', 'the-burden-of-masters'],
                    leader: 'han-solo#worth-the-risk',
                    base: 'command-center',
                    resources: 5,
                    discard: ['atst'],
                },
                player2: {
                    groundArena: ['rugged-survivors']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.theBurdenOfMasters);
            context.player1.clickPrompt('Play Anyway');

            expect(context.player1).toBeAbleToSelectNoneOf([context.poeDameron, context.wampa]);

            expect(context.poeDameron).toBeInZone('hand');
            expect(context.wampa).toBeInZone('hand');
            expect(context.player2).toBeActivePlayer();
        });

        it('should do nothing when choosing nothing from hand', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['poe-dameron#quick-to-improvise', 'wampa', 'the-burden-of-masters'],
                    leader: 'han-solo#worth-the-risk',
                    base: 'command-center',
                    resources: 5,
                    discard: ['atst', 'jedi-knight'],
                },
                player2: {
                    groundArena: ['rugged-survivors']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.theBurdenOfMasters);

            context.player1.clickCard(context.jediKnight);
            expect(context.jediKnight).toBeInBottomOfDeck(context.player1, 1);
            expect(context.player1.exhaustedResourceCount).toBe(1);
            context.player1.clickPrompt('Choose nothing');

            expect(context.poeDameron).toBeInZone('hand');
            expect(context.wampa).toBeInZone('hand');
            expect(context.player2).toBeActivePlayer();
        });
        it('should only play pilots as units', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['poe-dameron#quick-to-improvise', 'wampa', 'the-burden-of-masters', 'luke-skywalker#you-still-with-me'],
                    spaceArena: ['wing-leader'],
                    leader: 'han-solo#worth-the-risk',
                    base: 'command-center',
                    resources: 5,
                    discard: ['atst', 'jedi-knight'],
                },
                player2: {
                    groundArena: ['rugged-survivors']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.theBurdenOfMasters);

            context.player1.clickCard(context.jediKnight);
            expect(context.jediKnight).toBeInBottomOfDeck(context.player1, 1);
            expect(context.player1.exhaustedResourceCount).toBe(1);
            context.player1.clickCard(context.lukeSkywalkerYouStillWithMe);

            expect(context.lukeSkywalkerYouStillWithMe).toBeInZone('groundArena');
            expect(context.lukeSkywalkerYouStillWithMe).toHaveExactUpgradeNames(['experience', 'experience']);
            expect(context.player2).toBeActivePlayer();
        });
    });
});