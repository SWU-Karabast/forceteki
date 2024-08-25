describe('Play event from hand', function() {
    integration(function() {
        describe('When an event is played', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['daring-raid', 'repair'],
                        groundArena: ['pyke-sentinel'],
                        spaceArena: ['cartel-spacer'],
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: ['imperial-interceptor']
                    }
                });

                this.repair = this.player1.findCardByName('repair');
                this.daringRaid = this.player1.findCardByName('daring-raid');
                this.pykeSentinel = this.player1.findCardByName('pyke-sentinel');
                this.cartelSpacer = this.player1.findCardByName('cartel-spacer');

                this.wampa = this.player2.findCardByName('wampa');
                this.interceptor = this.player2.findCardByName('imperial-interceptor');

                this.p1Base = this.player1.base;
                this.p2Base = this.player2.base;

                this.noMoreActions();
            });

            it('it should end up in discard and resources should be exhausted', function () {
                this.player1.clickCard(this.daringRaid);
                this.player1.clickCard(this.wampa);

                expect(this.daringRaid.location).toBe('discard');
                expect(this.player1.countExhaustedResources()).toBe(1);

                this.player2.passAction();

                // play a second event with an aspect penalty
                this.player1.clickCard(this.repair);
                this.player1.clickCard(this.wampa);

                expect(this.repair.location).toBe('discard');
                expect(this.player1.countExhaustedResources()).toBe(4);
            });

            // TODO: add a test of Restock to make sure it can target itself in the discard pile
        });
    });
});
