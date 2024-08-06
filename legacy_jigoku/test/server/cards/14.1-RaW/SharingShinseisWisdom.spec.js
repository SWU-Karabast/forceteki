describe('Sharing Shinseis Wisdom', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['kakita-yoshi', 'doji-fumiki', 'maker-of-keepsakes']
                },
                player2: {
                    inPlay: ['doji-whisperer', 'doji-challenger'],
                    provinces: ['sharing-shinsei-s-wisdom']
                }
            });

            this.yoshi = this.player1.findCardByName('kakita-yoshi');
            this.fumiki = this.player1.findCardByName('doji-fumiki');
            this.keepsakes = this.player1.findCardByName('maker-of-keepsakes');
            this.dojiWhisperer = this.player2.findCardByName('doji-whisperer');
            this.challenger = this.player2.findCardByName('doji-challenger');
            this.wisdom = this.player2.findCardByName('sharing-shinsei-s-wisdom');

            this.yoshi.fate = 2;
            this.keepsakes.fate = 1;
            this.challenger.fate = 1;
        });

        it('should react on reveal', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.yoshi],
                type: 'military',
                province: this.wisdom
            });

            expect(this.player2).toHavePrompt('Triggered Abilities');
            expect(this.player2).toBeAbleToSelect(this.wisdom);
        });

        it('should let you target a character with fate', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.yoshi],
                type: 'military',
                province: this.wisdom
            });

            this.player2.clickCard(this.wisdom);
            expect(this.player2).toHavePrompt('Choose a character');
            expect(this.player2).toBeAbleToSelect(this.yoshi);
            expect(this.player2).toBeAbleToSelect(this.keepsakes);
            expect(this.player2).toBeAbleToSelect(this.challenger);
            expect(this.player2).not.toBeAbleToSelect(this.dojiWhisperer);
            expect(this.player2).not.toBeAbleToSelect(this.fumiki);
        });

        it('should then let you target a character controlled by the same player who is not the original target - opponent', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.yoshi],
                type: 'military',
                province: this.wisdom
            });

            this.player2.clickCard(this.wisdom);
            this.player2.clickCard(this.yoshi);
            expect(this.player2).toHavePrompt('Choose a character to receive a fate');
            expect(this.player2).not.toBeAbleToSelect(this.yoshi);
            expect(this.player2).toBeAbleToSelect(this.keepsakes);
            expect(this.player2).not.toBeAbleToSelect(this.challenger);
            expect(this.player2).not.toBeAbleToSelect(this.dojiWhisperer);
            expect(this.player2).toBeAbleToSelect(this.fumiki);
        });

        it('should then let you target a character controlled by the same player who is not the original target - self', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.yoshi],
                type: 'military',
                province: this.wisdom
            });

            this.player2.clickCard(this.wisdom);
            this.player2.clickCard(this.challenger);
            expect(this.player2).toHavePrompt('Choose a character to receive a fate');
            expect(this.player2).not.toBeAbleToSelect(this.yoshi);
            expect(this.player2).not.toBeAbleToSelect(this.keepsakes);
            expect(this.player2).not.toBeAbleToSelect(this.challenger);
            expect(this.player2).toBeAbleToSelect(this.dojiWhisperer);
            expect(this.player2).not.toBeAbleToSelect(this.fumiki);
        });

        it('should move the fate', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.yoshi],
                type: 'military',
                province: this.wisdom
            });

            let yoshiFate = this.yoshi.fate;
            let fumikiFate = this.fumiki.fate;

            this.player2.clickCard(this.wisdom);
            this.player2.clickCard(this.yoshi);
            this.player2.clickCard(this.fumiki);

            expect(this.yoshi.fate).toBe(yoshiFate - 1);
            expect(this.fumiki.fate).toBe(fumikiFate + 1);
            expect(this.getChatLogs(3)).toContain('player2 uses Sharing Shinsei\'s Wisdom to move 1 fate from Kakita Yoshi to another character');
            expect(this.getChatLogs(3)).toContain('player2 moves 1 fate from Kakita Yoshi to Doji Fumiki');
        });
    });
});
