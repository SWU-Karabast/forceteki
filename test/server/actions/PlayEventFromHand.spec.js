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
            });

            it('it should end up in discard and resources should be exhausted', function () {
                this.player1.clickCard(this.daringRaid);
                this.player1.clickCard(this.wampa);

                expect(this.daringRaid).toBeInLocation('discard');
                expect(this.player1.countExhaustedResources()).toBe(1);

                this.player2.passAction();

                // play a second event with an aspect penalty
                this.player1.clickCard(this.repair);
                this.player1.clickCard(this.wampa);

                expect(this.repair).toBeInLocation('discard');
                expect(this.player1.countExhaustedResources()).toBe(4);
            });

            // TODO: add a test of Restock to make sure it can target itself in the discard pile
        });
    });
});
