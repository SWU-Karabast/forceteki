describe('Enfys Nest, No More!', function() {
    integration(function(contextRef) {
        it('should get +2/+0 and Overwhelm when attacking a unit that costs 3 or less', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['enfys-nest#no-more'],
                },
                player2: {
                    groundArena: ['crait-veteran'],
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.enfysNest);
            context.player1.clickCard(context.craitVeteran);

            // Enfys attacks with 6 power and Overwhelm: Crait Veteran (3 HP, cost 3) is defeated, 3 excess damage goes to the base
            expect(context.craitVeteran).toBeInZone('discard', context.player2);
            expect(context.enfysNest.damage).toBe(4);
            expect(context.enfysNest.getPower()).toBe(4);
            expect(context.p2Base.damage).toBe(3);
            expect(context.player2).toBeActivePlayer();
        });

        it('should not get +2/+0 and Overwhelm when attacking a unit that costs more than 3', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['enfys-nest#no-more'],
                },
                player2: {
                    groundArena: ['wampa'],
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.enfysNest);
            context.player1.clickCard(context.wampa);

            // No bonus: Wampa (5 HP) survives with 4 damage and no Overwhelm damage reaches the base
            expect(context.wampa.damage).toBe(4);
            expect(context.enfysNest.damage).toBe(4);
            expect(context.p2Base.damage).toBe(0);
            expect(context.player2).toBeActivePlayer();
        });

        it('should get +2/+0 and Overwhelm affecting both defenders when attacking 2 units and only one costs 3 or less', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: [{ card: 'enfys-nest#no-more', upgrades: ['improvised-identity'] }],
                    deck: ['darth-maul#revenge-at-last', 'cartel-spacer', 'takedown']
                },
                player2: {
                    // Crait Veteran costs 3, Ion Cannon costs 4
                    groundArena: ['crait-veteran', 'ion-cannon']
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.enfysNest);
            context.player1.clickPrompt('Search the top 3 cards of your deck for a ground unit and discard it. Then, you may attack with this unit. For this attack, this unit gains the discarded unit\'s abilities.');

            // Discard Darth Maul — Enfys gains "can attack 2 units instead of 1"
            context.player1.clickCardInDisplayCardPrompt(context.darthMaul);
            expect(context.darthMaul).toBeInZone('discard');

            // Attack both defenders, then confirm
            context.player1.clickCard(context.craitVeteran);
            context.player1.clickCard(context.ionCannon);
            context.player1.clickDone();

            // Enfys attacks with 6 power and Overwhelm against both defenders:
            // Crait Veteran (3 HP) is defeated, 3 excess damage goes to the base
            // Ion Cannon (5 HP) is defeated, 1 excess damage goes to the base
            expect(context.craitVeteran).toBeInZone('discard', context.player2);
            expect(context.ionCannon).toBeInZone('discard', context.player2);
            expect(context.p2Base.damage).toBe(4);
            expect(context.enfysNest.damage).toBe(4);
            expect(context.player2).toBeActivePlayer();
        });
    });
});
