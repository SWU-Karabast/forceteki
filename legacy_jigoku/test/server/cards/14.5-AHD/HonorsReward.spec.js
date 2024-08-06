describe('Honors Reward', function() {
    integration(function() {
        describe('Honors Reward\'s ability', function() {
            beforeEach(function() {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['tattooed-wanderer', 'solemn-scholar'],
                        provinces: ['meditations-on-the-tao']
                    },
                    player2: {
                        provinces: ['honor-s-reward', 'toshi-ranbo', 'manicured-garden', 'feast-or-famine'],
                        inPlay: ['shrine-maiden', 'shika-matchmaker']
                    }
                });

                this.reward = this.player2.findCardByName('honor-s-reward');
                this.toshiRanbo = this.player2.findCardByName('toshi-ranbo');
                this.garden = this.player2.findCardByName('manicured-garden');
                this.feast = this.player2.findCardByName('feast-or-famine');
                this.maiden = this.player2.findCardByName('shrine-maiden');
                this.matchmaker = this.player2.findCardByName('shika-matchmaker');

                this.meditations = this.player1.findCardByName('meditations-on-the-tao');
                this.scholar = this.player1.findCardByName('solemn-scholar');
                this.wanderer = this.player1.findCardByName('tattooed-wanderer');

                this.reward.facedown = false;
                this.noMoreActions();
            });

            it('should trigger when it is the attacked province', function() {
                this.initiateConflict({
                    province: this.reward,
                    ring: 'earth',
                    type: 'military',
                    attackers: [this.wanderer],
                    defenders: [this.maiden]
                });
                this.player2.clickCard(this.reward);
                expect(this.player2).toHavePrompt('Honor\'s Reward');
            });

            it('should be able to target characters in the conflict but not at home', function() {
                this.initiateConflict({
                    province: this.reward,
                    ring: 'earth',
                    type: 'military',
                    attackers: [this.wanderer],
                    defenders: [this.maiden]
                });
                this.player2.clickCard(this.reward);
                expect(this.player2).toBeAbleToSelect(this.wanderer);
                expect(this.player2).toBeAbleToSelect(this.maiden);
                expect(this.player2).not.toBeAbleToSelect(this.matchmaker);
                expect(this.player2).not.toBeAbleToSelect(this.scholar);
            });

            it('should give +3 glory', function() {
                this.initiateConflict({
                    province: this.reward,
                    ring: 'earth',
                    type: 'military',
                    attackers: [this.wanderer],
                    defenders: [this.maiden]
                });
                let maidenGlory = this.maiden.glory;
                this.player2.clickCard(this.reward);
                this.player2.clickCard(this.maiden);
                expect(this.maiden.glory).toBe(maidenGlory + 3);
                expect(this.getChatLogs(3)).toContain('player2 uses Honor\'s Reward to give Shrine Maiden +3 glory');
            });

            it('should work at your other fire provinces', function() {
                this.initiateConflict({
                    province: this.feast,
                    ring: 'earth',
                    type: 'military',
                    attackers: [this.wanderer],
                    defenders: [this.maiden]
                });
                this.player2.clickCard(this.reward);
                expect(this.player2).toHavePrompt('Honor\'s Reward');
            });

            it('should work at your opponents fire province', function() {
                this.player1.clickPrompt('Pass Conflict');
                this.player1.clickPrompt('Yes');
                this.noMoreActions();
                this.initiateConflict({
                    province: this.meditations,
                    ring: 'earth',
                    type: 'military',
                    attackers: [this.maiden],
                    defenders: [this.wanderer]
                });
                this.player1.pass();
                this.player2.clickCard(this.reward);
                expect(this.player2).toHavePrompt('Honor\'s Reward');
            });
        });
    });
});
