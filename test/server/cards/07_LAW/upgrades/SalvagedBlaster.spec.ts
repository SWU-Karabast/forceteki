describe('Salvaged Blaster', function() {
    integration(function(contextRef) {
        it('Salvaged Blaster\'s ability should only attach to non-vehicle units', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['salvaged-blaster'],
                    leader: 'luke-skywalker#faithful-friend',
                    groundArena: ['wampa'],
                    spaceArena: ['tie-fighter'],
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.salvagedBlaster);
            expect(context.player1).toBeAbleToSelectExactly([context.wampa]);
            expect(context.player1).not.toBeAbleToSelect(context.tieFighter);

            context.player1.clickCard(context.wampa);
            expect(context.player2).toBeActivePlayer();

            expect(context.salvagedBlaster).toBeInZone('groundArena', context.player1);
            expect(context.wampa).toHaveExactUpgradeNames(['salvaged-blaster']);
        });

        it('Salvaged Blaster\'s ability cannot be played from discard if not discarded from hand or deck this phase', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: [{ card: 'wampa', upgrades: ['salvaged-blaster'] }],
                },
                player2: {
                    hasInitiative: true,
                    hand: ['rivals-fall']
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.rivalsFall);
            context.player2.clickCard(context.wampa);

            expect(context.player1).toBeActivePlayer();
            expect(context.salvagedBlaster).not.toHaveAvailableActionWhenClickedBy(context.player1);
        });

        it('Salvaged Blaster\'s ability can be played from discard if discarded from hand this phase', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['salvaged-blaster'],
                    groundArena: ['wampa'],
                    base: 'tarkintown'
                },
                player2: {
                    hasInitiative: true,
                    hand: ['spark-of-rebellion']
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.sparkOfRebellion);
            context.player2.clickCardInDisplayCardPrompt(context.salvagedBlaster);

            expect(context.player1).toBeActivePlayer();
            expect(context.salvagedBlaster).toHaveAvailableActionWhenClickedBy(context.player1);
            context.player1.clickCard(context.wampa);

            expect(context.player2).toBeActivePlayer();
            expect(context.player1.exhaustedResourceCount).toBe(2);
            expect(context.wampa).toHaveExactUpgradeNames(['salvaged-blaster']);
        });

        it('Salvaged Blaster\'s ability cannot be played from discard if discarded from hand a previous phase', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['salvaged-blaster'],
                    groundArena: ['wampa']
                },
                player2: {
                    hasInitiative: true,
                    hand: ['spark-of-rebellion']
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.sparkOfRebellion);
            context.player2.clickCardInDisplayCardPrompt(context.salvagedBlaster);

            context.moveToNextActionPhase();

            context.player2.passAction();

            expect(context.player1).toBeActivePlayer();
            expect(context.salvagedBlaster).not.toHaveAvailableActionWhenClickedBy(context.player1);
        });

        it('Salvaged Blaster\'s ability can be played from discard if discarded from deck this phase', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    deck: ['salvaged-blaster'],
                    groundArena: ['wampa'],
                    base: 'tarkintown'
                },
                player2: {
                    hasInitiative: true,
                    groundArena: ['kanan-jarrus#revealed-jedi']
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.kananJarrus);
            context.player2.clickCard(context.p1Base);
            // trigger kanan ability to discard from opponent deck
            context.player2.clickPrompt('Trigger');

            expect(context.player1).toBeActivePlayer();
            expect(context.salvagedBlaster).toHaveAvailableActionWhenClickedBy(context.player1);
            context.player1.clickCard(context.wampa);

            expect(context.player2).toBeActivePlayer();
            expect(context.player1.exhaustedResourceCount).toBe(2);
            expect(context.wampa).toHaveExactUpgradeNames(['salvaged-blaster']);
        });
    });
});
