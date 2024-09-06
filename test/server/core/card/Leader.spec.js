describe('Leader cards', function() {
    integration(function() {
        describe('Undeployed leaders', function() {
            beforeEach(function () {
                this.setupTest({
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
                this.player1.setResourceCount(3);

                this.player1.clickCard(this.grandMoffTarkin);
                expect(this.player1).not.toHaveEnabledPromptButton('Deploy Grand Moff Tarkin');

                // resolve the Tarkin ability and click him again to make sure he presents no options
                this.player1.clickCard(this.atst);
                this.player2.passAction();
                expect(this.grandMoffTarkin).not.toHaveAvailableActionWhenClickedInActionPhaseBy(this.player1);
            });

            it('should be able to trigger active abilities and be readied at the regroup phase if exhausted', function () {
                this.player1.setResourceCount(3);

                // resolve the Tarkin ability to exhaust him
                this.player1.clickCard(this.grandMoffTarkin);
                this.player1.clickCard(this.atst);
                expect(this.grandMoffTarkin.exhausted).toBe(true);

                // confirm he has no action available
                this.player2.passAction();
                expect(this.grandMoffTarkin).not.toHaveAvailableActionWhenClickedInActionPhaseBy(this.player1);

                // move to next action phase to confirm that Tarkin is readied
                this.moveToNextActionPhase();
                expect(this.grandMoffTarkin.exhausted).toBe(false);
            });

            it('should be able to deploy, activate leader unit side abilities, and be defeated', function () {
                // exhaust 1 resource just to be sure it doesn't impact the deploy ability
                this.player1.exhaustResources(1);

                expect(this.grandMoffTarkin.deployed).toBe(false);
                this.player1.clickCard(this.grandMoffTarkin);
                this.player1.clickPrompt('Deploy Grand Moff Tarkin');

                expect(this.grandMoffTarkin.deployed).toBe(true);
                expect(this.grandMoffTarkin).toBeInLocation('ground arena');
                expect(this.grandMoffTarkin.exhausted).toBe(false);
                expect(this.player2).toBeActivePlayer();

                this.player2.passAction();

                // attack and confirm that targeting works
                this.player1.clickCard(this.grandMoffTarkin);
                expect(this.player1).toBeAbleToSelectExactly([this.wampa, this.p2Base]);
                this.player1.clickCard(this.wampa);

                // on attack ability
                expect(this.player1).toHavePrompt('Choose a card');
                this.player1.clickPrompt('Pass ability');

                expect(this.grandMoffTarkin.damage).toBe(4);
                expect(this.wampa.damage).toBe(2);

                // defeat leader
                this.player2.clickCard(this.wampa);
                this.player2.clickCard(this.grandMoffTarkin);

                expect(this.wampa.damage).toBe(4);
                expect(this.grandMoffTarkin.deployed).toBe(false);
                expect(this.grandMoffTarkin.location).toBe('base');
                expect(this.grandMoffTarkin.exhausted).toBe(true);

                // confirm no action available (can't deploy)
                expect(this.grandMoffTarkin).not.toHaveAvailableActionWhenClickedInActionPhaseBy(this.player1);

                // move to next action phase and confirm that deploy still isn't available
                this.moveToNextActionPhase();
                this.player1.clickCard(this.grandMoffTarkin);
                expect(this.player1).not.toHaveEnabledPromptButton('Deploy Grand Moff Tarkin');
            });
        });

        describe('Deployed leaders', function() {
            beforeEach(function () {
                this.setupTest({
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

                this.p1Base = this.player1.base;
                this.p2Base = this.player2.base;
            });

            it('should have functioning keywords and be exhausted on attack', function () {
                this.p1Base.damage = 5;
                this.player1.clickCard(this.directorKrennic);
                this.player1.clickCard(this.player2.base);

                expect(this.p1Base.damage).toBe(3);
                expect(this.p2Base.damage).toBe(2);
                expect(this.directorKrennic.exhausted).toBe(true);

                this.player2.passAction();

                expect(this.directorKrennic).not.toHaveAvailableActionWhenClickedInActionPhaseBy(this.player1);
            });
        });
    });
});
