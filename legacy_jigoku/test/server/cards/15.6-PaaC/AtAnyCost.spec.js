describe('At Any Cost', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['moto-youth'],
                    hand: ['at-any-cost']
                },
                player2: {
                    inPlay: ['shinjo-shono']
                }
            });
            this.youth = this.player1.findCardByName('moto-youth');
            this.atAnyCost = this.player1.findCardByName('at-any-cost');
            this.shono = this.player2.findCardByName('shinjo-shono');
        });

        it('should allow you to select a character', function () {
            this.player1.clickCard(this.atAnyCost);
            expect(this.player1).toBeAbleToSelect(this.youth);
            expect(this.player1).toBeAbleToSelect(this.shono);
        });

        it('should pay 3 honor to put 2 fate on a character', function () {
            let honor = this.player1.honor;
            let fate = this.youth.fate;
            this.player1.clickCard(this.atAnyCost);
            this.player1.clickCard(this.youth);
            expect(this.player1.honor).toBe(honor - 3);
            expect(this.youth.fate).toBe(fate + 2);
            expect(this.getChatLogs(5)).toContain('player1 plays At Any Cost, losing 3 honor to place 2 fate on Moto Youth');
        });
    });
});
