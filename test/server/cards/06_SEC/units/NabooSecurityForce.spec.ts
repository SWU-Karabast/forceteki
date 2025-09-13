describe('Naboo Security Force', function () {
    integration(function (contextRef) {
        describe('Naboo Security Force\'s when played ability', function () {
            beforeEach(async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['naboo-security-force', 'salvage'], // Salvage has Command for disclose
                        groundArena: ['battlefield-marine']
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });
            });

            it('should, after disclosing Command, give Sentinel and force opponent to attack that unit', function () {
                const { context } = contextRef;

                // Play Naboo Security Force and disclose Command via Salvage
                context.player1.clickCard(context.nabooSecurityForce);
                context.player1.clickCard(context.salvage);
                // Opponent sees the disclosed card
                context.player2.clickDone();

                // Choose the friendly unit to gain Sentinel
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.nabooSecurityForce]);
                context.player1.clickCard(context.battlefieldMarine);

                // Opponent attempts to attack; must target the Sentinel unit this phase
                context.player2.clickCard(context.wampa);
                expect(context.player2).toBeAbleToSelectExactly([context.battlefieldMarine]);
                context.player2.clickCard(context.battlefieldMarine);
            });

            it('should do nothing if player declines to disclose', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.nabooSecurityForce);
                // Decline to disclose even though possible
                expect(context.player1).toHaveEnabledPromptButton('Choose nothing');
                context.player1.clickPrompt('Choose nothing');

                // No Sentinel is granted; opponent can choose among normal targets
                context.player2.clickCard(context.wampa);

                // Can attack base or battlefield marine (no sentinel restriction)
                expect(context.player2).toBeAbleToSelectExactly([context.battlefieldMarine, context.nabooSecurityForce, context.p1Base]);
                context.player2.clickCard(context.p1Base);
            });
        });

        describe('Naboo Security Force\'s when defeated ability', function () {
            beforeEach(async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['salvage'],
                        groundArena: ['battlefield-marine', 'naboo-security-force']
                    },
                    player2: {
                        hasInitiative: true,
                        hand: ['superlaser-technician', 'no-glory-only-results'],
                        groundArena: ['wampa', 'atat-suppressor']
                    }
                });
            });

            it('should, after disclosing Command, give Sentinel and force opponent to attack that unit', function () {
                const { context } = contextRef;

                context.player2.clickCard(context.atatSuppressor);
                context.player2.clickCard(context.nabooSecurityForce);

                expect(context.player1).toHaveEnabledPromptButton('Choose nothing');
                context.player1.clickCard(context.salvage);
                // Opponent sees the disclosed card
                context.player2.clickDone();

                // Choose the friendly unit to gain Sentinel
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine]);
                context.player1.clickCard(context.battlefieldMarine);

                context.player1.passAction();

                // Opponent attempts to attack; must target the Sentinel unit this phase
                context.player2.clickCard(context.wampa);
                expect(context.player2).toBeAbleToSelectExactly([context.battlefieldMarine]);
                context.player2.clickCard(context.battlefieldMarine);
            });

            it('should, after disclosing Command, give Sentinel and force opponent to attack that unit (No Glory Only Results test)', function () {
                const { context } = contextRef;

                context.player2.clickCard(context.noGloryOnlyResults);
                context.player2.clickCard(context.nabooSecurityForce);

                expect(context.player2).toHaveEnabledPromptButton('Choose nothing');
                context.player2.clickCard(context.superlaserTechnician);
                // Opponent sees the disclosed card
                context.player1.clickDone();

                // Choose the friendly unit to gain Sentinel
                expect(context.player2).toBeAbleToSelectExactly([context.wampa, context.atatSuppressor]);
                context.player2.clickCard(context.wampa);

                // Opponent attempts to attack; must target the Sentinel unit this phase
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.player1).toBeAbleToSelectExactly([context.wampa]);
                context.player1.clickCard(context.wampa);
            });
        });
    });
});
