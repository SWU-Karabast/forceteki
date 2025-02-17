describe('Captain Typho, Protecting The Senator', function () {
    integration(function (contextRef) {
        describe('Captain Typho, Protecting The Senator\'s ability', function () {
            it('should give Sentinel to a friendly unit when played and on attack', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['captain-typho#protecting-the-senator'],
                        groundArena: ['consular-security-force']
                    },
                    player2: {
                        groundArena: ['wampa'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.captainTyphoProtectingTheSenator);
                expect(context.player1).toBeAbleToSelectExactly([context.captainTyphoProtectingTheSenator, context.consularSecurityForce, context.wampa]);
                context.player1.clickCard(context.consularSecurityForce);

                expect(context.player2).toBeActivePlayer();
                context.player2.clickCard(context.wampa);

                // Consular security force is only option available because of Sentinel
                expect(context.player2).toBeAbleToSelectExactly(context.consularSecurityForce);

                context.player2.clickCard(context.consularSecurityForce);
                expect(context.consularSecurityForce.damage).toBe(4);

                // Testing on attack
                context.moveToNextActionPhase();

                context.player1.clickCard(context.captainTyphoProtectingTheSenator);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toBeAbleToSelectExactly([context.captainTyphoProtectingTheSenator, context.consularSecurityForce, context.wampa]);
                context.player1.clickCard(context.captainTyphoProtectingTheSenator); // Gives Sentinel to itself

                // Captain Typho only available option as it has Sentinel and Consular Security Force lost previous phase Sentinel
                context.player2.clickCard(context.wampa);
                expect(context.player2).toBeAbleToSelectExactly([context.captainTyphoProtectingTheSenator]);
                context.player2.clickCard(context.captainTyphoProtectingTheSenator);
            });
        });
    });
});
