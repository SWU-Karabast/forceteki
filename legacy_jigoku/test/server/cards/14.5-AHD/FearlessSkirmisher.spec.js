describe('Fearless Skirmisher', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['kakita-yoshi', 'doji-fumiki', 'maker-of-keepsakes'],
                    hand: ['finger-of-jade']
                },
                player2: {
                    inPlay: ['fearless-skirmisher', 'doji-challenger']
                }
            });

            this.yoshi = this.player1.findCardByName('kakita-yoshi');
            this.fumiki = this.player1.findCardByName('doji-fumiki');
            this.keepsakes = this.player1.findCardByName('maker-of-keepsakes');
            this.skirmisher = this.player2.findCardByName('fearless-skirmisher');
            this.challenger = this.player2.findCardByName('doji-challenger');
            this.jade = this.player1.findCardByName('finger-of-jade');
            this.sd1 = this.player1.findCardByName('shameful-display', 'province 1');

            this.yoshi.honor();
            this.fumiki.dishonor();
            this.challenger.dishonor();
            this.skirmisher.honor();
        });

        it('should react to winning a military conflict', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.fumiki],
                defenders: [this.skirmisher],
                type: 'military'
            });

            this.noMoreActions();
            expect(this.player2).toHavePrompt('Triggered Abilities');
            expect(this.player2).toBeAbleToSelect(this.skirmisher);
        });

        it('should let you target a dishonored token', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.fumiki],
                defenders: [this.skirmisher],
                type: 'military'
            });

            this.noMoreActions();
            this.player2.clickCard(this.skirmisher);
            expect(this.player2).toHavePrompt('Choose a dishonored token');
            expect(this.player2).not.toBeAbleToSelect(this.yoshi);
            expect(this.player2).toBeAbleToSelect(this.fumiki);
            expect(this.player2).not.toBeAbleToSelect(this.keepsakes);
            expect(this.player2).not.toBeAbleToSelect(this.skirmisher);
            expect(this.player2).toBeAbleToSelect(this.challenger);
        });

        it('should let you choose a character to receive the token', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.fumiki],
                defenders: [this.skirmisher],
                type: 'military'
            });

            this.noMoreActions();
            this.player2.clickCard(this.skirmisher);
            this.player2.clickCard(this.challenger);

            expect(this.player2).not.toBeAbleToSelect(this.challenger);
            expect(this.player2).not.toBeAbleToSelect(this.fumiki);
            expect(this.player2).not.toBeAbleToSelect(this.keepsakes);
            expect(this.player2).toBeAbleToSelect(this.skirmisher);
            expect(this.player2).toBeAbleToSelect(this.yoshi);
        });

        it('should move the token to the target', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.fumiki],
                defenders: [this.skirmisher],
                type: 'military'
            });

            this.noMoreActions();
            expect(this.yoshi.isHonored).toBe(true);
            expect(this.challenger.isDishonored).toBe(true);

            this.player2.clickCard(this.skirmisher);
            this.player2.clickCard(this.challenger);
            this.player2.clickCard(this.yoshi);

            expect(this.yoshi.isHonored).toBe(false);
            expect(this.challenger.isDishonored).toBe(false);
        });

        it('should not react to winning a pol conflict', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.fumiki],
                defenders: [this.skirmisher],
                type: 'political'
            });
            this.fumiki.bowed = true;
            this.noMoreActions();
            expect(this.player2).not.toHavePrompt('Triggered Abilities');
        });

        it('should not react to losing a mil conflict', function() {
            this.noMoreActions();
            this.player1.passConflict();
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.skirmisher],
                defenders: [this.yoshi],
                type: 'military'
            });
            this.skirmisher.bowed = true;
            this.noMoreActions();
            expect(this.player2).not.toHavePrompt('Triggered Abilities');
        });

        it('should work with dishonored provinces', function() {
            this.sd1.dishonor();
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.fumiki],
                defenders: [this.skirmisher],
                type: 'military'
            });
            expect(this.sd1.isDishonored).toBe(true);

            this.noMoreActions();
            this.player2.clickCard(this.skirmisher);
            expect(this.player2).toBeAbleToSelect(this.sd1);
            this.player2.clickCard(this.sd1);
            this.player2.clickCard(this.yoshi);

            expect(this.yoshi.isHonored).toBe(false);
            expect(this.sd1.isDishonored).toBe(false);
        });
    });
});
