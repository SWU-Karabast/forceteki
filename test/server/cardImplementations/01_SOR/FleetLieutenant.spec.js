describe('Fleet Lieutenant', function() {
    integration(function() {
        describe('Fleet lieutenant\'s ability', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        // TODO: replace wampa with a space unit
                        hand: ['fleet-lieutenant'],
                        groundArena: ['wampa', 'battlefield-marine'],
                        resources: ['atst', 'atst', 'atst'],
                        leader: ['leia-organa#alliance-general']
                    },
                    player2: {
                        groundArena: ['frontier-atrt'],
                        spaceArena: ['cartel-spacer']
                    }
                });

                this.fleetLieutenant = this.player1.findCardByName('fleet-lieutenant');
                this.wampa = this.player1.findCardByName('wampa');
                this.marine = this.player1.findCardByName('battlefield-marine');
                this.atrt = this.player2.findCardByName('frontier-atrt');
                this.cartelSpacer = this.player2.findCardByName('cartel-spacer');

                this.p1Base = this.player1.base;
                this.p2Base = this.player2.base;

                this.noMoreActions();
            });

            it('should trigger a ground unit attack on play', function () {
                this.player1.clickCard(this.fleetLieutenant);
                expect(this.fleetLieutenant.location).toBe('ground arena');

                // this.player1.clickPrompt('Attack with a unit');
                this.player1.clickCard(this.wampa);

                expect(this.wampa.exhausted).toBe(true);
                expect(this.wampa.damage).toBe(3);
                expect(this.atrt.damage).toBe(4);
            });

            it('should trigger a ground unit attack on play with rebel bonus', function () {
                this.player1.clickCard(this.fleetLieutenant);
                expect(this.fleetLieutenant.location).toBe('ground arena');

                // this.player1.clickPrompt('Attack with a unit');
                this.player1.clickCard(this.marine);

                // expect(this.wampa.exhausted).toBe(true);
                expect(this.marine.location).toBe('discard');
                expect(this.atrt.location).toBe('discard');
            });
        });
    });
});
