describe('Blockade Ship', function () {
    integration(function (contextRef) {
        it('should reduce an enemy ground unit\'s power by 1 while it is attacking', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    spaceArena: ['blockade-ship']
                },
                player2: {
                    groundArena: ['wampa'],
                    hasInitiative: true
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.wampa);
            context.player2.clickCard(context.p1Base);

            expect(context.p1Base.damage).toBe(3);
            expect(context.player1).toBeActivePlayer();
        });

        it('should not reduce a friendly ground unit\'s power while attacking', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    spaceArena: ['blockade-ship'],
                    groundArena: ['wampa']
                },
                player2: {}
            });

            const { context } = contextRef;

            context.player1.clickCard(context.wampa);
            context.player1.clickCard(context.p2Base);

            expect(context.p2Base.damage).toBe(4);
            expect(context.player2).toBeActivePlayer();
        });

        it('should not reduce an enemy space unit\'s power while attacking', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    spaceArena: ['blockade-ship']
                },
                player2: {
                    spaceArena: ['alliance-xwing'],
                    hasInitiative: true
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.allianceXwing);
            context.player2.clickCard(context.blockadeShip);

            // Alliance X-Wing is a space unit, so Blockade Ship's ability doesn't reduce its power
            expect(context.blockadeShip.damage).toBe(2);
            expect(context.player1).toBeActivePlayer();
        });

        it('should not reduce an enemy ground unit\'s power while it is only defending', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    spaceArena: ['blockade-ship'],
                    groundArena: ['atte-vanguard']
                },
                player2: {
                    groundArena: ['battlefield-marine']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.atteVanguard);
            context.player1.clickCard(context.battlefieldMarine);

            expect(context.battlefieldMarine).toBeInZone('discard');
            expect(context.atteVanguard.damage).toBe(3);
            expect(context.player2).toBeActivePlayer();
        });

        it('should reduce the damage-dependent heal from Hera Syndulla, Renegade General when she attacks into it', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    spaceArena: ['blockade-ship'],
                    base: { card: 'capital-city', damage: 0 }
                },
                player2: {
                    groundArena: ['hera-syndulla#renegade-general'],
                    base: { card: 'capital-city', damage: 10 },
                    hasInitiative: true
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.heraSyndulla);
            context.player2.clickCard(context.p1Base);

            // Blockade Ship reduces Hera's power from 3 to 2 while attacking
            expect(context.p1Base.damage).toBe(2);

            // Hera heals her own base equal to the (reduced) damage dealt, so 2 instead of her printed power of 3
            expect(context.p2Base.damage).toBe(8);
            expect(context.player1).toBeActivePlayer();
        });
    });
});
