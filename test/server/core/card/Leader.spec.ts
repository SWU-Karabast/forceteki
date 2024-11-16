describe('Leader cards', function() {
    integration(function(contextRef) {
        describe('Undeployed leaders', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['atst', 'battlefield-marine'],
                        spaceArena: ['tieln-fighter'],
                        leader: 'grand-moff-tarkin#oversector-governor',
                        resources: 5
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: ['tie-advanced']
                    }
                });
            });

            it('should not be able to deploy if there are too few resources', function () {
                const { context } = contextRef;

                context.player1.setResourceCount(3);

                context.player1.clickCard(context.grandMoffTarkin);
                expect(context.player1).not.toHaveEnabledPromptButton('Deploy Grand Moff Tarkin');

                // resolve the Tarkin ability and click him again to make sure he presents no options
                context.player1.clickCard(context.atst);
                context.player2.passAction();
                expect(context.grandMoffTarkin).not.toHaveAvailableActionWhenClickedBy(context.player1);
            });

            it('should be able to trigger active abilities and be readied at the regroup phase if exhausted', function () {
                const { context } = contextRef;

                context.player1.setResourceCount(3);

                // resolve the Tarkin ability to exhaust him
                context.player1.clickCard(context.grandMoffTarkin);
                context.player1.clickCard(context.atst);
                expect(context.grandMoffTarkin.exhausted).toBe(true);

                // confirm he has no action available
                context.player2.passAction();
                expect(context.grandMoffTarkin).not.toHaveAvailableActionWhenClickedBy(context.player1);

                // move to next action phase to confirm that Tarkin is readied
                context.moveToNextActionPhase();
                expect(context.grandMoffTarkin.exhausted).toBe(false);
            });

            it('should be able to deploy, activate leader unit side abilities, and be defeated', function () {
                const { context } = contextRef;

                // exhaust 1 resource just to be sure it doesn't impact the deploy ability
                context.player1.exhaustResources(1);

                expect(context.grandMoffTarkin.deployed).toBe(false);
                context.player1.clickCard(context.grandMoffTarkin);
                context.player1.clickPrompt('Deploy Grand Moff Tarkin');

                expect(context.grandMoffTarkin.deployed).toBe(true);
                expect(context.grandMoffTarkin).toBeInZone('ground arena');
                expect(context.grandMoffTarkin.exhausted).toBe(false);
                expect(context.player2).toBeActivePlayer();

                context.player2.passAction();

                // attack and confirm that targeting works
                context.player1.clickCard(context.grandMoffTarkin);
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.p2Base]);
                context.player1.clickCard(context.wampa);

                // on attack ability
                expect(context.player1).toHavePrompt('Choose a card');
                context.player1.clickPrompt('Pass ability');

                expect(context.grandMoffTarkin.damage).toBe(4);
                expect(context.wampa.damage).toBe(2);

                // defeat leader
                context.player2.clickCard(context.wampa);
                context.player2.clickCard(context.grandMoffTarkin);

                expect(context.wampa.damage).toBe(4);
                expect(context.grandMoffTarkin.deployed).toBe(false);
                expect(context.grandMoffTarkin.zoneName).toBe('base');
                expect(context.grandMoffTarkin.exhausted).toBe(true);

                // confirm no action available (can't deploy)
                expect(context.grandMoffTarkin).not.toHaveAvailableActionWhenClickedBy(context.player1);

                // move to next action phase and confirm that deploy still isn't available
                context.moveToNextActionPhase();
                context.player1.clickCard(context.grandMoffTarkin);
                expect(context.player1).not.toHaveEnabledPromptButton('Deploy Grand Moff Tarkin');
            });
        });

        describe('Deployed leaders', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['atst', 'battlefield-marine'],
                        spaceArena: ['tieln-fighter'],
                        leader: { card: 'director-krennic#aspiring-to-authority', deployed: true }
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: ['tie-advanced']
                    }
                });

                const { context } = contextRef;
                context.p1Base = context.player1.base;
                context.p2Base = context.player2.base;
            });

            it('should have functioning keywords and be exhausted on attack', function () {
                const { context } = contextRef;

                context.setDamage(context.p1Base, 5);
                context.player1.clickCard(context.directorKrennic);
                context.player1.clickCard(context.player2.base);

                expect(context.p1Base.damage).toBe(3);
                expect(context.p2Base.damage).toBe(2);
                expect(context.directorKrennic.exhausted).toBe(true);

                context.player2.passAction();

                expect(context.directorKrennic).not.toHaveAvailableActionWhenClickedBy(context.player1);
            });
        });
    });
});
