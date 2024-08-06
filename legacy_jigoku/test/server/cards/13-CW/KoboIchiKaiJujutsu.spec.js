describe('Kobo Ichi Kai Jujutsu', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'draw',
                player1: {
                    inPlay: ['doji-challenger'],
                    hand: ['kobo-ichi-kai-jujutsu']
                },
                player2: {
                    dynastyDiscard: ['secluded-shrine']
                }
            });

            this.challenger = this.player1.findCardByName('doji-challenger');
            this.kobo = this.player1.findCardByName('kobo-ichi-kai-jujutsu');
            this.shrine = this.player2.findCardByName('secluded-shrine');
            this.player1.clickPrompt('1');
            this.player2.clickPrompt('1');
            this.player2.moveCard(this.shrine, 'province 1');
            this.shrine.facedown = false;
            this.player1.playAttachment(this.kobo, this.challenger);
        });

        it('should have a bonus equal to the number of claimed rings by your opponent', function() {
            let mil = this.challenger.getMilitarySkill();

            this.player2.claimRing('earth');
            this.player2.claimRing('fire');
            this.game.checkGameState(true);

            expect(this.challenger.getMilitarySkill()).toBe(mil + 2);
        });

        it('should count rings considered claimed', function() {
            let mil = this.challenger.getMilitarySkill();
            this.noMoreActions();
            expect(this.player2).toHavePrompt('Triggered Abilities');
            expect(this.player2).toBeAbleToSelect(this.shrine);
            this.player2.clickCard(this.shrine);
            expect(this.player2).toHavePrompt('Choose a ring');
            this.player2.clickRing('air');

            expect(this.challenger.getMilitarySkill()).toBe(mil + 1);
        });
    });
});
