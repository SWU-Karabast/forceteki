describe('Mace Windu, Leaping Into Action', function() {
    integration(function(contextRef) {
        it('Mace Windu\'s ability should deal 4 damage to unit when played using the force', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hasForceToken: true,
                    hand: ['mace-windu#leaping-into-action'],
                    spaceArena: ['rebellious-hammerhead'],
                },
                player2: {
                    groundArena: ['wampa'],
                    spaceArena: ['alliance-xwing']
                },
            });

            const { context } = contextRef;
            context.player1.clickCard(context.maceWindu);
            expect(context.player1).toHavePassAbilityPrompt('Use The Force to deal 4 damage to a unit');
            context.player1.clickPrompt('Trigger');

            expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.maceWindu, context.rebelliousHammerhead, context.allianceXwing]);
            context.player1.clickCard(context.wampa);

            expect(context.wampa.damage).toBe(4);
            expect(context.player1.hasTheForce).toBe(false);
            expect(context.player2).toBeActivePlayer();
        });

        it('Mace Windu\'s ability should deal 4 damage to unit when played using the force but decides not to use it', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hasForceToken: true,
                    hand: ['mace-windu#leaping-into-action'],
                    spaceArena: ['rebellious-hammerhead'],
                },
                player2: {
                    groundArena: ['wampa'],
                    spaceArena: ['alliance-xwing']
                },
            });

            const { context } = contextRef;
            context.player1.clickCard(context.maceWindu);
            context.player1.clickPrompt('Pass');

            expect(context.player2).toBeActivePlayer();
            expect(context.player1.hasTheForce).toBe(true);
        });

        it('Mace Windu\'s ability should not deal damage when played and not use the Force', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['mace-windu#leaping-into-action'],
                    hasForceToken: false
                },
                player2: {
                    groundArena: ['wampa'],
                    spaceArena: ['alliance-xwing']
                },
            });

            const { context } = contextRef;
            context.player1.clickCard(context.maceWindu);

            expect(context.player2).toBeActivePlayer();
        });
    });
});