describe('Daidoji Akikore', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    fate: 20,
                    inPlay: ['daidoji-akikore', 'brash-samurai']
                },
                player2: {
                    inPlay: ['kakita-toshimoko', 'doji-whisperer', 'bayushi-liar'],
                    hand: ['policy-debate']
                }
            });

            this.akikore = this.player1.findCardByName('daidoji-akikore');
            this.brash = this.player1.findCardByName('brash-samurai');
            this.toshimoko = this.player2.findCardByName('kakita-toshimoko');
            this.whisperer = this.player2.findCardByName('doji-whisperer');
            this.liar = this.player2.findCardByName('bayushi-liar');
            this.pd = this.player2.findCardByName('policy-debate');
        });

        it('lose duel - should do nothing', function () {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.akikore, this.brash],
                defenders: [this.toshimoko]
            });

            this.player2.pass();
            this.player1.clickCard(this.akikore);

            expect(this.player2).toBeAbleToSelect(this.toshimoko);
            expect(this.player2).not.toBeAbleToSelect(this.whisperer);
            this.player2.clickCard(this.toshimoko);

            expect(this.getChatLogs(10)).toContain('player1 uses Daidōji Akikore to initiate a military duel : Daidōji Akikore vs. Kakita Toshimoko');

            this.player1.clickPrompt('1');
            this.player2.clickPrompt('1');

            expect(this.getChatLogs(10)).toContain('Daidōji Akikore: 4 vs 5: Kakita Toshimoko');
            expect(this.getChatLogs(10)).toContain('Duel Effect: no effect');
            expect(this.getChatLogs(10)).toContain('Military Air conflict - Attacker: 5 Defender: 4');
        });

        it('win duel - should give +3', function () {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.akikore, this.brash],
                defenders: [this.toshimoko]
            });

            this.player2.pass();
            this.player1.clickCard(this.akikore);
            expect(this.player2).toBeAbleToSelect(this.toshimoko);
            this.player2.clickCard(this.toshimoko);

            expect(this.getChatLogs(10)).toContain('player1 uses Daidōji Akikore to initiate a military duel : Daidōji Akikore vs. Kakita Toshimoko');

            this.player1.clickPrompt('3');
            this.player2.clickPrompt('1');

            expect(this.getChatLogs(10)).toContain('Daidōji Akikore: 6 vs 5: Kakita Toshimoko');
            expect(this.getChatLogs(10)).toContain("Duel Effect: add 3 to player1's side for this conflict");
            expect(this.getChatLogs(10)).toContain('Military Air conflict - Attacker: 8 Defender: 4');
        });

        it('duel focus should give +1 during a pol conflict', function () {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.akikore, this.brash],
                defenders: [this.toshimoko],
                type: 'political'
            });

            this.player2.pass();
            this.player1.clickCard(this.akikore);
            expect(this.player2).toBeAbleToSelect(this.toshimoko);
            this.player2.clickCard(this.toshimoko);

            expect(this.getChatLogs(10)).toContain('player1 uses Daidōji Akikore to initiate a military duel : Daidōji Akikore vs. Kakita Toshimoko');

            this.player1.clickPrompt('3');
            this.player2.clickPrompt('1');

            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.akikore);
            this.player1.clickCard(this.akikore);

            expect(this.getChatLogs(10)).toContain('player1 uses Daidōji Akikore to add 1 to their duel total');

            expect(this.getChatLogs(10)).toContain('Daidōji Akikore: 7 vs 5: Kakita Toshimoko');
            expect(this.getChatLogs(10)).toContain("Duel Effect: add 3 to player1's side for this conflict");
            expect(this.getChatLogs(10)).toContain('Political Air conflict - Attacker: 7 Defender: 3');
        });

        it('duel focus should not trigger if not dueling', function () {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.akikore, this.brash],
                defenders: [this.toshimoko],
                type: 'political'
            });

            this.player2.clickCard(this.pd);
            this.player2.clickCard(this.toshimoko);
            this.player2.clickCard(this.brash);

            this.player1.clickPrompt('1');
            this.player2.clickPrompt('1');

            expect(this.player1).not.toHavePrompt('Triggered Abilities');

            expect(this.getChatLogs(10)).toContain('Kakita Toshimoko: 4 vs 2: Brash Samurai');
        });

        it('should trigger from home', function () {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.brash],
                defenders: [this.toshimoko, this.whisperer]
            });

            this.player2.pass();
            this.player1.clickCard(this.akikore);
            expect(this.player2).toBeAbleToSelect(this.toshimoko);
            this.player2.clickCard(this.toshimoko);

            expect(this.getChatLogs(10)).toContain('player1 uses Daidōji Akikore to initiate a military duel : Daidōji Akikore vs. Kakita Toshimoko');

            this.player1.clickPrompt('3');
            this.player2.clickPrompt('1');

            expect(this.getChatLogs(10)).toContain('Daidōji Akikore: 6 vs 5: Kakita Toshimoko');
            expect(this.getChatLogs(10)).toContain("Duel Effect: add 3 to player1's side for this conflict");
            expect(this.getChatLogs(10)).toContain('Military Air conflict - Attacker: 5 Defender: 4');
        });

        it('should not trigger if opponent has no participating characters', function () {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.brash],
                defenders: []
            });

            this.player2.pass();
            expect(this.player1).toHavePrompt('Conflict Action Window');
            this.player1.clickCard(this.akikore);
            expect(this.player1).toHavePrompt('Conflict Action Window');
        });
    });
});
