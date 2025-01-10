describe('Sly Moore Secretive Advisor', function() {
    integration(function(contextRef) {
        describe('Sly Moore\'s ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['sly-moore#secretive-advisor'],
                        groundArena: ['battle-droid'],
                        spaceArena: ['cartel-spacer']
                    },
                    player2: {
                        groundArena: [{ card: 'clone-trooper', exhausted: true }, 'advanced-recon-commando']
                    }
                });
            });

            it('should take control of an enemy token unit and ready it. At the start of the regroup phase, the owner should take control.', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.slyMoore);
                expect(context.player1).toBeAbleToSelectExactly([context.cloneTrooper]);

                context.player1.clickCard(context.cloneTrooper);
                expect(context.cloneTrooper).toBeInZone('groundArena', context.player1);
                expect(context.cloneTrooper.exhausted).toBeFalse();
                expect(context.player2).toBeActivePlayer();

                context.moveToRegroupPhase();
                expect(context.cloneTrooper).toBeInZone('groundArena', context.player2);
            });

            it('should take control of an enemy token unit and ready it. At the start of the regroup phase, the owner should not take control if the unit is defeated.', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.slyMoore);
                expect(context.player1).toBeAbleToSelectExactly([context.cloneTrooper]);

                context.player1.clickCard(context.cloneTrooper);
                expect(context.cloneTrooper).toBeInZone('groundArena', context.player1);
                expect(context.cloneTrooper.exhausted).toBeFalse();
                expect(context.player2).toBeActivePlayer();

                context.player2.clickCard(context.advancedReconCommando);
                context.player2.clickCard(context.cloneTrooper);

                context.moveToRegroupPhase();
                expect(context.cloneTrooper).toBeInZone('outsideTheGame', context.player2);
            });
        });
    });
});
