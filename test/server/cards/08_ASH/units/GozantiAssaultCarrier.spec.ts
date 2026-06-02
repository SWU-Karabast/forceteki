describe('Gozanti Assault Carrier', function() {
    integration(function(contextRef) {
        it('Gozanti Assault Carrier\'s ability should gain Sentinel for the phase when attacking', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    spaceArena: ['gozanti-assault-carrier']
                },
                player2: {
                    spaceArena: ['awing', 'green-squadron-awing']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.gozantiAssaultCarrier);
            context.player1.clickCard(context.p2Base);

            context.player2.clickCard(context.awing);
            expect(context.player2).toBeAbleToSelectExactly([context.gozantiAssaultCarrier]);

            context.player2.clickCard(context.gozantiAssaultCarrier);

            context.moveToNextActionPhase();

            context.player1.passAction();
            context.player2.clickCard(context.greenSquadronAwing);

            expect(context.player2).toBeAbleToSelectExactly([context.gozantiAssaultCarrier, context.p1Base]);
            context.player2.clickCard(context.p1Base);
        });

        it('Gozanti Assault Carrier\'s support ability should give Sentinel to the attacking unit for the phase', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['gozanti-assault-carrier'],
                    groundArena: ['wampa']
                },
                player2: {
                    groundArena: ['battlefield-marine']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.gozantiAssaultCarrier);
            context.player1.clickCard(context.wampa);
            context.player1.clickCard(context.p2Base);

            context.player2.clickCard(context.battlefieldMarine);
            expect(context.player2).toBeAbleToSelectExactly([context.wampa]);

            context.player2.clickCard(context.wampa);
        });
    });
});
