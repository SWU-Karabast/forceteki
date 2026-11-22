describe('Peppi Bow, Shaak Herder', function() {
    integration(function(contextRef) {
        it('Peppi Bow\'s ability should get +1/+1 while upgraded', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: [{ card: 'peppi-bow#shaak-herder', upgrades: ['shield'] }]
                },
                player2: {
                    groundArena: ['wampa']
                }
            });

            const { context } = contextRef;

            expect(context.peppiBow.getPower()).toBe(3);
            expect(context.peppiBow.getHp()).toBe(4);
        });

        it('Peppi Bow\'s should not die on getting a Weakness token', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['peppi-bow#shaak-herder']
                },
                player2: {
                    leader: 'doctor-hemlock#emotion-has-no-place-here',
                    resources: 1,
                    hasInitiative: true,
                }
            });

            const { context } = contextRef;


            context.player2.clickCard(context.doctorHemlock);
            context.player2.clickCard(context.peppiBow);

            expect(context.peppiBow).toHaveExactUpgradeNames(['weakness']);
            expect(context.peppiBow.getPower()).toBe(2);
            expect(context.peppiBow.getHp()).toBe(3);
        });

        it('Peppi Bow\'s should have base stats when not upgraded', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['peppi-bow#shaak-herder', { card: 'wampa', upgrades: ['experience'] }]
                },
            });

            const { context } = contextRef;

            expect(context.peppiBow.getPower()).toBe(2);
            expect(context.peppiBow.getHp()).toBe(3);
        });
    });
});
