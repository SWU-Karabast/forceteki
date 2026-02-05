describe('Payroll Heist', function () {
    integration(function (contextRef) {
        describe('Payroll Heist\'s ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['payroll-heist'],
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['alliance-xwing']
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: ['cartel-spacer']
                    }
                });
            });

            it('should give all friendly units \'On Attack: Create a Credit token\' for this phase', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.payrollHeist);
                context.player2.passAction();
                expect(context.player1.credits).toBe(0);

                // Attack with Battlefield Marine
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.p2Base);
                expect(context.player1.credits).toBe(1);
                expect(context.player2.credits).toBe(0);

                // Player 2 attacks with Wampa no effect
                context.player2.clickCard(context.wampa);
                context.player2.clickCard(context.p1Base);
                expect(context.player1.credits).toBe(1);
                expect(context.player2.credits).toBe(0);

                // Attack with Alliance X-Wing
                context.player1.clickCard(context.allianceXwing);
                context.player1.clickCard(context.p2Base);
                expect(context.player1.credits).toBe(2);
                expect(context.player2.credits).toBe(0);

                // Player 2 attacks with Cartel Spacer no effect
                context.player2.clickCard(context.cartelSpacer);
                context.player2.clickCard(context.p1Base);
                expect(context.player1.credits).toBe(2);
                expect(context.player2.credits).toBe(0);

                // Next action phase, effect should be gone
                context.moveToNextActionPhase();
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.p2Base);
                expect(context.player1.credits).toBe(2);
                expect(context.player2.credits).toBe(0);
            });
        });

        it('Payroll Heist\'s ability should have no effect when there are no units in play', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['payroll-heist']
                },
                player2: {}
            });

            const { context } = contextRef;

            context.player1.clickCard(context.payrollHeist);

            expect(context.player1).toHavePrompt('Playing Payroll Heist will have no effect. Are you sure you want to play it?');
            expect(context.player1).toHaveExactPromptButtons(['Play anyway', 'Cancel']);

            context.player1.clickPrompt('Play anyway');

            expect(context.payrollHeist).toBeInZone('discard');
            expect(context.player2).toBeActivePlayer();
        });

        it('Payroll Heist\'s ability should have no effect for new units that enters play', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['payroll-heist', 'millennium-falcon#piece-of-junk'],
                    groundArena: ['battlefield-marine'],
                    spaceArena: ['alliance-xwing']
                },
                player2: {
                    groundArena: ['wampa'],
                    spaceArena: ['cartel-spacer']
                }
            });

            const { context } = contextRef;

            // Play Payroll Heist
            context.player1.clickCard(context.payrollHeist);

            // Player 2 passes
            context.player2.passAction();

            // Attack with Battlefield Marine
            context.player1.clickCard(context.battlefieldMarine);
            context.player1.clickCard(context.p2Base);
            expect(context.player1.credits).toBe(1);
            expect(context.player2.credits).toBe(0);

            // Player 2 passes
            context.player2.passAction();

            // Millenium Falcon enters play ready, ability should not trigger
            context.player1.clickCard(context.millenniumFalconPieceOfJunk);
            context.player1.clickPrompt('Pay costs without Credit tokens');
            context.player2.passAction();
            context.player1.clickCard(context.millenniumFalconPieceOfJunk);
            context.player1.clickCard(context.p2Base);
            expect(context.player1.credits).toBe(1);
            expect(context.player2.credits).toBe(0);

            // Player 2 passes
            context.player2.passAction();
        });
    });
});