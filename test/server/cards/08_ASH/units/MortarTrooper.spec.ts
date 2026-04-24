describe('Mortar Trooper', function() {
    integration(function(contextRef) {
        it('Mortar Trooper\'s action ability should deal 1 damage to up to 3 units', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['mortar-trooper', 'battlefield-marine'],
                    spaceArena: ['awing']
                },
                player2: {
                    groundArena: ['wampa'],
                    spaceArena: ['tieln-fighter']
                }
            });
            const { context } = contextRef;

            // Click Mortar Trooper to use action ability
            context.player1.clickCard(context.mortarTrooper);

            // Click the ability button
            context.player1.clickPrompt('Deal 1 damage to each of up to 3 units');

            // Should prompt to select up to 3 units
            expect(context.player1).toHavePrompt('Deal 1 damage to each of up to 3 units');
            expect(context.player1).toBeAbleToSelectExactly([
                context.mortarTrooper,
                context.battlefieldMarine,
                context.wampa,
            ]);

            // Select 3 targets
            context.player1.clickCard(context.wampa);
            context.player1.clickCard(context.mortarTrooper);
            context.player1.clickCard(context.battlefieldMarine);
            context.player1.clickPrompt('Done');

            // Each selected unit takes 1 damage
            expect(context.wampa.damage).toBe(1);
            expect(context.battlefieldMarine.damage).toBe(1);
            expect(context.mortarTrooper.damage).toBe(1);
            expect(context.awing.damage).toBe(0);
            expect(context.tielnFighter.damage).toBe(0);

            // Mortar Trooper is exhausted from the cost
            expect(context.mortarTrooper.exhausted).toBe(true);

            expect(context.player2).toBeActivePlayer();
        });

        it('Mortar Trooper\'s ability can target fewer than 3 units', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['mortar-trooper']
                },
                player2: {
                    groundArena: ['wampa', 'battlefield-marine']
                }
            });
            const { context } = contextRef;

            // Click Mortar Trooper to use action ability
            context.player1.clickCard(context.mortarTrooper);

            // Click the ability button
            context.player1.clickPrompt('Deal 1 damage to each of up to 3 units');

            // Select only 1 target
            context.player1.clickCard(context.wampa);
            context.player1.clickPrompt('Done');

            expect(context.wampa.damage).toBe(1);
            expect(context.battlefieldMarine.damage).toBe(0);
            expect(context.mortarTrooper.exhausted).toBe(true);

            expect(context.player2).toBeActivePlayer();
        });

        it('Mortar Trooper\'s ability can choose no targets', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['mortar-trooper']
                },
                player2: {
                    groundArena: ['wampa']
                }
            });
            const { context } = contextRef;

            // Click Mortar Trooper to use action ability
            context.player1.clickCard(context.mortarTrooper);

            // Click the ability button
            context.player1.clickPrompt('Deal 1 damage to each of up to 3 units');

            // Choose no targets
            context.player1.clickPrompt('Choose nothing');

            expect(context.wampa.damage).toBe(0);
            expect(context.mortarTrooper.exhausted).toBe(true);

            expect(context.player2).toBeActivePlayer();
        });

        it('Mortar Trooper\'s ability can target itself', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['mortar-trooper']
                },
                player2: {
                    groundArena: ['wampa']
                }
            });
            const { context } = contextRef;

            // Click Mortar Trooper to use action ability
            context.player1.clickCard(context.mortarTrooper);

            // Click the ability button
            context.player1.clickPrompt('Deal 1 damage to each of up to 3 units');

            // Target itself
            context.player1.clickCard(context.mortarTrooper);
            context.player1.clickPrompt('Done');

            expect(context.mortarTrooper.damage).toBe(1);
            expect(context.mortarTrooper.exhausted).toBe(true);

            expect(context.player2).toBeActivePlayer();
        });

        it('Mortar Trooper\'s must be ready to use his ability', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: [{ card: 'mortar-trooper', exhausted: true }]
                },
                player2: {
                    groundArena: ['wampa']
                }
            });
            const { context } = contextRef;

            expect(context.mortarTrooper).not.toHaveAvailableActionWhenClickedBy(context.player1);
        });
    });
});
