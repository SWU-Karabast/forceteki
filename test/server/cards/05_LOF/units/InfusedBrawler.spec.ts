describe('Infused Brawler', function() {
    integration(function(contextRef) {
        it('Infused Brawler\'s when played ability should allow using the Force to give 2 Experience tokens to this unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['infused-brawler'],
                    hasForceToken: true,
                    resources: 3
                },
                player2: {
                    groundArena: ['wampa']
                }
            });
            const { context } = contextRef;
            const { player1 } = context;

            // Deploy Infused Brawler
            player1.clickCard(context.infusedBrawler);

            // Use the Force ability
            expect(player1).toHavePassAbilityPrompt('Use the Force');
            player1.clickPrompt('Trigger');

            // Verify that Infused Brawler received 2 Experience tokens
            expect(context.infusedBrawler).toHaveExactUpgradeNames(['experience', 'experience']);
        });

        it('Infused Brawler\'s triggered ability should defeat an Experience token on him when it completes an attack', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: [{ card: 'infused-brawler', upgrades: ['experience', 'experience'] }, { card: 'battlefield-marine', upgrades: ['experience'] }]
                },
            });
            const { context } = contextRef;

            // Attack with Infused Brawler
            context.player1.clickCard(context.infusedBrawler);
            context.player1.clickCard(context.p2Base);

            expect(context.player2).toBeActivePlayer();
            expect(context.infusedBrawler).toHaveExactUpgradeNames(['experience']);
        });

        it('Infused Brawler\'s triggered ability should not defeat an Experience if no one or any upgrade', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: [{ card: 'infused-brawler', upgrades: ['protector'] }]
                },
            });
            const { context } = contextRef;

            // Attack with Infused Brawler
            context.player1.clickCard(context.infusedBrawler);
            context.player1.clickCard(context.p2Base);

            expect(context.player2).toBeActivePlayer();
            expect(context.infusedBrawler).toHaveExactUpgradeNames(['protector']);
        });
    });
});