describe('Blatant Swindler', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['kakita-yoshi', 'blatant-swindler']
                },
                player2: {
                    inPlay: ['doji-whisperer', 'doji-challenger']
                }
            });

            this.swindler = this.player1.findCardByName('blatant-swindler');
            this.yoshi = this.player1.findCardByName('kakita-yoshi');
            this.dojiWhisperer = this.player2.findCardByName('doji-whisperer');
            this.challenger = this.player2.findCardByName('doji-challenger');
        });

        it('should not work outside of conflicts', function() {
            expect(this.player1).toHavePrompt('Action Window');
            this.player1.clickCard(this.swindler);
            expect(this.player1).toHavePrompt('Action Window');
        });

        it('should make opponent choose a participating character they control to move home', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.swindler, this.yoshi],
                defenders: [this.dojiWhisperer],
                type: 'military'
            });

            this.player2.pass();
            this.player1.clickCard(this.swindler);
            expect(this.player2).toHavePrompt('Choose a character');
            expect(this.player2).not.toBeAbleToSelect(this.yoshi);
            expect(this.player2).not.toBeAbleToSelect(this.swindler);
            expect(this.player2).toBeAbleToSelect(this.dojiWhisperer);
            expect(this.player2).not.toBeAbleToSelect(this.challenger);
        });

        it('should move home the chosen character', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.swindler, this.yoshi],
                defenders: [this.dojiWhisperer],
                type: 'military'
            });

            this.player2.pass();
            this.player1.clickCard(this.swindler);
            expect(this.player2).toHavePrompt('Choose a character');
            expect(this.dojiWhisperer.inConflict).toBe(true);
            this.player2.clickCard(this.dojiWhisperer);
            expect(this.dojiWhisperer.inConflict).toBe(false);
            expect(this.getChatLogs(3)).toContain('player1 uses Blatant Swindler, giving 1 honor to player2 to send Doji Whisperer home');
        });

        it('should transfer an honor', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.swindler, this.yoshi],
                defenders: [this.dojiWhisperer],
                type: 'military'
            });

            let p1Honor = this.player1.honor;
            let p2Honor = this.player2.honor;

            this.player2.pass();
            this.player1.clickCard(this.swindler);
            this.player2.clickCard(this.dojiWhisperer);

            expect(this.player1.honor).toBe(p1Honor - 1);
            expect(this.player2.honor).toBe(p2Honor + 1);
        });

        it('should not work if not participating', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.yoshi],
                defenders: [this.dojiWhisperer],
                type: 'military'
            });

            this.player2.pass();
            expect(this.player1).toHavePrompt('Conflict Action Window');
            this.player1.clickCard(this.swindler);
            expect(this.player1).toHavePrompt('Conflict Action Window');
        });

        it('should not work if no opponent characters participating', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.yoshi, this.swindler],
                defenders: [],
                type: 'military'
            });

            this.player2.pass();
            expect(this.player1).toHavePrompt('Conflict Action Window');
            this.player1.clickCard(this.swindler);
            expect(this.player1).toHavePrompt('Conflict Action Window');
        });
    });
});
