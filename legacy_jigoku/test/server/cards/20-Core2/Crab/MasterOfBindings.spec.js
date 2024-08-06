describe('Master of Bindings', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['master-of-bindings'],
                },
                player2: {
                    inPlay: ['isawa-tadaka', 'solemn-scholar'],
                    hand: ['against-the-waves']
                }
            });

            this.bindings = this.player1.findCardByName('master-of-bindings');
            this.tadaka = this.player2.findCardByName('isawa-tadaka');
            this.scholar = this.player2.findCardByName('solemn-scholar');
            this.atw = this.player2.findCardByName('against-the-waves');

            this.tadaka.bow();
            this.scholar.bow();
        });

        it('should re-bow a cheap character', function () {
            this.player1.pass();

            this.player2.clickCard(this.atw);
            this.player2.clickCard(this.scholar);
            expect(this.scholar.bowed).toBe(false);

            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.bindings);
            this.player1.clickCard(this.bindings);
            expect(this.scholar.bowed).toBe(true);

            expect(this.getChatLogs(5)).toContain('player1 uses Master of Bindings to bow Solemn Scholar');
        });

        it('should not re-bow an expensive character', function () {
            this.player1.pass();

            this.player2.clickCard(this.atw);
            this.player2.clickCard(this.tadaka);
            expect(this.tadaka.bowed).toBe(false);

            expect(this.player1).toHavePrompt('Action Window');
        });
    });
});
