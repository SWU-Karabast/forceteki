describe('Savage Opress, Imbued with Hate', () => {
    integration(function (contextRef) {
        describe('Savage Opress\' when played ability', () => {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['savage-opress#imbued-with-hate'],
                        hasForceToken: true,
                        base: { card: 'echo-base', damage: 0 }
                    },
                });
            });

            it('may allow the player to use the force. If they don\'t, deal 9 damage to their base', () => {
                const { context } = contextRef;

                // Play Savage Opress
                context.player1.clickCard(context.savageOpress);

                // Check prompt for optional ability
                expect(context.player1).toHavePrompt('Trigger the ability \'Use the Force. If you don\'t, deal 9 damage to your base.\' or pass');
                context.player1.clickPrompt('Trigger');

                expect(context.player1.hasTheForce).toBe(false);
                expect(context.player1.base.damage).toBe(0);
            });

            it('if player chooses not to use the force, deals 9 damage to their base', () => {
                const { context } = contextRef;

                // Play Savage Opress
                context.player1.clickCard(context.savageOpress);

                // Check prompt for optional ability
                expect(context.player1).toHavePrompt('Trigger the ability \'Use the Force. If you don\'t, deal 9 damage to your base.\' or pass');
                context.player1.clickPrompt('Pass');

                expect(context.player1.hasTheForce).toBe(true);
                expect(context.player1.base.damage).toBe(9);
            });

            it('if player does not have a force token, deals 9 damage to their base', () => {
                const { context } = contextRef;

                context.player1.setHasTheForce(false);

                // Play Savage Opress
                context.player1.clickCard(context.savageOpress);

                // No prompt should appear since the player doesn't have the Force token
                expect(context.player1.base.damage).toBe(9);
            });
        });

        describe('Savage Opress\' when defeated ability', () => {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['savage-opress#imbued-with-hate'],
                        hasForceToken: true,
                        base: { card: 'echo-base', damage: 0 }
                    },
                    player2: {
                        hand: ['rivals-fall'],
                        hasInitiative: true,
                    }
                });
            });

            it('may allow the player to use the force. If they don\'t, deal 9 damage to their base', () => {
                const { context } = contextRef;

                // Defeat Savage Opress with Rival's Fall
                context.player2.clickCard(context.rivalsFall);
                context.player2.clickCard(context.savageOpress);

                // Check prompt for optional ability
                expect(context.player1).toHavePrompt('Trigger the ability \'Use the Force. If you don\'t, deal 9 damage to your base.\' or pass');
                context.player1.clickPrompt('Trigger');

                // Ensure the Force was used
                expect(context.player1.hasTheForce).toBe(false);
                expect(context.player1.base.damage).toBe(0);
            });

            it('if player chooses not to use the force when defeated, deals 9 damage to their base', () => {
                const { context } = contextRef;

                // Defeat Savage Opress with Rival's Fall
                context.player2.clickCard(context.rivalsFall);
                context.player2.clickCard(context.savageOpress);

                // Check prompt for optional ability
                expect(context.player1).toHavePrompt('Trigger the ability \'Use the Force. If you don\'t, deal 9 damage to your base.\' or pass');
                context.player1.clickPrompt('Pass');

                // Ensure the Force was not used
                expect(context.player1.hasTheForce).toBe(true);
                expect(context.player1.base.damage).toBe(9);
            });

            it('if player does not have a force token when defeated, deals 9 damage to their base', () => {
                const { context } = contextRef;
                context.player1.setHasTheForce(false);

                // Defeat Savage Opress with Rival's Fall
                context.player2.clickCard(context.rivalsFall);
                context.player2.clickCard(context.savageOpress);

                // No prompt should appear since the player doesn't have the Force token
                expect(context.player1.base.damage).toBe(9);
            });
        });

        describe('Savage Opress\' when defeated ability with No Glory Only Results', () => {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['no-glory-only-results'],
                        hasForceToken: true,
                        base: { card: 'echo-base', damage: 0 }
                    },
                    player2: {
                        groundArena: ['savage-opress#imbued-with-hate'],
                        hasForceToken: true,
                        base: { card: 'echo-base', damage: 0 }
                    }
                });
            });

            it('may allow the player to use the force. If they don\'t, deal 9 damage to their base', () => {
                const { context } = contextRef;

                // Player 1 plays No Glory, Only Results
                context.player1.clickCard(context.noGloryOnlyResults);
                context.player1.clickCard(context.savageOpress);

                // Check prompt for optional ability
                expect(context.player1).toHavePrompt('Trigger the ability \'Use the Force. If you don\'t, deal 9 damage to your base.\' or pass');
                context.player1.clickPrompt('Trigger');

                // Ensure the Force was used
                expect(context.player1.hasTheForce).toBe(false);
                expect(context.player1.base.damage).toBe(0);
                expect(context.player2.hasTheForce).toBe(true);
                expect(context.player2.base.damage).toBe(0);
            });

            it('if player chooses not to use the force when defeated, deals 9 damage to their base', () => {
                const { context } = contextRef;

                // Player 1 plays No Glory, Only Results
                context.player1.clickCard(context.noGloryOnlyResults);
                context.player1.clickCard(context.savageOpress);

                // Check prompt for optional ability
                expect(context.player1).toHavePrompt('Trigger the ability \'Use the Force. If you don\'t, deal 9 damage to your base.\' or pass');
                context.player1.clickPrompt('Pass');

                // Ensure the Force was not used
                expect(context.player1.hasTheForce).toBe(true);
                expect(context.player1.base.damage).toBe(9);
                expect(context.player2.hasTheForce).toBe(true);
                expect(context.player2.base.damage).toBe(0);
            });

            it('if player does not have a force token when defeated, deals 9 damage to their base', () => {
                const { context } = contextRef;
                context.player1.setHasTheForce(false);

                // Player 1 plays No Glory, Only Results
                context.player1.clickCard(context.noGloryOnlyResults);
                context.player1.clickCard(context.savageOpress);

                // No prompt should appear since the player doesn't have the Force token
                expect(context.player1.base.damage).toBe(9);
                expect(context.player2.hasTheForce).toBe(true);
                expect(context.player2.base.damage).toBe(0);
            });
        });
    });
});
