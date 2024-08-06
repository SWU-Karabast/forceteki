describe('A Game of Letters', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['kakita-yoshi', 'doji-fumiki', 'maker-of-keepsakes'],
                    hand: ['finger-of-jade']
                },
                player2: {
                    inPlay: ['doji-whisperer', 'doji-challenger'],
                    hand: ['a-game-of-letters']
                }
            });

            this.yoshi = this.player1.findCardByName('kakita-yoshi');
            this.fumiki = this.player1.findCardByName('doji-fumiki');
            this.keepsakes = this.player1.findCardByName('maker-of-keepsakes');
            this.dojiWhisperer = this.player2.findCardByName('doji-whisperer');
            this.challenger = this.player2.findCardByName('doji-challenger');
            this.game = this.player2.findCardByName('a-game-of-letters');
            this.jade = this.player1.findCardByName('finger-of-jade');

            this.yoshi.honor();
            this.dojiWhisperer.dishonor();
            this.challenger.honor();
        });

        it('should not work outside of conflicts', function() {
            this.player1.pass();
            expect(this.player2).toHavePrompt('Action Window');
            this.player2.clickCard(this.game);
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
            this.player2.clickCard(this.game);
            expect(this.player2).toHavePrompt('Conflict Action Window');
        });

        it('should let you target a token independent of participating', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.yoshi, this.keepsakes],
                defenders: [this.dojiWhisperer],
                type: 'political'
            });

            this.player2.clickCard(this.game);
            expect(this.player2).toHavePrompt('Choose a token');
            expect(this.player2).toBeAbleToSelect(this.yoshi);
            expect(this.player2).not.toBeAbleToSelect(this.fumiki);
            expect(this.player2).not.toBeAbleToSelect(this.keepsakes);
            expect(this.player2).toBeAbleToSelect(this.dojiWhisperer);
            expect(this.player2).toBeAbleToSelect(this.challenger);
        });

        it('should let you choose a character controlled by the player who doesn\'t control the character with the token', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.yoshi, this.keepsakes],
                defenders: [this.dojiWhisperer],
                type: 'political'
            });

            this.player2.clickCard(this.game);
            this.player2.clickCard(this.yoshi);

            expect(this.player2).not.toBeAbleToSelect(this.yoshi);
            expect(this.player2).not.toBeAbleToSelect(this.fumiki);
            expect(this.player2).not.toBeAbleToSelect(this.keepsakes);
            expect(this.player2).toBeAbleToSelect(this.dojiWhisperer);
            expect(this.player2).not.toBeAbleToSelect(this.challenger);
        });

        it('should apply the same effect as the token', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.yoshi, this.keepsakes],
                defenders: [this.dojiWhisperer],
                type: 'political'
            });

            this.player2.clickCard(this.game);
            this.player2.clickCard(this.yoshi);
            expect(this.dojiWhisperer.isDishonored).toBe(true);
            expect(this.player2).toBeAbleToSelect(this.dojiWhisperer);
            this.player2.clickCard(this.dojiWhisperer);
            expect(this.dojiWhisperer.isDishonored).toBe(false);
        });

        it('should apply the same effect as the token', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.yoshi, this.fumiki, this.keepsakes],
                defenders: [],
                type: 'political'
            });

            this.player2.clickCard(this.game);
            this.player2.clickCard(this.dojiWhisperer);
            expect(this.dojiWhisperer.isDishonored).toBe(true);
            expect(this.player2).toBeAbleToSelect(this.yoshi);
            expect(this.player2).not.toBeAbleToSelect(this.keepsakes);
            expect(this.player2).toBeAbleToSelect(this.fumiki);
            this.player2.clickCard(this.fumiki);
            expect(this.fumiki.isDishonored).toBe(true);
        });

        it('should only let you target a valid token', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.keepsakes],
                defenders: [],
                type: 'political'
            });

            this.player2.clickCard(this.game);
            expect(this.player2).toHavePrompt('Choose a token');
            expect(this.player2).not.toBeAbleToSelect(this.yoshi);
            expect(this.player2).not.toBeAbleToSelect(this.fumiki);
            expect(this.player2).not.toBeAbleToSelect(this.keepsakes);
            expect(this.player2).not.toBeAbleToSelect(this.dojiWhisperer);
            expect(this.player2).toBeAbleToSelect(this.challenger);
        });

        it('finger of jade should not stop the token selection', function() {
            this.player1.playAttachment(this.jade, this.yoshi);
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.yoshi, this.keepsakes],
                defenders: [this.dojiWhisperer],
                type: 'political'
            });

            this.player2.clickCard(this.game);
            this.player2.clickCard(this.yoshi);
            expect(this.dojiWhisperer.isDishonored).toBe(true);
            expect(this.player2).toBeAbleToSelect(this.dojiWhisperer);
            this.player2.clickCard(this.dojiWhisperer);
            expect(this.player1).not.toHavePrompt('Triggered Abilities');
            expect(this.dojiWhisperer.isDishonored).toBe(false);
        });
    });
});
