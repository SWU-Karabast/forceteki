describe('Fleet Lieutenant', function() {
    integration(function() {
        describe('Fleet lieutenant\'s ability', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['fleet-lieutenant'],
                        groundArena: ['wampa', 'mon-mothma#voice-of-the-rebellion']
                    },
                    player2: {
                        groundArena: ['sundari-peacekeeper'],
                        spaceArena: ['cartel-spacer']
                    }
                });

                this.fleetLieutenant = this.player1.findCardByName('fleet-lieutenant');
                this.wampa = this.player1.findCardByName('wampa');
                this.monMothma = this.player1.findCardByName('mon-mothma#voice-of-the-rebellion');
                this.cartelSpacer = this.player2.findCardByName('cartel-spacer');
                this.peacekeeper = this.player2.findCardByName('sundari-peacekeeper');

                this.p1Base = this.player1.base;
                this.p2Base = this.player2.base;
            });

            it('should allowing triggering an attack by a unit when played', function () {
                this.player1.clickCard(this.fleetLieutenant);
                expect(this.fleetLieutenant).toBeInLocation('ground arena');
                expect(this.player1).toBeAbleToSelectExactly([this.wampa, this.monMothma]);

                this.player1.clickCard(this.wampa);
                expect(this.player1).toBeAbleToSelectExactly([this.p2Base, this.peacekeeper]);

                this.player1.clickCard(this.peacekeeper);
                expect(this.wampa.exhausted).toBe(true);
                expect(this.wampa.damage).toBe(1);
                expect(this.peacekeeper.damage).toBe(4);
            });

            it('if used with a rebel unit should give it +2 power', function () {
                this.player1.clickCard(this.fleetLieutenant);

                this.player1.clickCard(this.monMothma);
                this.player1.clickCard(this.peacekeeper);
                expect(this.peacekeeper.damage).toBe(3);
                expect(this.monMothma.damage).toBe(1);

                // do a second attack to confirm that the +2 bonus has expired
                this.player2.passAction();
                this.monMothma.exhausted = false;
                this.player1.clickCard(this.monMothma);
                this.player1.clickCard(this.peacekeeper);

                expect(this.monMothma.damage).toBe(2);
                expect(this.peacekeeper.damage).toBe(4);
            });

            it('should allow the user to pass on the attack at the attacker select stage', function () {
                this.player1.clickCard(this.fleetLieutenant);
                expect(this.fleetLieutenant).toBeInLocation('ground arena');

                this.player1.clickPrompt('Pass ability');
                expect(this.player2).toBeActivePlayer();
            });

            it('should allow the user to pass on the attack at the target select stage', function () {
                this.player1.clickCard(this.fleetLieutenant);
                expect(this.fleetLieutenant).toBeInLocation('ground arena');

                this.player1.clickCard(this.monMothma);

                this.player1.clickPrompt('Pass ability');
                expect(this.player2).toBeActivePlayer();
                expect(this.monMothma.exhausted).toBe(false);
            });
        });
    });
});
