describe('Hevy Staunch Martyr', function () {
    integration(function (contextRef) {
        describe('Hevy Staunch Martyr\'s ability', function () {
            it('should attack for 6 with raid 2 on coordinate', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['specforce-soldier', 'luke-skywalker#jedi-knight', 'hevy#staunch-martyr'],
                        spaceArena: ['alliance-xwing']
                    },
                    player2: {
                        groundArena: ['consular-security-force', 'wampa', 'fleet-lieutenant'],
                        spaceArena: ['mining-guild-tie-fighter']
                    }
                });

                const { context } = contextRef;

                expect(context.hevy.getPower()).toBe(4);
                context.player1.clickCard(context.hevy);
                context.player1.clickCard(context.consularSecurityForce);
                expect(context.consularSecurityForce.damage).toBe(6);
                expect(context.hevy.damage).toBe(3);

                // When defeated, deal 1 damage to each enemy ground unit
                context.player2.clickCard(context.wampa);
                context.player2.clickCard(context.hevy);
                expect(context.hevy).toBeInZone('discard');
                expect(context.wampa).toBeInZone('discard');
                expect(context.consularSecurityForce).toBeInZone('discard');
                expect(context.fleetLieutenant.damage).toBe(1);
                expect(context.miningGuildTieFighter.damage).toBe(0);
                expect(context.miningGuildTieFighter).toBeInZone('spaceArena');

                // But 0 damage to friendly units
                expect(context.specforceSoldier.damage).toBe(0);
                expect(context.allianceXwing.damage).toBe(0);
            });

            it('should deal damage to the original owner\'s ground units when defeated with No Glory, Only Results', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['hevy#staunch-martyr', 'wampa'],
                        spaceArena: ['alliance-xwing']
                    },
                    player2: {
                        hand: ['no-glory-only-results'],
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['mining-guild-tie-fighter'],
                        hasInitiative: true
                    }
                });

                const { context } = contextRef;

                context.player2.clickCard(context.noGloryOnlyResults);
                context.player2.clickCard(context.hevy);

                expect(context.hevy).toBeInZone('discard', context.player1);

                // Player 2 controlled Hevy when it was defeated, so player 1's ground units are the enemy ones
                expect(context.wampa.damage).toBe(1);
                expect(context.allianceXwing.damage).toBe(0);
                expect(context.battlefieldMarine.damage).toBe(0);
                expect(context.miningGuildTieFighter.damage).toBe(0);
                expect(context.player1).toBeActivePlayer();
            });
        });
    });
});
