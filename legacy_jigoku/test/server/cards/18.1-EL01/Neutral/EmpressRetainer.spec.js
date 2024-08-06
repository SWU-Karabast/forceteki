describe("Empress's Retainer", function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['empress-retainer']
                },
                player2: {}
            });

            this.retainer = this.player1.findCardByName('empress-retainer');
        });

        it('gains skill bonus while controller has favor', function () {
            this.player1.player.imperialFavor = 'military';

            this.noMoreActions();
            expect(this.retainer.getMilitarySkill()).toBe(4);
            expect(this.retainer.getPoliticalSkill()).toBe(3);
        });

        it('loses skill bonus while opponent has favor', function () {
            this.player2.player.imperialFavor = 'military';

            this.noMoreActions();
            expect(this.retainer.getMilitarySkill()).toBe(2);
            expect(this.retainer.getPoliticalSkill()).toBe(1);
        });

        it('no modifier when no one has the favor', function () {
            this.noMoreActions();
            expect(this.retainer.getMilitarySkill()).toBe(3);
            expect(this.retainer.getPoliticalSkill()).toBe(2);
        });
    });
});
