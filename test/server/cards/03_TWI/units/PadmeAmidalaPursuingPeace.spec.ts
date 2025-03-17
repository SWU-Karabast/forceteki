describe('Padme Amidala, Pursuing Peace', function() {
    integration(function(contextRef) {
        it('should give -3/-0 to an enemy unit on attack with coordination active for this phase', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['padme-amidala#pursuing-peace', 'escort-skiff'],
                    spaceArena: ['tie-advanced']
                },
                player2: {
                    groundArena: ['wampa']
                }
            });

            const { context } = contextRef;

            // attack with coordinate and confirm effect
            context.player1.clickCard(context.padmeAmidala);
            context.player1.clickCard(context.p2Base);
            context.player1.clickCard(context.wampa);
            expect(context.wampa.getPower()).toBe(1);

            // move to next phase and confirm effect has ended
            context.moveToNextActionPhase();
            expect(context.wampa.getPower()).toBe(4);
        });

        it('should not give -3/-0 to an enemy unit on attack with coordination not active', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['padme-amidala#pursuing-peace'],
                },
                player2: {
                    groundArena: ['wampa']
                }
            });

            const { context } = contextRef;

            // attack without coordinate and confirm no effect
            context.player1.clickCard(context.padmeAmidala);
            context.player1.clickCard(context.p2Base);
            expect(context.wampa.getPower()).toBe(4);
        });
    });
});