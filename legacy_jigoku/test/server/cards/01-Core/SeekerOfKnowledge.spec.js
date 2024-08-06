describe('Seeker of Knowledge', function() {
    integration(function() {
        describe('Seeker of Knowledge\'s ability', function() {
            beforeEach(function() {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['shrine-maiden'],
                        hand: ['seeker-of-knowledge', 'assassination']
                    },
                    player2: {
                        provinces: ['defend-the-wall'],
                        inPlay: ['shinjo-outrider'],
                        hand: ['display-of-power', 'fine-katana']
                    }
                });
            });

            it('Should take effect when Seeker of Knowledge is declared as an attacker', function() {
                this.player1.clickCard('seeker-of-knowledge');
                this.player1.clickPrompt('0');
                this.noMoreActions();
                this.initiateConflict({
                    type: 'political',
                    ring: 'fire',
                    province: 'defend-the-wall',
                    attackers: ['shrine-maiden', 'seeker-of-knowledge'],
                    defenders: ['shinjo-outrider']
                });
                this.noMoreActions();
                expect(this.player1).toHavePrompt('Resolve Ring Effect');
                this.player1.clickRing('air');
                expect(this.player1).toHavePrompt('Air Ring');
            });

            it('Should take effect when Seeker of Knowledge is played into a conflict as an attacker', function() {
                this.noMoreActions();
                this.initiateConflict({
                    type: 'political',
                    ring: 'fire',
                    province: 'defend-the-wall',
                    attackers: ['shrine-maiden'],
                    defenders: ['shinjo-outrider']
                });
                this.player2.pass();
                this.player1.clickCard('seeker-of-knowledge');
                this.player1.clickPrompt('0');
                this.player1.clickPrompt('Conflict');
                this.noMoreActions();
                expect(this.player1).toHavePrompt('Resolve Ring Effect');
                this.player1.clickRing('air');
                expect(this.player1).toHavePrompt('Air Ring');
            });

            it('Should permit resolution of the Air Ring even when it is claimed', function() {
                this.player1.clickCard('seeker-of-knowledge');
                this.player1.clickPrompt('0');
                this.player2.claimRing('air');
                this.noMoreActions();
                this.initiateConflict({
                    type: 'political',
                    ring: 'fire',
                    province: 'defend-the-wall',
                    attackers: ['shrine-maiden','seeker-of-knowledge'],
                    defenders: ['shinjo-outrider']
                });
                this.noMoreActions();
                expect(this.player1).toHavePrompt('Resolve Ring Effect');
                this.player1.clickRing('air');
                expect(this.player1).toHavePrompt('Air Ring');
            });
        });
    });
});
