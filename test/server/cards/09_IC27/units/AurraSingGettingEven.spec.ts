describe('Aurra Sing, Getting Even', function () {
    integration(function (contextRef) {
        it('Aurra Sing\'s ability should exhaust her to deal 4 damage to a unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['aurra-sing#getting-even', 'wampa'],
                    spaceArena: ['cartel-spacer'],
                },
                player2: {
                    groundArena: ['battlefield-marine', 'consular-security-force'],
                    spaceArena: ['tieln-fighter'],
                    leader: { card: 'boba-fett#daimyo', deployed: true },
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.aurraSing);
            context.player1.clickPrompt('Deal 4 damage to a unit');

            // Can target any unit in either arena, friendly or enemy, including the deployed leader
            expect(context.player1).toBeAbleToSelectExactly([
                context.aurraSing, context.wampa, context.cartelSpacer,
                context.battlefieldMarine, context.consularSecurityForce, context.tielnFighter, context.bobaFett
            ]);
            context.player1.clickCard(context.battlefieldMarine);

            expect(context.battlefieldMarine).toBeInZone('discard');
            expect(context.aurraSing.exhausted).toBe(true);
            expect(context.player2).toBeActivePlayer();
        });
    });
});
