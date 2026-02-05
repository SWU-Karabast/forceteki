describe('Thermal Detonator', function () {
    integration(function (contextRef) {
        it('Thermal Detonator\'s when defeated ability should deal 2 damage to each enemy ground unit if defeated unit was ready', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: [{ card: 'wampa', upgrades: ['thermal-detonator'] }],
                    spaceArena: ['awing']
                },
                player2: {
                    hand: ['rivals-fall'],
                    hasInitiative: true,
                    groundArena: [{ card: 'atst', damage: 4 }, 'battlefield-marine'],
                    spaceArena: ['avenger#hunting-star-destroyer']
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.rivalsFall);
            context.player2.clickCard(context.wampa);

            expect(context.atst.damage).toBe(6);
            expect(context.battlefieldMarine.damage).toBe(2);
            expect(context.awing.damage).toBe(0);
            expect(context.avengerHuntingStarDestroyer.damage).toBe(0);
            expect(context.player1).toBeActivePlayer();
        });

        it('Thermal Detonator when defeated ability should not trigger when upgrade is defeated', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: [{ card: 'wampa', upgrades: ['thermal-detonator'] }],
                    spaceArena: ['awing']
                },
                player2: {
                    hand: ['disabling-fang-fighter'],
                    hasInitiative: true,
                    groundArena: [{ card: 'atst', damage: 4 }, 'battlefield-marine'],
                    spaceArena: ['avenger#hunting-star-destroyer']
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.disablingFangFighter);
            context.player2.clickCard(context.thermalDetonator);

            expect(context.atst.damage).toBe(4);
            expect(context.battlefieldMarine.damage).toBe(0);
            expect(context.awing.damage).toBe(0);
            expect(context.avengerHuntingStarDestroyer.damage).toBe(0);
            expect(context.disablingFangFighter.damage).toBe(0);
            expect(context.player1).toBeActivePlayer();
            expect(context.player1).toBeActivePlayer();
        });

        it('Thermal Detonator\'s when defeated ability should not deal 2 damage to each enemy ground unit if defeated unit was not ready', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: [{ card: 'wampa', upgrades: ['thermal-detonator'], exhausted: true }],
                    spaceArena: ['awing']
                },
                player2: {
                    hand: ['rivals-fall'],
                    hasInitiative: true,
                    groundArena: [{ card: 'atst', damage: 4 }, 'battlefield-marine'],
                    spaceArena: ['avenger#hunting-star-destroyer']
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.rivalsFall);
            context.player2.clickCard(context.wampa);

            expect(context.atst.damage).toBe(4);
            expect(context.battlefieldMarine.damage).toBe(0);
            expect(context.awing.damage).toBe(0);
            expect(context.avengerHuntingStarDestroyer.damage).toBe(0);
            expect(context.player1).toBeActivePlayer();
        });

        it('Thermal Detonator\'s when defeated ability should not deal 2 damage to each enemy ground unit if defeated unit was not ready (No Glory Only Results)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: [{ card: 'wampa', upgrades: ['thermal-detonator'], exhausted: true }, 'rebel-pathfinder'],
                    spaceArena: ['awing']
                },
                player2: {
                    hand: ['no-glory-only-results'],
                    hasInitiative: true,
                    groundArena: [{ card: 'atst', damage: 4 }, 'battlefield-marine'],
                    spaceArena: ['avenger#hunting-star-destroyer']
                }
            });

            const { context } = contextRef;

            // Play the upgrade
            context.player2.clickCard(context.noGloryOnlyResults);
            context.player2.clickCard(context.wampa);

            expect(context.atst.damage).toBe(4);
            expect(context.battlefieldMarine.damage).toBe(0);
            expect(context.awing.damage).toBe(0);
            expect(context.avengerHuntingStarDestroyer.damage).toBe(0);
            expect(context.rebelPathfinder.damage).toBe(0);
            expect(context.player1).toBeActivePlayer();
        });

        it('Thermal Detonator\'s when defeated ability should deal 2 damage to each enemy ground unit if defeated unit was ready (No Glory Only Results)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: [{ card: 'wampa', upgrades: ['thermal-detonator'] }, 'rebel-pathfinder'],
                    spaceArena: ['awing']
                },
                player2: {
                    hand: ['no-glory-only-results'],
                    hasInitiative: true,
                    groundArena: [{ card: 'atst', damage: 4 }, 'battlefield-marine'],
                    spaceArena: ['avenger#hunting-star-destroyer']
                }
            });

            const { context } = contextRef;

            // Play the upgrade
            context.player2.clickCard(context.noGloryOnlyResults);
            context.player2.clickCard(context.wampa);

            expect(context.atst.damage).toBe(4);
            expect(context.battlefieldMarine.damage).toBe(0);
            expect(context.awing.damage).toBe(0);
            expect(context.avengerHuntingStarDestroyer.damage).toBe(0);
            expect(context.rebelPathfinder.damage).toBe(2);
            expect(context.player1).toBeActivePlayer();
        });
    });
});