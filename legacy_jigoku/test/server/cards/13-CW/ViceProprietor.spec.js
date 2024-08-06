describe('Vice Proprietor', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['kakita-yoshi', 'vice-proprietor']
                },
                player2: {
                    inPlay: ['doji-whisperer', 'doji-challenger']
                }
            });

            this.vice = this.player1.findCardByName('vice-proprietor');
            this.yoshi = this.player1.findCardByName('kakita-yoshi');
            this.dojiWhisperer = this.player2.findCardByName('doji-whisperer');
            this.challenger = this.player2.findCardByName('doji-challenger');
        });

        it('should not work outside of conflicts', function() {
            expect(this.player1).toHavePrompt('Action Window');
            this.player1.clickCard(this.vice);
            expect(this.player1).toHavePrompt('Action Window');
        });

        it('should make opponent choose a participating character they control to bow', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.vice, this.yoshi],
                defenders: [this.dojiWhisperer],
                type: 'military'
            });

            this.player2.pass();
            this.player1.clickCard(this.vice);
            expect(this.player2).toHavePrompt('Choose a character');
            expect(this.player2).not.toBeAbleToSelect(this.yoshi);
            expect(this.player2).not.toBeAbleToSelect(this.vice);
            expect(this.player2).toBeAbleToSelect(this.dojiWhisperer);
            expect(this.player2).not.toBeAbleToSelect(this.challenger);
        });

        it('should bow the chosen character', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.vice, this.yoshi],
                defenders: [this.dojiWhisperer],
                type: 'military'
            });

            this.player2.pass();
            this.player1.clickCard(this.vice);
            expect(this.player2).toHavePrompt('Choose a character');
            this.player2.clickCard(this.dojiWhisperer);
            expect(this.dojiWhisperer.bowed).toBe(true);
            expect(this.getChatLogs(3)).toContain('player1 uses Vice Proprietor, dishonoring Vice Proprietor to bow Doji Whisperer');
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
            this.player1.clickCard(this.vice);
            expect(this.player1).toHavePrompt('Conflict Action Window');
        });

        it('should not work if no opponent characters participating', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.yoshi, this.vice],
                defenders: [],
                type: 'military'
            });

            this.player2.pass();
            expect(this.player1).toHavePrompt('Conflict Action Window');
            this.player1.clickCard(this.vice);
            expect(this.player1).toHavePrompt('Conflict Action Window');
        });

        it('should not work if no opponent ready characters participating', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.yoshi, this.vice],
                defenders: [this.challenger],
                type: 'military'
            });

            this.challenger.bowed = true;

            this.player2.pass();
            expect(this.player1).toHavePrompt('Conflict Action Window');
            this.player1.clickCard(this.vice);
            expect(this.player1).toHavePrompt('Conflict Action Window');
        });
    });
});
