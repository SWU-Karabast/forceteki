describe('Driven by Courage', function() {
    integration(function() {
        describe('Driven by Courage\'s ability', function() {
            beforeEach(function() {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['tattooed-wanderer', 'solemn-scholar'],
                        provinces: ['fertile-fields']
                    },
                    player2: {
                        provinces: ['driven-by-courage', 'toshi-ranbo', 'manicured-garden'],
                        inPlay: ['shrine-maiden', 'shika-matchmaker']
                    }
                });

                this.courage = this.player2.findCardByName('driven-by-courage');
                this.toshiRanbo = this.player2.findCardByName('toshi-ranbo');
                this.garden = this.player2.findCardByName('manicured-garden');
                this.maiden = this.player2.findCardByName('shrine-maiden');
                this.matchmaker = this.player2.findCardByName('shika-matchmaker');

                this.fields = this.player1.findCardByName('fertile-fields');
                this.scholar = this.player1.findCardByName('solemn-scholar');
                this.wanderer = this.player1.findCardByName('tattooed-wanderer');

                this.courage.facedown = false;
                this.noMoreActions();
            });

            it('should trigger when it is the attacked province', function() {
                this.initiateConflict({
                    province: this.courage,
                    ring: 'earth',
                    type: 'military',
                    attackers: [this.wanderer],
                    defenders: [this.maiden]
                });
                this.player2.clickCard(this.courage);
                expect(this.player2).toHavePrompt('Driven By Courage');
            });

            it('should be able to target characters in the conflict but not at home', function() {
                this.initiateConflict({
                    province: this.courage,
                    ring: 'earth',
                    type: 'military',
                    attackers: [this.wanderer],
                    defenders: [this.maiden]
                });
                this.player2.clickCard(this.courage);
                expect(this.player2).toBeAbleToSelect(this.wanderer);
                expect(this.player2).toBeAbleToSelect(this.maiden);
                expect(this.player2).not.toBeAbleToSelect(this.matchmaker);
                expect(this.player2).not.toBeAbleToSelect(this.scholar);
            });

            it('should give +2/+2', function() {
                this.initiateConflict({
                    province: this.courage,
                    ring: 'earth',
                    type: 'military',
                    attackers: [this.wanderer],
                    defenders: [this.maiden]
                });
                let maidenMiltarySkill = this.maiden.getMilitarySkill();
                let maidenPoliticalSkill = this.maiden.getPoliticalSkill();
                this.player2.clickCard(this.courage);
                this.player2.clickCard(this.maiden);
                expect(this.maiden.getMilitarySkill()).toBe(maidenMiltarySkill + 2);
                expect(this.maiden.getPoliticalSkill()).toBe(maidenPoliticalSkill + 2);
                expect(this.getChatLogs(3)).toContain('player2 uses Driven By Courage to give Shrine Maiden +2political and +2military');
            });

            it('should work at your other air provinces', function() {
                this.initiateConflict({
                    province: this.toshiRanbo,
                    ring: 'earth',
                    type: 'military',
                    attackers: [this.wanderer],
                    defenders: [this.maiden]
                });
                this.player2.clickCard(this.courage);
                expect(this.player2).toHavePrompt('Driven By Courage');
            });

            it('should work at your opponents air province', function() {
                this.player1.clickPrompt('Pass Conflict');
                this.player1.clickPrompt('Yes');
                this.noMoreActions();
                this.initiateConflict({
                    province: this.fields,
                    ring: 'earth',
                    type: 'military',
                    attackers: [this.maiden],
                    defenders: [this.wanderer]
                });
                this.player1.pass();
                this.player2.clickCard(this.courage);
                expect(this.player2).toHavePrompt('Driven By Courage');
            });
        });
    });
});
