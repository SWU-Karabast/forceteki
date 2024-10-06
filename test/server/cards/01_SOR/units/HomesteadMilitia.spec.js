describe('Homestead Militia', function () {
    integration(function () {
        describe('Homestead Militia\'s ability', function () {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['wampa', 'battlefield-marine'],
                        groundArena: ['homestead-militia'],
                        resources: 5
                    },
                    player2: {
                        groundArena: ['rugged-survivors', 'cargo-juggernaut', 'atst']
                    }
                });
            });

            it('should not gain Sentinel with 6 or more resources', function () {
                this.player1.pass();

                this.player2.clickCard(this.cargoJuggernaut);
                // no sentinel, I can attack base
                expect(this.player2).toBeAbleToSelectExactly([this.p1Base, this.homesteadMilitia]);
                this.player2.clickCard(this.p1Base);
                expect(this.p1Base.damage).toBe(4);

                this.player1.moveCard(this.wampa, 'resource');
                this.player1.pass();

                this.player2.clickCard(this.ruggedSurvivors);
                // homestead militia automatically selected because of Sentinel
                expect(this.player1).toBeActivePlayer();
                expect(this.homesteadMilitia.damage).toBe(3);

                // remove resource and check if homestead militia lost sentinel
                this.player1.moveCard(this.wampa, 'hand', 'resource');
                this.player1.pass();
                this.player2.clickCard(this.atst);
                expect(this.player2).toBeAbleToSelectExactly([this.p1Base, this.homesteadMilitia]);
                this.player2.clickCard(this.p1Base);
                expect(this.p1Base.damage).toBe(10);
            });
        });
    });
});
