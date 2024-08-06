describe('Truth is in the Killing', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    fate: 20,
                    inPlay: ['doji-challenger', 'cunning-negotiator', 'daidoji-uji', 'borderlands-defender'],
                    hand: ['truth-is-in-the-killing'],
                    conflictDiscard: ['two-hands']
                },
                player2: {
                    inPlay: ['kakita-toshimoko', 'shiba-tsukune', 'doji-diplomat'],
                    hand: ['embrace-the-void', 'policy-debate']
                }
            });

            this.uji = this.player1.findCardByName('daidoji-uji');
            this.borderlandsDefender = this.player1.findCardByName('borderlands-defender');
            this.cunningNegotiator = this.player1.findCardByName('cunning-negotiator');
            this.truth = this.player1.findCardByName('truth-is-in-the-killing');
            this.toshimoko = this.player2.findCardByName('kakita-toshimoko');
            this.challenger = this.player1.findCardByName('doji-challenger');
            this.tsukune = this.player2.findCardByName('shiba-tsukune');
            this.diplomat = this.player2.findCardByName('doji-diplomat');
            this.pd = this.player2.findCardByName('policy-debate');

            this.hands = this.player1.findCardByName('two-hands');
        });

        describe('when winner is not Duelist', function () {
            it('returns fate from loser to their controller', function () {
                let fate1 = this.player1.fate;
                let fate2 = this.player2.fate;

                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.borderlandsDefender, this.cunningNegotiator],
                    defenders: [this.tsukune, this.toshimoko]
                });

                this.toshimoko.fate = 4;
                this.player2.pass();

                this.player1.clickCard(this.truth);
                expect(this.player1).toBeAbleToSelect(this.borderlandsDefender);
                expect(this.player1).not.toBeAbleToSelect(this.cunningNegotiator);
                this.player1.clickCard(this.borderlandsDefender);
                this.player1.clickCard(this.toshimoko);

                this.player1.clickPrompt('5');
                this.player2.clickPrompt('1');

                expect(this.player1.fate).toBe(fate1 - 1);
                expect(this.player2.fate).toBe(fate2 + 4);
                expect(this.toshimoko.location).toBe('play area');
                expect(this.getChatLogs(10)).toContain(
                    'player1 plays Truth Is In the Killing to initiate a military duel : Borderlands Defender vs. Kakita Toshimoko'
                );
                expect(this.getChatLogs(10)).toContain(
                    "Duel Effect: return all fate on Kakita Toshimoko to player2's fate pool"
                );
            });
        });

        describe('when winner is Duelist', function () {
            it('should discard the loser and return fate to its controller', function () {
                let fate1 = this.player1.fate;
                let fate2 = this.player2.fate;

                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.challenger, this.cunningNegotiator],
                    defenders: [this.tsukune, this.toshimoko]
                });

                this.toshimoko.fate = 4;
                this.player2.pass();

                this.player1.clickCard(this.truth);
                expect(this.player1).toBeAbleToSelect(this.challenger);
                expect(this.player1).not.toBeAbleToSelect(this.cunningNegotiator);
                this.player1.clickCard(this.challenger);
                this.player1.clickCard(this.toshimoko);

                this.player1.clickPrompt('5');
                this.player2.clickPrompt('1');

                expect(this.player1.fate).toBe(fate1 - 1);
                expect(this.player2.fate).toBe(fate2 + 4);
                expect(this.toshimoko.location).toBe('dynasty discard pile');
                expect(this.getChatLogs(10)).toContain(
                    'player1 plays Truth Is In the Killing to initiate a military duel : Doji Challenger vs. Kakita Toshimoko'
                );
                expect(this.getChatLogs(10)).toContain(
                    "Duel Effect: return all fate on Kakita Toshimoko to player2's fate pool and discard them"
                );
            });

            it('should discard the loser and return fate to its controller (self losing)', function () {
                let fate1 = this.player1.fate;
                let fate2 = this.player2.fate;

                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.challenger, this.cunningNegotiator],
                    defenders: [this.tsukune, this.toshimoko]
                });

                this.challenger.fate = 3;
                this.toshimoko.fate = 4;
                this.player2.pass();

                this.player1.clickCard(this.truth);
                this.player1.clickCard(this.challenger);
                this.player1.clickCard(this.toshimoko);

                this.player1.clickPrompt('1');
                this.player2.clickPrompt('5');

                expect(this.player1.fate).toBe(fate1 + 2);
                expect(this.player2.fate).toBe(fate2);
                expect(this.challenger.location).toBe('dynasty discard pile');
                expect(this.toshimoko.location).toBe('play area');
                expect(this.toshimoko.fate).toBe(4);
                expect(this.getChatLogs(10)).toContain(
                    'player1 plays Truth Is In the Killing to initiate a military duel : Doji Challenger vs. Kakita Toshimoko'
                );
                expect(this.getChatLogs(10)).toContain(
                    "Duel Effect: return all fate on Doji Challenger to player1's fate pool and discard them"
                );
            });

            it('should not work in pol conflicts', function () {
                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.challenger, this.cunningNegotiator],
                    defenders: [this.tsukune, this.toshimoko],
                    type: 'political'
                });

                this.player2.pass();

                expect(this.player1).toHavePrompt('Conflict Action Window');
                this.player1.clickCard(this.truth);
                expect(this.player1).toHavePrompt('Conflict Action Window');
            });

            it('multiple targets', function () {
                let fate1 = this.player1.fate;
                let fate2 = this.player2.fate;

                this.player1.moveCard(this.hands, 'hand');

                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.challenger, this.cunningNegotiator],
                    defenders: [this.diplomat, this.toshimoko]
                });

                this.toshimoko.fate = 4;
                this.diplomat.fate = 3;
                this.player2.pass();

                this.player1.clickCard(this.truth);
                this.player1.clickCard(this.challenger);
                this.player1.clickCard(this.toshimoko);
                this.player1.clickCard(this.hands);
                this.player1.clickCard(this.diplomat);

                this.player1.clickPrompt('5');
                this.player2.clickPrompt('1');

                expect(this.player1.fate).toBe(fate1 - 1);
                expect(this.player2.fate).toBe(fate2 + 7);
                expect(this.toshimoko.location).toBe('dynasty discard pile');
                expect(this.diplomat.location).toBe('dynasty discard pile');
                expect(this.getChatLogs(10)).toContain(
                    "Duel Effect: return all fate on Kakita Toshimoko and Doji Diplomat to player2's fate pool and discard them"
                );
            });
        });
    });
});
