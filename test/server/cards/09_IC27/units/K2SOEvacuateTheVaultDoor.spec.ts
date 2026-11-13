describe('K-2SO, Evacuate the Vault Door', function() {
    integration(function(contextRef) {
        describe('K-2SO\'s When Defeated ability', function() {
            it('should deal 5 damage to each enemy unit and each enemy base', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['k2so#evacuate-the-vault-door', 'wampa']
                    },
                    player2: {
                        hand: ['vanquish'],
                        groundArena: ['krayt-dragon'],
                        spaceArena: ['avenger#hunting-star-destroyer'],
                        hasInitiative: true
                    }
                });

                const { context } = contextRef;

                context.player2.clickCard(context.vanquish);
                context.player2.clickCard(context.k2so);

                expect(context.k2so).toBeInZone('discard', context.player1);

                // each enemy unit takes 5 damage
                expect(context.kraytDragon.damage).toBe(5);
                expect(context.avenger.damage).toBe(5);

                // enemy base takes 5 damage
                expect(context.p2Base.damage).toBe(5);

                // friendly units and own base are unaffected
                expect(context.wampa.damage).toBe(0);
                expect(context.p1Base.damage).toBe(0);

                expect(context.player1).toBeActivePlayer();
            });

            it('should deal 5 damage to each enemy unit and each enemy base when defeated in combat', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['k2so#evacuate-the-vault-door']
                    },
                    player2: {
                        groundArena: ['krayt-dragon'],
                        spaceArena: ['avenger#hunting-star-destroyer'],
                        hasInitiative: true
                    }
                });

                const { context } = contextRef;

                context.player2.clickCard(context.kraytDragon);
                context.player2.clickCard(context.k2so);

                expect(context.k2so).toBeInZone('discard', context.player1);

                // krayt dragon takes K-2SO's 10 combat damage and is defeated
                expect(context.kraytDragon).toBeInZone('discard', context.player2);

                // other enemy unit takes 5 damage
                expect(context.avenger.damage).toBe(5);

                expect(context.p2Base.damage).toBe(5);

                // own base takes 5 excess combat damage from krayt dragon's attack, none from the ability
                expect(context.p1Base.damage).toBe(5);

                expect(context.player1).toBeActivePlayer();
            });

            it('should work with No Glory, Only Results', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['k2so#evacuate-the-vault-door'],
                        spaceArena: ['avenger#hunting-star-destroyer']
                    },
                    player2: {
                        hand: ['no-glory-only-results'],
                        groundArena: ['krayt-dragon'],
                        hasInitiative: true
                    }
                });

                const { context } = contextRef;

                context.player2.clickCard(context.noGloryOnlyResults);
                context.player2.clickCard(context.k2so);

                // K-2SO is defeated under player2's control, so player1's units and base are the enemies
                expect(context.k2so).toBeInZone('discard', context.player1);
                expect(context.avenger.damage).toBe(5);
                expect(context.p1Base.damage).toBe(5);

                // player2's units and base are unaffected
                expect(context.kraytDragon.damage).toBe(0);
                expect(context.p2Base.damage).toBe(0);

                expect(context.player1).toBeActivePlayer();
            });
        });
    });
});
