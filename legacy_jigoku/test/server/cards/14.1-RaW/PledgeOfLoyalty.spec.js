describe('Pledge of Loyalty', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['kakita-yoshi', 'doji-fumiki', 'maker-of-keepsakes', 'young-harrier'],
                    provinces: ['pledge-of-loyalty']
                },
                player2: {
                    inPlay: ['hiruma-skirmisher'],
                    hand: ['way-of-the-crab']
                }
            });

            this.yoshi = this.player1.findCardByName('kakita-yoshi');
            this.fumiki = this.player1.findCardByName('doji-fumiki');
            this.keepsakes = this.player1.findCardByName('maker-of-keepsakes');
            this.pledge = this.player1.findCardByName('pledge-of-loyalty');

            this.yoshi.honor();
            this.fumiki.dishonor();
            this.pledge.facedown = false;
            this.skirmisher = this.player2.findCardByName('hiruma-skirmisher');
            this.crab = this.player2.findCardByName('way-of-the-crab');
        });

        it('should trigger when an honored character would leave play', function() {
            this.player1.pass();
            this.player2.clickCard(this.crab);
            this.player2.clickCard(this.skirmisher);

            this.player1.clickCard(this.yoshi);
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.pledge);
        });

        it('should not trigger when a normal character would leave play', function() {
            this.player1.pass();
            this.player2.clickCard(this.crab);
            this.player2.clickCard(this.skirmisher);

            this.player1.clickCard(this.keepsakes);
            expect(this.player1).toHavePrompt('Action Window');
            expect(this.keepsakes.location).toBe('dynasty discard pile');
        });

        it('should not trigger when a dishonored character would leave play', function() {
            this.player1.pass();
            this.player2.clickCard(this.crab);
            this.player2.clickCard(this.skirmisher);

            this.player1.clickCard(this.fumiki);
            expect(this.player1).toHavePrompt('Action Window');
            expect(this.fumiki.location).toBe('conflict discard pile');
        });

        it('should discard the token and prevent the character from leaving play', function() {
            this.player1.pass();
            this.player2.clickCard(this.crab);
            this.player2.clickCard(this.skirmisher);

            this.player1.clickCard(this.yoshi);
            this.player1.clickCard(this.pledge);
            expect(this.player1).toHavePrompt('Action Window');
            expect(this.yoshi.location).toBe('play area');
            expect(this.yoshi.isHonored).toBe(false);
        });

        it('should discard the token even if character cannot be dishonored', function() {
            this.player1.clickCard('young-harrier');
            this.player2.clickCard(this.crab);
            this.player2.clickCard(this.skirmisher);

            this.player1.clickCard(this.yoshi);
            this.player1.clickCard(this.pledge);
            expect(this.player1).toHavePrompt('Action Window');
            expect(this.yoshi.location).toBe('play area');
            expect(this.yoshi.isHonored).toBe(false);
        });
    });
});
