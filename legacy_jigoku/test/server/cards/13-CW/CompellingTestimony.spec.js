describe('Compelling Testimony', function() {
    integration(function() {
        describe('Compelling Testimony\'s ability', function() {
            beforeEach(function() {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['kakita-yoshi', 'doji-fumiki']
                    },
                    player2: {
                        inPlay: ['doji-whisperer', 'doji-challenger'],
                        hand: ['compelling-testimony']
                    }
                });

                this.yoshi = this.player1.findCardByName('kakita-yoshi');
                this.fumiki = this.player1.findCardByName('doji-fumiki');
                this.dojiWhisperer = this.player2.findCardByName('doji-whisperer');
                this.challenger = this.player2.findCardByName('doji-challenger');
                this.testimony = this.player2.findCardByName('compelling-testimony');
            });

            it('should not work outside of conflicts', function() {
                this.player1.pass();
                expect(this.player2).toHavePrompt('Action Window');
                this.player2.clickCard(this.testimony);
                expect(this.player2).toHavePrompt('Action Window');
            });

            it('should not work in mil conflicts', function() {
                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.yoshi],
                    defenders: [this.dojiWhisperer],
                    type: 'military'
                });

                expect(this.player2).toHavePrompt('Conflict Action Window');
                this.player2.clickCard(this.testimony);
                expect(this.player2).toHavePrompt('Conflict Action Window');
            });

            it('should only let you target participating characters', function() {
                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.yoshi],
                    defenders: [this.dojiWhisperer],
                    type: 'political'
                });

                this.player2.clickCard(this.testimony);
                expect(this.player2).toBeAbleToSelect(this.yoshi);
                expect(this.player2).not.toBeAbleToSelect(this.fumiki);
                expect(this.player2).toBeAbleToSelect(this.dojiWhisperer);
                expect(this.player2).not.toBeAbleToSelect(this.challenger);
            });

            it('should give the chosen character -4 political skill', function() {
                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.yoshi],
                    defenders: [this.dojiWhisperer],
                    type: 'political'
                });

                let politicalSkill = this.yoshi.getPoliticalSkill();
                this.player2.clickCard(this.testimony);
                this.player2.clickCard(this.yoshi);
                expect(this.yoshi.getPoliticalSkill()).toBe(politicalSkill - 4);
            });

            it('should last until the end of the conflict', function() {
                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.yoshi],
                    defenders: [this.dojiWhisperer],
                    type: 'political'
                });

                let politicalSkill = this.yoshi.getPoliticalSkill();
                this.player2.clickCard(this.testimony);
                this.player2.clickCard(this.yoshi);
                expect(this.yoshi.getPoliticalSkill()).toBe(politicalSkill - 4);
                this.noMoreActions();
                expect(this.yoshi.getPoliticalSkill()).toBe(politicalSkill);
            });
        });
    });
});
