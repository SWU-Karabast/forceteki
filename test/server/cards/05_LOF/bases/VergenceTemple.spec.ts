describe('Vergence Temple\'s ability', function() {
    integration(function(contextRef) {
        it('should do nothing if your opponent controls a unit with 4 or more HP', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    base: 'vergence-temple'
                },
                player2: {
                    groundArena: ['wampa']
                }
            });

            const { context } = contextRef;

            expect(context.player1.hasTheForce).toBe(false);
            context.player1.claimInitiative();
            context.player2.passAction();
            expect(context.player1.hasTheForce).toBe(false);
        });

        it('should do nothing if you don\'t control a unit with 4 or more HP', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    base: 'vergence-temple',
                    groundArena: [{ card: 'wampa', damage: 2 }]
                }
            });

            const { context } = contextRef;

            expect(context.player1.hasTheForce).toBe(false);
            context.player1.claimInitiative();
            context.player2.passAction();
            expect(context.player1.hasTheForce).toBe(false);
        });

        it('should give the Force if you control a unit with 4 or more health at the start of the Regroup phase', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    base: 'vergence-temple',
                    groundArena: ['wampa']
                }
            });

            const { context } = contextRef;

            expect(context.player1.hasTheForce).toBe(false);
            context.player1.claimInitiative();
            context.player2.passAction();
            expect(context.player1.hasTheForce).toBe(true);
        });

        // it('should give the Force if you control a stolen unit with 4 or more health at the start of the Regroup phase', async function () {
        //     await contextRef.setupTestAsync({
        //         phase: 'action',
        //         player1: {
        //             base: 'vergence-temple',
        //             hand: ['change-of-heart']
        //         },
        //         player2: {
        //             groundArena: ['wampa']
        //         }
        //     });

        //     const { context } = contextRef;

        //     expect(context.player1.hasTheForce).toBe(false);

        //     context.player1.clickCard(context.changeOfHeart);
        //     context.player1.clickCard(context.wampa);

        //     context.player2.passAction();
        //     context.player1.claimInitiative();

        //     expect(context.player1).toHavePrompt('');
        //     expect(context.player1.hasTheForce).toBe(true);
        // });
    });
});
