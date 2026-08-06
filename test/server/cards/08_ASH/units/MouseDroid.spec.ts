describe('Mouse Droid', function() {
    integration(function(contextRef) {
        it('Mouse Droid\'s ability should discount the next Imperial unit played', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['mouse-droid', 'iden-versio#adapt-or-die', 'academy-graduate', 'wampa'],
                    leader: 'qira#i-alone-survived',
                },
                player2: {
                    hand: ['atst'],
                    leader: 'major-vonreg#red-baron'
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.mouseDroid);

            expect(context.player2).toBeActivePlayer();
            expect(context.player1.exhaustedResourceCount).toBe(1);

            context.player2.clickCard(context.atst);

            expect(context.player1).toBeActivePlayer();
            expect(context.player2.exhaustedResourceCount).toBe(6);

            context.player1.clickCard(context.idenVersio);

            expect(context.player2).toBeActivePlayer();
            expect(context.player1.exhaustedResourceCount).toBe(4);

            context.player2.passAction();
            context.player1.clickCard(context.academyGraduate);

            expect(context.player2).toBeActivePlayer();
            expect(context.player1.exhaustedResourceCount).toBe(6);
        });

        it('Mouse Droid\'s ability should not discount an Imperial unit played with Piloting', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['mouse-droid', 'iden-versio#adapt-or-die', 'atst'],
                    leader: 'qira#i-alone-survived',
                    spaceArena: ['awing']
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.mouseDroid);

            expect(context.player1.exhaustedResourceCount).toBe(1);
            context.player2.passAction();

            context.player1.clickCard(context.idenVersio);
            context.player1.clickPrompt('Play Iden Versio with Piloting');
            context.player1.clickCard(context.awing);

            expect(context.player1.exhaustedResourceCount).toBe(4);
            context.player2.passAction();

            context.player1.clickCard(context.atst);

            expect(context.player2).toBeActivePlayer();
            expect(context.player1.exhaustedResourceCount).toBe(9);
        });

        it('Mouse Droid\'s ability should expire at end of phase', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['mouse-droid', 'iden-versio#adapt-or-die', 'academy-graduate', 'wampa'],
                    leader: 'qira#i-alone-survived',
                },
                player2: {
                    hand: ['atst']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.mouseDroid);

            expect(context.player2).toBeActivePlayer();
            expect(context.player1.exhaustedResourceCount).toBe(1);

            context.moveToNextActionPhase();

            context.player1.clickCard(context.idenVersio);

            expect(context.player2).toBeActivePlayer();
            expect(context.player1.exhaustedResourceCount).toBe(4);
        });

        it('Mouse Droid\'s ability should not discount the next Imperial event', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['mouse-droid', 'the-emperors-legion'],
                    leader: 'qira#i-alone-survived',
                    base: 'echo-base'
                },
                player2: {
                    hand: ['atst']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.mouseDroid);

            expect(context.player2).toBeActivePlayer();
            expect(context.player1.exhaustedResourceCount).toBe(1);

            context.player2.passAction();

            context.player1.clickCard(context.theEmperorsLegion);
            context.player1.clickPrompt('Play anyway');

            expect(context.player2).toBeActivePlayer();
            expect(context.player1.exhaustedResourceCount).toBe(3);
        });
    });
});
