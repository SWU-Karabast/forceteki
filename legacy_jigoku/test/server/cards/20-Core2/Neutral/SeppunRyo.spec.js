describe('Swordguy', function () {
    integration(function () {
        describe('Ignore skill', function () {
            beforeEach(function () {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        fate: 20,
                        inPlay: ['doji-challenger', 'doji-whisperer', 'kakita-yoshi'],
                        hand: ['a-fate-worse-than-death', 'desolation'],
                        dynastyDiscard: ['awakened-tsukumogami', 'promising-kohai']
                    },
                    player2: {
                        inPlay: ['seppun-ryo', 'kakita-toshimoko'],
                        hand: ['embrace-the-void', 'policy-debate']
                    }
                });

                this.yoshi = this.player1.findCardByName('kakita-yoshi');
                this.whisperer = this.player1.findCardByName('doji-whisperer');
                this.student = this.player1.findCardByName('promising-kohai');
                this.ryo = this.player2.findCardByName('seppun-ryo');
                this.challenger = this.player1.findCardByName('doji-challenger');
                this.toshimoko = this.player2.findCardByName('kakita-toshimoko');
                this.pd = this.player2.findCardByName('policy-debate');
            });

            it('refusal condition - should be allowable if opponent has the imperial favor', function () {
                this.player1.player.imperialFavor = 'military';

                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.yoshi],
                    defenders: [this.ryo]
                });

                this.player2.clickCard(this.ryo);
                this.player2.clickCard(this.yoshi);

                expect(this.player1).toHavePrompt('Do you wish to refuse the duel?');
                expect(this.player1).toHavePromptButton('Yes');
                expect(this.player1).toHavePromptButton('No');

                this.player1.clickPrompt('Yes');

                expect(this.getChatLogs(5)).toContain(
                    'player2 uses Seppun Ryo to initiate a military duel : Seppun Ryo vs. Kakita Yoshi'
                );
                expect(this.getChatLogs(5)).toContain(
                    'player1 chooses to refuse the duel and give the imperial favor to player2'
                );

                expect(this.player1).toHavePrompt('Conflict Action Window');

                expect(this.player1.player.imperialFavor).toBe('');
                expect(this.player2.player.imperialFavor).toBe('military');
            });

            it('no refusal - should duel and bow loser', function () {
                this.player1.player.imperialFavor = 'military';

                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.yoshi],
                    defenders: [this.ryo]
                });

                this.player2.clickCard(this.ryo);
                this.player2.clickCard(this.yoshi);

                expect(this.player1).toHavePrompt('Do you wish to refuse the duel?');
                expect(this.player1).toHavePromptButton('Yes');
                expect(this.player1).toHavePromptButton('No');

                this.player1.clickPrompt('No');

                expect(this.getChatLogs(5)).toContain(
                    'player2 uses Seppun Ryo to initiate a military duel : Seppun Ryo vs. Kakita Yoshi'
                );
                expect(this.player1).toHavePrompt('Honor Bid');
                this.player1.clickPrompt('1');
                this.player2.clickPrompt('1');

                expect(this.getChatLogs(10)).toContain('Seppun Ryo: 4 vs 3: Kakita Yoshi');
                expect(this.getChatLogs(10)).toContain('Duel Effect: bow Kakita Yoshi');
            });

            it('duel focus (and no refusal)', function () {
                this.player2.player.imperialFavor = 'military';
                this.player1.player.imperialFavor = '';

                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.yoshi],
                    defenders: [this.ryo]
                });

                this.player2.clickCard(this.ryo);
                this.player2.clickCard(this.yoshi);

                expect(this.getChatLogs(5)).toContain(
                    'player2 uses Seppun Ryo to initiate a military duel : Seppun Ryo vs. Kakita Yoshi'
                );
                expect(this.player1).toHavePrompt('Honor Bid');
                this.player1.clickPrompt('1');
                this.player2.clickPrompt('1');

                expect(this.player2).toBeAbleToSelect(this.ryo);
                this.player2.clickCard(this.ryo);

                expect(this.getChatLogs(10)).toContain('player2 uses Seppun Ryo to add 1 to their duel total');

                expect(this.getChatLogs(10)).toContain('Seppun Ryo: 5 vs 3: Kakita Yoshi');
                expect(this.getChatLogs(10)).toContain('Duel Effect: bow Kakita Yoshi');
            });
        });
    });
});
