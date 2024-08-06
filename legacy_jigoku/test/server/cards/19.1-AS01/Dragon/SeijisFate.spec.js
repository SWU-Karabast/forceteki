describe('Seijis Fate', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['bayushi-shoju'],
                    hand: ['a-new-name', 'seiji-s-fate']
                },
                player2: {
                    inPlay: ['doji-challenger']
                }
            });
            this.shoju = this.player1.findCardByName('bayushi-shoju');
            this.ann = this.player1.findCardByName('a-new-name');
            this.seiji = this.player1.findCardByName('seiji-s-fate');
            this.challenger = this.player2.findCardByName('doji-challenger');

            this.noMoreActions();
            this.initiateConflict({
                type: 'political',
                attackers: [this.shoju],
                defenders: [this.challenger]
            });
            this.player2.pass();
        });

        it('should remove traits and add creature', function () {
            expect(this.shoju.hasTrait('champion')).toBe(true);
            expect(this.shoju.hasTrait('courtier')).toBe(true);
            expect(this.shoju.hasTrait('bushi')).toBe(true);
            expect(this.shoju.hasTrait('creature')).toBe(false);

            this.player1.playAttachment(this.seiji, this.shoju);

            expect(this.shoju.hasTrait('champion')).toBe(true);
            expect(this.shoju.hasTrait('courtier')).toBe(false);
            expect(this.shoju.hasTrait('bushi')).toBe(false);
            expect(this.shoju.hasTrait('creature')).toBe(true);
        });

        it('should blank', function () {
            this.player1.playAttachment(this.seiji, this.shoju);
            this.player2.pass();
            expect(this.player1).toHavePrompt('Conflict Action Window');
            this.player1.clickCard(this.shoju);
            expect(this.player1).toHavePrompt('Conflict Action Window');
        });

        it('should remove gained traits', function () {
            this.player1.playAttachment(this.ann, this.challenger);
            expect(this.challenger.hasTrait('bushi')).toBe(true);
            expect(this.challenger.hasTrait('duelist')).toBe(true);
            expect(this.challenger.hasTrait('courtier')).toBe(true);
            expect(this.challenger.hasTrait('creature')).toBe(false);

            this.player2.pass();
            this.player1.playAttachment(this.seiji, this.challenger);

            expect(this.challenger.hasTrait('bushi')).toBe(false);
            expect(this.challenger.hasTrait('duelist')).toBe(true);
            expect(this.challenger.hasTrait('courtier')).toBe(false);
            expect(this.challenger.hasTrait('creature')).toBe(true);
        });
    });
});
