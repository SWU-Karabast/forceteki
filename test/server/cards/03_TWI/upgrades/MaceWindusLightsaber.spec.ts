describe('Mace Windu\'s Lightsaber', function() {
    integration(function(contextRef) {
        describe('Mace Windu\'s Lightsaber\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['mace-windus-lightsaber'],
                        groundArena: ['mace-windu#party-crasher', 'battlefield-marine'],
                        leader: { card: 'mace-windu#vaapad-form-master', deployed: true }
                    }
                });
            });

            it('should draw 2 cards when played on your Mace Windu unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.maceWindusLightsaber);
                expect(context.player1).toBeAbleToSelectExactly([context.maceWinduPartyCrasher, context.maceWinduVaapadFormMaster, context.battlefieldMarine]);

                context.player1.clickCard(context.maceWinduPartyCrasher);

                expect(context.player1.hand.length).toBe(2);
                expect(context.player2.hand.length).toBe(0);
                expect(context.player2).toBeActivePlayer();
            });

            it('should draw 2 cards when played on your Mace Windu leader', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.maceWindusLightsaber);
                expect(context.player1).toBeAbleToSelectExactly([context.maceWinduPartyCrasher, context.maceWinduVaapadFormMaster, context.battlefieldMarine]);

                context.player1.clickCard(context.maceWinduVaapadFormMaster);

                expect(context.player1.hand.length).toBe(2);
                expect(context.player2.hand.length).toBe(0);
                expect(context.player2).toBeActivePlayer();
            });

            it('should have no effect on any unit other than Mace Windu', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.maceWindusLightsaber);
                expect(context.player1).toBeAbleToSelectExactly([context.maceWinduPartyCrasher, context.maceWinduVaapadFormMaster, context.battlefieldMarine]);

                context.player1.clickCard(context.battlefieldMarine);

                expect(context.player1.hand.length).toBe(0);
                expect(context.player2.hand.length).toBe(0);
                expect(context.player2).toBeActivePlayer();
            });
        });

        it('Mace Windu\'s Lightsaber\'s ability should draw 2 cards when played on your opponent\'s Mace Windu unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['mace-windus-lightsaber']
                },
                player2: {
                    groundArena: ['mace-windu#party-crasher']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.maceWindusLightsaber);
            expect(context.player1).toBeAbleToSelectExactly([context.maceWinduPartyCrasher]);

            context.player1.clickCard(context.maceWinduPartyCrasher);

            expect(context.player1.hand.length).toBe(2);
            expect(context.player2.hand.length).toBe(0);
            expect(context.player2).toBeActivePlayer();
        });
    });
});
