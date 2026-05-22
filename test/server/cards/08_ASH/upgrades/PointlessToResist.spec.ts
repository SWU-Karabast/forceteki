describe('Pointless to Resist', function() {
    integration(function(contextRef) {
        it('should give the attached unit -3/-0 while attacking a base', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: [{ card: 'wampa', upgrades: ['pointless-to-resist'] }],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.wampa);
            context.player1.clickCard(context.p2Base);

            expect(context.p2Base.damage).toBe(1);
        });

        it('should not reduce the attached unit power while attacking a unit', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: [{ card: 'wampa', upgrades: ['pointless-to-resist'] }],
                },
                player2: {
                    groundArena: ['consular-security-force'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.wampa);
            context.player1.clickCard(context.consularSecurityForce);

            expect(context.consularSecurityForce.damage).toBe(4);
        });

        it('should stop reducing the attached unit power after the upgrade is defeated', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['confiscate'],
                    groundArena: [{ card: 'wampa', upgrades: ['pointless-to-resist'] }],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.confiscate);
            context.player1.clickCard(context.pointlessToResist);

            expect(context.pointlessToResist).toBeInZone('discard', context.player1);
            expect(context.wampa.isUpgraded()).toBe(false);

            context.player2.passAction();

            context.player1.clickCard(context.wampa);
            context.player1.clickCard(context.p2Base);

            expect(context.p2Base.damage).toBe(4);
        });
    });
});
