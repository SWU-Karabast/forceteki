describe('Sake House Informant', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['sake-house-informant', 'shosuro-sadako', 'bayushi-aramoro'],
                    hand: ['adept-of-shadows']
                },
                player2: {
                    inPlay: ['midnight-prowler']
                }
            });

            this.sadako = this.player1.findCardByName('shosuro-sadako');
            this.aramoro = this.player1.findCardByName('bayushi-aramoro');
            this.adept = this.player1.findCardByName('adept-of-shadows');
            this.prowler = this.player2.findCardByName('midnight-prowler');
        });

        it('should give the right boost to the right people', function() {
            let sadako = { mil: this.sadako.getMilitarySkill(), pol: this.sadako.getPoliticalSkill() };
            let aramoro = { mil: this.aramoro.getMilitarySkill(), pol: this.aramoro.getPoliticalSkill() };
            let prowler = { mil: this.prowler.getMilitarySkill(), pol: this.prowler.getPoliticalSkill() };
            this.player1.player.imperialFavor = 'political';
            this.player2.player.imperialFavor = '';
            this.game.checkGameState(true);
            expect(this.sadako.getMilitarySkill()).toBe(sadako.mil);
            expect(this.sadako.getPoliticalSkill()).toBe(sadako.pol + 1);
            expect(this.aramoro.getMilitarySkill()).toBe(aramoro.mil);
            expect(this.aramoro.getPoliticalSkill()).toBe(aramoro.pol + 1);
            expect(this.prowler.getMilitarySkill()).toBe(prowler.mil);
            expect(this.prowler.getPoliticalSkill()).toBe(prowler.pol);

            this.player1.player.imperialFavor = 'military';
            this.player2.player.imperialFavor = '';
            this.game.checkGameState(true);
            expect(this.sadako.getMilitarySkill()).toBe(sadako.mil + 1);
            expect(this.sadako.getPoliticalSkill()).toBe(sadako.pol);
            expect(this.aramoro.getMilitarySkill()).toBe(aramoro.mil + 1);
            expect(this.aramoro.getPoliticalSkill()).toBe(aramoro.pol);
            expect(this.prowler.getMilitarySkill()).toBe(prowler.mil);
            expect(this.prowler.getPoliticalSkill()).toBe(prowler.pol);

            this.player1.player.imperialFavor = '';
            this.player2.player.imperialFavor = 'political';
            this.game.checkGameState(true);
            expect(this.sadako.getMilitarySkill()).toBe(sadako.mil);
            expect(this.sadako.getPoliticalSkill()).toBe(sadako.pol + 1);
            expect(this.aramoro.getMilitarySkill()).toBe(aramoro.mil);
            expect(this.aramoro.getPoliticalSkill()).toBe(aramoro.pol + 1);
            expect(this.prowler.getMilitarySkill()).toBe(prowler.mil);
            expect(this.prowler.getPoliticalSkill()).toBe(prowler.pol);

            this.player1.player.imperialFavor = '';
            this.player2.player.imperialFavor = 'military';
            this.game.checkGameState(true);
            expect(this.sadako.getMilitarySkill()).toBe(sadako.mil + 1);
            expect(this.sadako.getPoliticalSkill()).toBe(sadako.pol);
            expect(this.aramoro.getMilitarySkill()).toBe(aramoro.mil + 1);
            expect(this.aramoro.getPoliticalSkill()).toBe(aramoro.pol);
            expect(this.prowler.getMilitarySkill()).toBe(prowler.mil);
            expect(this.prowler.getPoliticalSkill()).toBe(prowler.pol);

            this.player1.clickCard(this.adept);
            this.player1.clickPrompt('0');

            expect(this.adept.getMilitarySkill()).toBe(3);
            expect(this.adept.getPoliticalSkill()).toBe(2);
        });
    });
});
