describe('Maim', function() {
    integration(function(contextRef) {
        describe('Maim\'s ability', function() {
            beforeEach(async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['maim'],
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['green-squadron-awing']
                    },
                    player2: {
                        groundArena: ['wampa', { card: 'atst', exhausted: true }, { card: 'pyke-sentinel', upgrades: ['shield'] }],
                        spaceArena: ['cartel-spacer'],
                        leader: { card: 'chewbacca#walking-carpet', deployed: true }
                    }
                });
            });

            it('should deal 1 damage to a unit and exhaust it', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.maim);

                expect(context.player1).toHavePrompt('Deal 1 damage to a unit and exhaust it');
                expect(context.player1).toBeAbleToSelectExactly([
                    context.battlefieldMarine,
                    context.greenSquadronAwing,
                    context.wampa,
                    context.atst,
                    context.pykeSentinel,
                    context.cartelSpacer,
                    context.chewbacca
                ]);
                expect(context.player1).not.toHavePassAbilityButton();

                context.player1.clickCard(context.wampa);

                expect(context.wampa.damage).toBe(1);
                expect(context.wampa.exhausted).toBeTrue();
                expect(context.maim).toBeInZone('discard', context.player1);
                expect(context.player2).toBeActivePlayer();
            });

            it('should be able to target a friendly unit', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.maim);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.battlefieldMarine.damage).toBe(1);
                expect(context.battlefieldMarine.exhausted).toBeTrue();
                expect(context.player2).toBeActivePlayer();
            });

            it('should be able to target a space unit', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.maim);
                context.player1.clickCard(context.cartelSpacer);

                expect(context.cartelSpacer.damage).toBe(1);
                expect(context.cartelSpacer.exhausted).toBeTrue();
                expect(context.player2).toBeActivePlayer();
            });

            it('should be able to target a deployed leader unit', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.maim);
                context.player1.clickCard(context.chewbacca);

                expect(context.chewbacca.damage).toBe(1);
                expect(context.chewbacca.exhausted).toBeTrue();
                expect(context.player2).toBeActivePlayer();
            });

            it('should still deal 1 damage to a unit that is already exhausted', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.maim);
                context.player1.clickCard(context.atst);

                expect(context.atst.damage).toBe(1);
                expect(context.atst.exhausted).toBeTrue();
                expect(context.player2).toBeActivePlayer();
            });

            it('should defeat a shield instead of dealing damage but still exhaust the unit', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.maim);
                context.player1.clickCard(context.pykeSentinel);

                expect(context.pykeSentinel.damage).toBe(0);
                expect(context.pykeSentinel).toHaveExactUpgradeNames([]);
                expect(context.pykeSentinel.exhausted).toBeTrue();
                expect(context.player2).toBeActivePlayer();
            });
        });

        it('Maim\'s ability should defeat a unit with 1 remaining HP', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['maim']
                },
                player2: {
                    groundArena: [{ card: 'battlefield-marine', damage: 2 }]
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.maim);
            context.player1.clickCard(context.battlefieldMarine);

            expect(context.battlefieldMarine).toBeInZone('discard', context.player2);
            expect(context.player2).toBeActivePlayer();
        });
    });
});
