describe('Phee Genoa, Liberator of Ancient Wonders', function() {
    integration(function(contextRef) {
        describe('Phee Genoa\'s triggered ability', function() {
            beforeEach(async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['phee-genoa#liberator-of-ancient-wonders'],
                        leader: 'sabine-wren#galvanized-revolutionary',
                    },
                    player2: {
                        leader: 'boba-fett#collecting-the-bounty',
                    }
                });
            });

            it('should exhaust the enemy leader when its controller does not pay 2 resources', function() {
                const { context } = contextRef;

                context.player1.passAction();

                context.player2.clickCard(context.bobaFett);
                context.player2.clickPrompt('Deploy Boba Fett');

                expect(context.player2).toHavePrompt('[Exhaust] Boba Fett or [Pay] 2 resources');
                expect(context.player2).toHaveEnabledPromptButtons(['Pay', 'Exhaust']);
                context.player2.clickPrompt('Exhaust');

                expect(context.bobaFett.deployed).toBeTrue();
                expect(context.bobaFett.exhausted).toBeTrue();
                expect(context.player2.exhaustedResourceCount).toBe(0);
                expect(context.player1).toBeActivePlayer();
            });

            it('should not exhaust the enemy leader when its controller pays 2 resources', function() {
                const { context } = contextRef;

                context.player1.passAction();

                context.player2.clickCard(context.bobaFett);
                context.player2.clickPrompt('Deploy Boba Fett');

                expect(context.player2).toHaveEnabledPromptButtons(['Pay', 'Exhaust']);
                context.player2.clickPrompt('Pay');

                expect(context.bobaFett.deployed).toBeTrue();
                expect(context.bobaFett.exhausted).toBeFalse();
                expect(context.player2.exhaustedResourceCount).toBe(2);
                expect(context.player1).toBeActivePlayer();
            });

            it('should exhaust the enemy leader without prompting when its controller cannot pay 2 resources', function() {
                const { context } = contextRef;

                context.player1.passAction();
                context.player2.exhaustResources(19);

                context.player2.clickCard(context.bobaFett);
                context.player2.clickPrompt('Deploy Boba Fett');

                expect(context.bobaFett.deployed).toBeTrue();
                expect(context.bobaFett.exhausted).toBeTrue();
                expect(context.player2.exhaustedResourceCount).toBe(19);
                expect(context.player1).toBeActivePlayer();
            });

            it('should not trigger when a friendly leader deploys', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.sabineWren);
                context.player1.clickPrompt('Deploy Sabine Wren');

                expect(context.sabineWren.deployed).toBeTrue();
                expect(context.sabineWren.exhausted).toBeFalse();
                expect(context.player1.exhaustedResourceCount).toBe(0);
                expect(context.player2).toBeActivePlayer();
            });
        });

        it('Phee Genoa\'s triggered ability should not trigger when an enemy leader deploys as a pilot', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['phee-genoa#liberator-of-ancient-wonders'],
                },
                player2: {
                    leader: 'wedge-antilles#leader-of-red-squadron',
                    spaceArena: ['cartel-spacer'],
                }
            });

            const { context } = contextRef;

            context.player1.passAction();

            context.player2.clickCard(context.wedgeAntilles);
            context.player2.clickPrompt('Deploy Wedge Antilles as a Pilot');
            context.player2.clickCard(context.cartelSpacer);

            expect(context.wedgeAntilles).toBeAttachedTo(context.cartelSpacer);
            expect(context.player2.exhaustedResourceCount).toBe(0);
            expect(context.player1).toBeActivePlayer();
        });
    });
});
