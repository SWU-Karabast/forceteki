describe('Darth Vader, Useless to Resist', function() {
    integration(function(contextRef) {
        describe('Darth Vader\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['wampa', 'atst'],
                        groundArena: ['darth-vader#useless-to-resist'],
                    },
                    player2: {
                        hand: ['sundari-peacekeeper'],
                        groundArena: ['battlefield-marine']
                    }
                });
            });

            it('should give Ambush to each other friendly unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.wampa);

                expect(context.player1).toHavePassAbilityPrompt('Ambush');
                context.player1.clickPrompt('Trigger');

                context.player1.clickCard(context.battlefieldMarine);

                expect(context.player2).toBeActivePlayer();
            });

            it('should give Ambush to each other friendly unit (higher cost)', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.atst);

                expect(context.player1).toHavePassAbilityPrompt('Ambush');
                context.player1.clickPrompt('Trigger');

                context.player1.clickCard(context.battlefieldMarine);

                expect(context.player2).toBeActivePlayer();
            });

            it('should not give Ambush to enemy units', function () {
                const { context } = contextRef;

                context.player1.passAction();

                context.player2.clickCard(context.sundariPeacekeeper);

                expect(context.player1).toBeActivePlayer();
            });
        });

        it('should give Ambush to each other friendly unit (even after played)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['darth-vader#useless-to-resist', 'wampa'],
                    leader: { card: 'boba-fett#daimyo', deployed: true }
                },
            });

            const { context } = contextRef;

            expect(context.wampa.getPower()).toBe(5);
            expect(context.wampa.getHp()).toBe(5);
        });
    });
});
