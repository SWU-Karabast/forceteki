describe('Hige\'s Sermon', function() {
    integration(function() {
        describe('Hige\'s Sermon\'s ability', function() {
            beforeEach(function() {
                this.setupTest({
                    phase: 'draw',
                    player1: {
                        inPlay: ['kakita-toshimoko', 'doji-challenger'],
                        hand: ['hige-s-sermon', 'above-question']
                    },
                    player2: {
                        inPlay: ['kakita-yoshi', 'doji-whisperer'],
                        hand: ['hige-s-sermon', 'finger-of-jade']
                    }
                });
                this.player1.clickPrompt('1');
                this.player2.clickPrompt('1');

                this.toshimoko = this.player1.findCardByName('kakita-toshimoko');
                this.challenger = this.player1.findCardByName('doji-challenger');

                this.yoshi = this.player2.findCardByName('kakita-yoshi');
                this.whisperer = this.player2.findCardByName('doji-whisperer');

                this.sermon1 = this.player1.findCardByName('hige-s-sermon');
                this.sermon2 = this.player2.findCardByName('hige-s-sermon');

                this.aboveQuestion = this.player1.findCardByName('above-question');
                this.jade = this.player2.findCardByName('finger-of-jade');
            });

            it('should make each player choose a target in turn order and bow chosen targets (first player initiates)', function() {
                this.player1.clickCard(this.sermon1);
                expect(this.player1).toHavePrompt('Choose a character to bow');
                expect(this.player1).toBeAbleToSelect(this.yoshi);
                expect(this.player1).toBeAbleToSelect(this.whisperer);
                expect(this.player1).not.toBeAbleToSelect(this.toshimoko);
                expect(this.player1).not.toBeAbleToSelect(this.challenger);
                this.player1.clickCard(this.yoshi);

                expect(this.player2).toHavePrompt('Choose a character to bow');
                expect(this.player2).not.toBeAbleToSelect(this.yoshi);
                expect(this.player2).not.toBeAbleToSelect(this.whisperer);
                expect(this.player2).toBeAbleToSelect(this.toshimoko);
                expect(this.player2).toBeAbleToSelect(this.challenger);
                this.player2.clickCard(this.toshimoko);

                expect(this.getChatLogs(1)).toContain('player1 plays Hige\'s Sermon to bow Kakita Yoshi and Kakita Toshimoko');
            });

            it('should make each player choose a target in turn order and bow chosen targets (second player initiates)', function() {
                this.player1.pass();
                this.player2.clickCard(this.sermon2);
                expect(this.player1).toHavePrompt('Choose a character to bow');
                expect(this.player1).toBeAbleToSelect(this.yoshi);
                expect(this.player1).toBeAbleToSelect(this.whisperer);
                expect(this.player1).not.toBeAbleToSelect(this.toshimoko);
                expect(this.player1).not.toBeAbleToSelect(this.challenger);
                this.player1.clickCard(this.yoshi);

                expect(this.player2).toHavePrompt('Choose a character to bow');
                expect(this.player2).not.toBeAbleToSelect(this.yoshi);
                expect(this.player2).not.toBeAbleToSelect(this.whisperer);
                expect(this.player2).toBeAbleToSelect(this.toshimoko);
                expect(this.player2).toBeAbleToSelect(this.challenger);
                this.player2.clickCard(this.toshimoko);

                expect(this.getChatLogs(1)).toContain('player2 plays Hige\'s Sermon to bow Kakita Yoshi and Kakita Toshimoko');
            });

            it('should not allow selecting a character who is already bowed', function() {
                this.yoshi.bowed = true;

                this.player1.pass();
                this.player2.clickCard(this.sermon2);
                expect(this.player1).toHavePrompt('Choose a character to bow');
                expect(this.player1).not.toBeAbleToSelect(this.yoshi);
                expect(this.player1).toBeAbleToSelect(this.whisperer);
                expect(this.player1).not.toBeAbleToSelect(this.toshimoko);
                expect(this.player1).not.toBeAbleToSelect(this.challenger);
                this.player1.clickCard(this.whisperer);

                expect(this.player2).toHavePrompt('Choose a character to bow');
                expect(this.player2).not.toBeAbleToSelect(this.yoshi);
                expect(this.player2).not.toBeAbleToSelect(this.whisperer);
                expect(this.player2).toBeAbleToSelect(this.toshimoko);
                expect(this.player2).toBeAbleToSelect(this.challenger);
                this.player2.clickCard(this.toshimoko);

                expect(this.getChatLogs(1)).toContain('player2 plays Hige\'s Sermon to bow Doji Whisperer and Kakita Toshimoko');
            });

            it('should not allow selecting a character who canot be targeted', function() {
                this.player1.playAttachment(this.aboveQuestion, this.toshimoko);

                this.player2.clickCard(this.sermon2);
                expect(this.player1).toHavePrompt('Choose a character to bow');
                expect(this.player1).toBeAbleToSelect(this.yoshi);
                expect(this.player1).toBeAbleToSelect(this.whisperer);
                expect(this.player1).not.toBeAbleToSelect(this.toshimoko);
                expect(this.player1).not.toBeAbleToSelect(this.challenger);
                this.player1.clickCard(this.whisperer);

                expect(this.player2).toHavePrompt('Choose a character to bow');
                expect(this.player2).not.toBeAbleToSelect(this.yoshi);
                expect(this.player2).not.toBeAbleToSelect(this.whisperer);
                expect(this.player2).not.toBeAbleToSelect(this.toshimoko);
                expect(this.player2).toBeAbleToSelect(this.challenger);
                this.player2.clickCard(this.challenger);

                expect(this.getChatLogs(1)).toContain('player2 plays Hige\'s Sermon to bow Doji Whisperer and Doji Challenger');
            });

            it('finger of jade should cancel bowing of both characters', function() {
                this.player1.pass();
                this.player2.playAttachment(this.jade, this.whisperer);

                this.player1.clickCard(this.sermon1);
                expect(this.player1).toHavePrompt('Choose a character to bow');
                expect(this.player1).toBeAbleToSelect(this.yoshi);
                expect(this.player1).toBeAbleToSelect(this.whisperer);
                expect(this.player1).not.toBeAbleToSelect(this.toshimoko);
                expect(this.player1).not.toBeAbleToSelect(this.challenger);
                this.player1.clickCard(this.whisperer);

                expect(this.player2).toHavePrompt('Choose a character to bow');
                expect(this.player2).not.toBeAbleToSelect(this.yoshi);
                expect(this.player2).not.toBeAbleToSelect(this.whisperer);
                expect(this.player2).toBeAbleToSelect(this.toshimoko);
                expect(this.player2).toBeAbleToSelect(this.challenger);
                this.player2.clickCard(this.challenger);

                expect(this.getChatLogs(1)).toContain('player1 plays Hige\'s Sermon to bow Doji Whisperer and Doji Challenger');

                expect(this.player2).toHavePrompt('Triggered Abilities');
                expect(this.player2).toBeAbleToSelect(this.jade);
                this.player2.clickCard(this.jade);
                expect(this.challenger.bowed).toBe(false);
                expect(this.whisperer.bowed).toBe(false);
            });

            it('should not be able to trigger if a player has no valid target (p1)', function() {
                this.toshimoko.bowed = true;
                this.challenger.bowed = true;

                this.player1.pass();
                expect(this.player2).toHavePrompt('Action Window');
                this.player2.clickCard(this.sermon2);
                expect(this.player2).toHavePrompt('Action Window');
            });

            it('should not be able to trigger if a player has no valid target (p2)', function() {
                this.yoshi.bowed = true;
                this.whisperer.bowed = true;

                this.player1.pass();
                expect(this.player2).toHavePrompt('Action Window');
                this.player2.clickCard(this.sermon2);
                expect(this.player2).toHavePrompt('Action Window');
            });
        });

        describe('Hige\'s Sermon\'s ability - non-draw phase', function() {
            beforeEach(function() {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['kakita-toshimoko', 'doji-challenger'],
                        hand: ['hige-s-sermon']
                    },
                    player2: {
                        inPlay: ['kakita-yoshi', 'doji-whisperer'],
                        hand: ['hige-s-sermon']
                    }
                });
                this.toshimoko = this.player1.findCardByName('kakita-toshimoko');
                this.challenger = this.player1.findCardByName('doji-challenger');

                this.yoshi = this.player2.findCardByName('kakita-yoshi');
                this.whisperer = this.player2.findCardByName('doji-whisperer');

                this.sermon1 = this.player1.findCardByName('hige-s-sermon');
                this.sermon2 = this.player2.findCardByName('hige-s-sermon');
            });

            it('should not work outside of the draw phase', function() {
                expect(this.player1).toHavePrompt('Action Window');
                this.player1.clickCard(this.sermon1);
                expect(this.player1).toHavePrompt('Action Window');
            });
        });
    });
});
