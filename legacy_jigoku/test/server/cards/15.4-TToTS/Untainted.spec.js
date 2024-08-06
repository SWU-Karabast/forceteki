describe('Untainted', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['kakita-yoshi', 'doji-fumiki'],
                    hand: ['untainted']
                },
                player2: {
                    inPlay: ['doji-challenger']
                }
            });

            this.yoshi = this.player1.findCardByName('kakita-yoshi');
            this.fumiki = this.player1.findCardByName('doji-fumiki');
            this.untainted = this.player1.findCardByName('untainted');

            this.challenger = this.player2.findCardByName('doji-challenger');
            this.sd1 = this.player2.findCardByName('shameful-display', 'province 1');
            this.sd2 = this.player2.findCardByName('shameful-display', 'province 2');

            this.yoshi.honor();
            this.fumiki.dishonor();
            this.challenger.dishonor();
            this.sd1.dishonor();
            this.sd2.dishonor();

            this.player1.playAttachment(this.untainted, this.sd1);
        });

        it('should react to winning a conflict', function() {
            expect(this.untainted.parent).toBe(this.sd1);

            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.yoshi],
                defenders: [this.challenger],
                type: 'political'
            });

            this.noMoreActions();
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.untainted);
        });

        it('should allow targeting of participating characters or the conflict province', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.yoshi],
                defenders: [this.challenger],
                type: 'political'
            });

            this.noMoreActions();

            this.player1.clickCard(this.untainted);
            expect(this.player1).toBeAbleToSelect(this.yoshi);
            expect(this.player1).toBeAbleToSelect(this.sd1);
            expect(this.player1).toBeAbleToSelect(this.challenger);

            expect(this.player1).not.toBeAbleToSelect(this.sd2);
            expect(this.player1).not.toBeAbleToSelect(this.fumiki);
        });

        it('should discard the token from the target and gain the owner 1 honor', function() {
            const initialHonor = this.player1.honor;

            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.yoshi],
                defenders: [this.challenger],
                type: 'political'
            });

            this.noMoreActions();

            this.player1.clickCard(this.untainted);
            this.player1.clickCard(this.yoshi);

            expect(this.yoshi.isDishonored).toBe(false);
            expect(this.yoshi.isHonored).toBe(false);
            expect(this.player1.honor).toBe(initialHonor + 1);
        });

        it('should prompt between two tokens to discard', function() {
            const initialHonor = this.player1.honor;

            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.yoshi],
                defenders: [this.challenger],
                type: 'political'
            });

            this.yoshi.taint();
            this.noMoreActions();

            this.player1.clickCard(this.untainted);
            this.player1.clickCard(this.yoshi);

            expect(this.player1).toHavePrompt('Which token do you wish to select?');
            expect(this.player1).toHavePromptButton('Honored Token');
            expect(this.player1).toHavePromptButton('Tainted Token');
            this.player1.clickPrompt('Tainted Token');

            expect(this.yoshi.isHonored).toBe(true);
            expect(this.yoshi.isTainted).toBe(false);
            expect(this.player1.honor).toBe(initialHonor + 1);

            expect(this.getChatLogs(5)).toContain('player1 uses Untainted to gain 1 honor and discard Tainted Token from Kakita Yoshi');
        });
    });
});
