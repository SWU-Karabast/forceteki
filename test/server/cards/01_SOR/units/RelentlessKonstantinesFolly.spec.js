describe('Relentless, Konstantine\'s Folly', function() {
    integration(function() {
        describe('Relentless, Konstantine\'s Folly\'s ability', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['relentless#konstantines-folly', 'daring-raid']
                    },
                    player2: {
                        hand: ['vanquish', 'repair', 'moment-of-peace'],
                        base: { card: 'dagobah-swamp', damage: 5 }
                    }
                });
            });

            it('should nullify the effects of the first event the opponent plays each round', function () {
                this.player1.clickCard(this.relentless);

                // play an event, with no effect
                let exhaustedResourcesBeforeCardPlay = this.player2.countExhaustedResources();
                this.player2.clickCard(this.vanquish);
                expect(this.player2.countExhaustedResources()).toBe(exhaustedResourcesBeforeCardPlay + 5);
                expect(this.relentless).toBeInLocation('space arena');
                expect(this.vanquish).toBeInLocation('discard');

                this.player1.pass();

                // play a second event, with effect
                exhaustedResourcesBeforeCardPlay = this.player2.countExhaustedResources();
                this.player2.clickCard(this.repair);
                this.player2.clickCard(this.p2Base);
                expect(this.player2.countExhaustedResources()).toBe(exhaustedResourcesBeforeCardPlay + 1);
                expect(this.p2Base.damage).toBe(2);

                // next round, it should nullify the first event played again
                this.moveToNextActionPhase();
                this.player1.pass();
                exhaustedResourcesBeforeCardPlay = this.player2.countExhaustedResources();
                this.player2.clickCard(this.momentOfPeace);
                expect(this.player2.countExhaustedResources()).toBe(exhaustedResourcesBeforeCardPlay + 1);
                expect(this.relentless).toHaveExactUpgradeNames([]);
            });

            it('should not nullify a second or later event even if Relentless was played after the first event', function () {
                this.player1.pass();

                this.player2.clickCard(this.repair);
                this.player2.clickCard(this.p2Base);
                expect(this.p2Base.damage).toBe(2);

                this.player1.clickCard(this.relentless);

                expect(this.relentless).toBeInLocation('space arena');
                this.player2.clickCard(this.vanquish);
                expect(this.relentless).toBeInLocation('discard');
            });

            it('should not nullify an event played by its controller', function () {
                this.player1.clickCard(this.relentless);

                this.player2.pass();

                this.player1.clickCard(this.daringRaid);
                expect(this.player1).toBeAbleToSelectExactly([this.p1Base, this.p2Base, this.relentless]);
                expect(this.p2Base.damage).toBe(5);
                this.player1.clickCard(this.p2Base);
                expect(this.p2Base.damage).toBe(7);
            });
        });
    });
});
