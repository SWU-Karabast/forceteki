describe('Take Aim', function () {
    integration(function (contextRef) {
        it('Take Aim\'s ability should initiate an attack and give +2/+0 and Saboteur', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['take-aim'],
                    groundArena: ['battlefield-marine'],
                    base: 'jabbas-palace'
                },
                player2: {
                    groundArena: ['niima-outpost-constables']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.takeAim);
            context.player1.clickCard(context.battlefieldMarine);

            expect(context.player1).toBeAbleToSelectExactly([context.niimaOutpostConstables, context.p2Base]);
            context.player1.clickCard(context.p2Base);
            expect(context.p2Base.damage).toBe(5);
            expect(context.player1.exhaustedResourceCount).toBe(3);

            // second attack to confirm the effect is gone
            context.player2.passAction();
            context.readyCard(context.battlefieldMarine);
            context.player1.clickCard(context.battlefieldMarine);

            expect(context.player1).toBeAbleToSelectExactly([context.niimaOutpostConstables]);
            context.player1.clickCard(context.niimaOutpostConstables);
            expect(context.niimaOutpostConstables.damage).toBe(3);
        });

        it('Take Aim\'s ability should costs 1 resource less by friendly leader unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['take-aim'],
                    leader: { card: 'chewbacca#walking-carpet', deployed: true },
                    base: 'jabbas-palace'
                },
                player2: {
                    groundArena: ['niima-outpost-constables'],
                    leader: { card: 'darth-vader#dont-fail-me-again', deployed: true }
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.takeAim);
            context.player1.clickCard(context.chewbacca);
            context.player1.clickCard(context.p2Base);

            expect(context.player2).toBeActivePlayer();
            expect(context.player1.exhaustedResourceCount).toBe(2);
        });
    });
});
