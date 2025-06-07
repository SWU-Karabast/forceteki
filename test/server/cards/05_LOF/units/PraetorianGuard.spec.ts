describe('Praetorian Guard', () => {
    integration(function (contextRef) {
        it('Praetorian Guard does not gains Sentinel while you do not control a unit with 4 or more power', async () => {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['praetorian-guard', 'battlefield-marine']
                },
                player2: {
                    groundArena: ['wampa'],
                    hasInitiative: true,
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.wampa);

            expect(context.player2).toBeAbleToSelectExactly([context.battlefieldMarine, context.praetorianGuard, context.p1Base]);

            context.player2.clickCard(context.p1Base);
        });

        it('Praetorian Guard gains Sentinel while you control a unit with 4 or more power (with upgrades)', async () => {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['praetorian-guard', { card: 'battlefield-marine', upgrades: ['experience'] }]
                },
                player2: {
                    groundArena: ['wampa'],
                    hasInitiative: true,
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.wampa);

            expect(context.player2).toBeAbleToSelectExactly([context.praetorianGuard]);

            context.player2.clickCard(context.praetorianGuard);
        });

        it('Praetorian Guard gains Sentinel while you control a unit with 4 or more power', async () => {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['praetorian-guard'],
                    spaceArena: ['home-one#alliance-flagship']
                },
                player2: {
                    groundArena: ['wampa'],
                    hasInitiative: true,
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.wampa);

            expect(context.player2).toBeAbleToSelectExactly([context.praetorianGuard]);

            context.player2.clickCard(context.praetorianGuard);
        });

        it('Praetorian Guard gains Sentinel while he has 4 power or more', async () => {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: [{ card: 'praetorian-guard', upgrades: ['entrenched'] }, 'battlefield-marine']
                },
                player2: {
                    groundArena: ['wampa'],
                    hasInitiative: true,
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.wampa);

            expect(context.player2).toBeAbleToSelectExactly([context.praetorianGuard]);

            context.player2.clickCard(context.praetorianGuard);
        });
    });
});