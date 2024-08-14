describe('Fleet Lieutenant', function() {
    integration(function() {
        describe('Fleet lieutenant\'s ability', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        // TODO: replace wampa with a space unit
                        hand: ['fleet-lieutenant'],
                        groundArena: ['wampa', 'mon-mothma#voice-of-the-rebellion'],
                        resources: ['atst', 'atst', 'atst'],
                        leader: ['leia-organa#alliance-general']
                    },
                    player2: {
                        groundArena: ['sundari-peacekeeper'],
                        spaceArena: ['cartel-spacer']
                    }
                });

                this.fleetLieutenant = this.player1.findCardByName('fleet-lieutenant');
                this.wampa = this.player1.findCardByName('wampa');
                this.monMothma = this.player1.findCardByName('mon-mothma#voice-of-the-rebellion');
                this.peacekeeper = this.player2.findCardByName('sundari-peacekeeper');
                this.cartelSpacer = this.player2.findCardByName('cartel-spacer');

                this.p1Base = this.player1.base;
                this.p2Base = this.player2.base;

                this.noMoreActions();
            });

            it('should allowing triggering an attack by a unit when played', function () {
                this.player1.clickCard(this.fleetLieutenant);
                expect(this.fleetLieutenant.location).toBe('ground arena');
                expect(this.player1).toBeAbleToSelect(this.wampa);
                expect(this.player1).toBeAbleToSelect(this.monMothma);
                expect(this.player1).not.toBeAbleToSelect(this.p1Base);
                expect(this.player1).not.toBeAbleToSelect(this.p2Base);
                expect(this.player1).not.toBeAbleToSelect(this.peacekeeper);
                expect(this.player1).not.toBeAbleToSelect(this.cartelSpacer);

                this.player1.clickCard(this.wampa);

                expect(this.wampa.exhausted).toBe(true);
                expect(this.wampa.damage).toBe(1);
                expect(this.peacekeeper.damage).toBe(4);
            });

            it('if used with a rebel unit should give it +2 power', function () {
                this.player1.clickCard(this.fleetLieutenant);

                this.player1.clickCard(this.monMothma);
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

            it('should allow the user to pass on the attack', function () {
                this.player1.clickCard(this.fleetLieutenant);
                expect(this.fleetLieutenant.location).toBe('ground arena');

                this.player1.clickPrompt('Pass ability');
                expect(this.player2).toBeActivePlayer();
            });
        });
    });
});
