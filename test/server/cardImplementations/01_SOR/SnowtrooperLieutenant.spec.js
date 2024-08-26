describe('Snowtrooper Lieutenant', function() {
    integration(function() {
        describe('Snowtrooper lieutenant\'s ability', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['snowtrooper-lieutenant'],
                        groundArena: ['wampa', 'admiral-piett#captain-of-the-executor']
                    },
                    player2: {
                        groundArena: ['sundari-peacekeeper'],
                        spaceArena: ['cartel-spacer']
                    }
                });

                this.snowtrooperLieutenant = this.player1.findCardByName('snowtrooper-lieutenant');
                this.wampa = this.player1.findCardByName('wampa');
                this.piett = this.player1.findCardByName('admiral-piett#captain-of-the-executor');
                this.cartelSpacer = this.player2.findCardByName('cartel-spacer');
                this.peacekeeper = this.player2.findCardByName('sundari-peacekeeper');

                this.p1Base = this.player1.base;
                this.p2Base = this.player2.base;

                this.noMoreActions();
            });

            it('should allowing triggering an attack by a unit when played', function () {
                this.player1.clickCard(this.snowtrooperLieutenant);
                expect(this.snowtrooperLieutenant.location).toBe('ground arena');
                expect(this.player1).toBeAbleToSelectExactly([this.wampa, this.piett]);

                this.player1.clickCard(this.wampa);
                expect(this.player1).toBeAbleToSelectExactly([this.p2Base, this.peacekeeper]);

                this.player1.clickCard(this.peacekeeper);
                expect(this.wampa.exhausted).toBe(true);
                expect(this.wampa.damage).toBe(1);
                expect(this.peacekeeper.damage).toBe(4);
            });

            it('if used with an imperial unit should give it +2 power', function () {
                this.player1.clickCard(this.snowtrooperLieutenant);

                this.player1.clickCard(this.piett);
                this.player1.clickCard(this.peacekeeper);
                expect(this.peacekeeper.damage).toBe(3);
                expect(this.piett.damage).toBe(1);

                // do a second attack to confirm that the +2 bonus has expired
                this.player2.passAction();
                this.piett.exhausted = false;
                this.player1.clickCard(this.piett);
                this.player1.clickCard(this.peacekeeper);

                expect(this.piett.damage).toBe(2);
                expect(this.peacekeeper.damage).toBe(4);
            });
        });
    });
});
