describe('The Axe Forgets', function() {
    integration(function(contextRef) {
        describe('The Axe Forgets\' ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['the-axe-forgets'],
                        groundArena: ['battlefield-marine', 'wampa'],
                        spaceArena: ['alliance-xwing']
                    },
                    player2: {
                        groundArena: ['pyke-sentinel', 'atst'],
                        leader: { card: 'darth-vader#dark-lord-of-the-sith', deployed: true }
                    }
                });
            });

            it('should return a non-leader unit that costs 3 or less to its owner\'s hand', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.theAxeForgets);

                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.allianceXwing, context.pykeSentinel]);

                context.player1.clickCard(context.pykeSentinel);
                expect(context.pykeSentinel).toBeInZone('hand', context.player2);
                expect(context.player2).toBeActivePlayer();
            });

            it('should be able to return a friendly unit to hand', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.theAxeForgets);

                context.player1.clickCard(context.battlefieldMarine);
                expect(context.battlefieldMarine).toBeInZone('hand', context.player1);
                expect(context.player2).toBeActivePlayer();
            });
        });

        it('should prompt to play anyway when there are no valid targets', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['the-axe-forgets'],
                    groundArena: ['wampa']
                },
                player2: {
                    groundArena: ['atst']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.theAxeForgets);

            expect(context.player1).toHavePrompt('Playing The Axe Forgets will have no effect. Are you sure you want to play it?');
            context.player1.clickPrompt('Play anyway');

            // Event should resolve with no effect
            expect(context.theAxeForgets).toBeInZone('discard');
            expect(context.wampa).toBeInZone('groundArena');
            expect(context.atst).toBeInZone('groundArena');
            expect(context.player2).toBeActivePlayer();
        });
    });
});
