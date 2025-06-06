describe('Inquisitors\' Lightsaber', function () {
    integration(function (contextRef) {
        it('Inquisitors\' Lightsaber\'s should give +2/+0 while attacking a force unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: [{ card: 'yoda#old-master', upgrades: ['inquisitors-lightsaber'] }],
                },
                player2: {
                    groundArena: ['rey#keeping-the-past', 'consular-security-force'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.yoda);
            context.player1.clickCard(context.consularSecurityForce);

            expect(context.player2).toBeActivePlayer();
            expect(context.consularSecurityForce.damage).toBe(3); // 2+1

            context.setDamage(context.yoda, 0);
            context.yoda.exhausted = false;

            context.player2.passAction();

            context.player1.clickCard(context.yoda);
            context.player1.clickCard(context.rey);

            expect(context.player2).toBeActivePlayer();
            expect(context.rey.damage).toBe(5); // 2+1+2
        });
    });
});
