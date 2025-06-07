describe('Inquisitor\'s Lightsaber', function () {
    integration(function (contextRef) {
        it('Inquisitor\'s Lightsaber\'s should give +2/+0 while attacking a force unit', async function () {
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
            context.readyCard(context.yoda);

            context.player2.passAction();

            context.player1.clickCard(context.yoda);
            context.player1.clickCard(context.rey);

            expect(context.player2).toBeActivePlayer();
            expect(context.rey.damage).toBe(5); // 2+1+2
        });

        it('Inquisitor\'s Lightsaber\'s should give +2/+0 while attacking at least one force unit (TWI Darth Maul test)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: [{ card: 'darth-maul#revenge-at-last', upgrades: ['inquisitors-lightsaber'] }],
                },
                player2: {
                    groundArena: [{ card: 'rey#keeping-the-past', upgrades: ['resilient'] }, { card: 'consular-security-force', upgrades: ['resilient'] }],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.darthMaul);
            context.player1.clickCard(context.consularSecurityForce);
            context.player1.clickCard(context.rey);
            context.player1.clickPrompt('Done');

            expect(context.player2).toBeActivePlayer();
            expect(context.consularSecurityForce.damage).toBe(8); // 5+1+2
            expect(context.rey.damage).toBe(8); // 5+1+2
        });
    });
});
