describe('Captain Typho, Protecting The Senator', function () {
    integration(function (contextRef) {
        describe('Captain Typho, Protecting The Senator\'s ability', function () {
            it('should give Sentinel to a friendly unit', function () {
                contextRef.setupTest({
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
                // consular security force is automatically choose because of Sentinel
                expect(context.consularSecurityForce.damage).toBe(4);
            });

            it('should give Sentinel to an enemy unit', function () {
                contextRef.setupTest({
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
                context.player1.clickCard(context.wampa);

                expect(context.player2).toBeActivePlayer();

                context.player2.passAction();
                context.player1.clickCard(context.consularSecurityForce);
                // Wampa is automatically choose because of Sentinel
                expect(context.wampa.damage).toBe(3);
            });

            it('should give Sentinel to itself', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['captain-typho#protecting-the-senator'],
                        groundArena: ['atst']
                    },
                    player2: {
                        groundArena: ['consular-security-force'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.captainTyphoProtectingTheSenator);
                expect(context.player1).toBeAbleToSelectExactly([context.captainTyphoProtectingTheSenator, context.consularSecurityForce, context.atst]);
                context.player1.clickCard(context.captainTyphoProtectingTheSenator);

                expect(context.player2).toBeActivePlayer();

                context.player2.clickCard(context.consularSecurityForce);
                // Captain Typho is automatically choose because of Sentinel
                expect(context.captainTyphoProtectingTheSenator.damage).toBe(3);
            });

            it('should give Sentinel on attack', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['captain-typho#protecting-the-senator', 'atst']
                    },
                    player2: {
                        groundArena: ['consular-security-force'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.captainTyphoProtectingTheSenator);
                context.player1.clickCard(context.consularSecurityForce);

                expect(context.player1).toBeAbleToSelectExactly([context.captainTyphoProtectingTheSenator, context.consularSecurityForce, context.atst]);
                context.player1.clickCard(context.atst);

                expect(context.player2).toBeActivePlayer();
                context.player2.clickCard(context.consularSecurityForce);
                // AT-ST is automatically choose because of Sentinel
                expect(context.atst.damage).toBe(3);
            });
        });
    });
});
