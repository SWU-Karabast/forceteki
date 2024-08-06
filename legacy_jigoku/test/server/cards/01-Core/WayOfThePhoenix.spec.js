describe('Way of the Phoenix', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['shrine-maiden'],
                    hand: ['seeker-of-knowledge', 'assassination', 'unveiled-destiny', 'fine-katana'],
                    role: 'seeker-of-void'
                },
                player2: {
                    provinces: ['defend-the-wall'],
                    inPlay: ['shinjo-outrider'],
                    hand: ['way-of-the-phoenix']
                }
            });

            this.phoenix = this.player2.findCardByName('way-of-the-phoenix');
            this.maiden = this.player1.findCardByName('shrine-maiden');
            this.knowledge = this.player1.findCardByName('seeker-of-knowledge');
            this.destiny = this.player1.findCardByName('unveiled-destiny');
        });

        it('should prevent declaring conflicts of the element type', function() {
            this.player1.pass();
            this.player2.clickCard(this.phoenix);
            this.player2.clickRing('void');
            this.noMoreActions();

            this.player1.clickCard(this.maiden);
            this.player1.clickRing('air');
            expect(this.player1.currentPrompt().promptTitle).toContain('Air Conflict');
            this.player1.clickRing('earth');
            expect(this.player1.currentPrompt().promptTitle).toContain('Earth Conflict');
            this.player1.clickRing('fire');
            expect(this.player1.currentPrompt().promptTitle).toContain('Fire Conflict');
            this.player1.clickRing('water');
            expect(this.player1.currentPrompt().promptTitle).toContain('Water Conflict');
            this.player1.clickRing('void');
            expect(this.player1.currentPrompt().promptTitle).toContain('Water Conflict');
            this.player1.clickRing('earth');
            expect(this.player1.currentPrompt().promptTitle).toContain('Earth Conflict');
        });

        it('should prevent declaring conflicts if your only attacker gives rings the element type', function() {
            this.player1.playAttachment(this.destiny, this.maiden);
            this.player2.clickCard(this.phoenix);
            this.player2.clickRing('void');
            this.noMoreActions();

            expect(this.player1).toHavePrompt('Action Window');
            expect(this.getChatLogs(5)).toContain('player1 passes their conflict opportunity as none of their characters can be declared as an attacker');
        });

        it('should prevent characters being declared as attackers if they add the element to the contested ring', function() {
            this.player1.playAttachment(this.destiny, this.maiden);
            this.player2.clickCard(this.phoenix);
            this.player2.clickRing('void');
            this.player1.clickCard(this.knowledge);
            this.player1.clickPrompt('1');
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                ring: 'fire',
                province: 'defend-the-wall',
                attackers: [this.maiden, this.knowledge],
                defenders: ['shinjo-outrider']
            });
            this.player1.player.optionSettings.orderForcedAbilities = true;
            expect(this.game.currentConflict.attackers).toContain(this.knowledge);
            expect(this.game.currentConflict.attackers).not.toContain(this.maiden);
        });
    });
});
