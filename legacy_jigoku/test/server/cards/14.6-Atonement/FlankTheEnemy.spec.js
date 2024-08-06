describe('Flank the Enemy', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['kakita-yoshi', 'vice-proprietor', 'masterpiece-painter']
                },
                player2: {
                    inPlay: ['doji-whisperer', 'doji-challenger', 'border-rider'],
                    hand: ['flank-the-enemy']
                }
            });

            this.vice = this.player1.findCardByName('vice-proprietor');
            this.yoshi = this.player1.findCardByName('kakita-yoshi');
            this.painter = this.player1.findCardByName('masterpiece-painter');
            this.dojiWhisperer = this.player2.findCardByName('doji-whisperer');
            this.challenger = this.player2.findCardByName('doji-challenger');
            this.rider = this.player2.findCardByName('border-rider');
            this.flank = this.player2.findCardByName('flank-the-enemy');
        });

        it('should not work outside of conflicts', function() {
            this.player1.pass();
            expect(this.player2).toHavePrompt('Action Window');
            this.player2.clickCard(this.flank);
            expect(this.player2).toHavePrompt('Action Window');
        });

        it('should make opponent choose a participating character they control to bow', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.vice, this.yoshi],
                defenders: [this.dojiWhisperer, this.challenger, this.rider],
                type: 'military'
            });

            this.player2.clickCard(this.flank);
            expect(this.player1).toHavePrompt('Choose a character');
            expect(this.player1).toBeAbleToSelect(this.yoshi);
            expect(this.player1).toBeAbleToSelect(this.vice);
            expect(this.player1).not.toBeAbleToSelect(this.painter);
            expect(this.player1).not.toBeAbleToSelect(this.challenger);
            expect(this.player1).not.toBeAbleToSelect(this.dojiWhisperer);
            expect(this.player1).not.toBeAbleToSelect(this.rider);
        });

        it('should bow the chosen character', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.vice, this.yoshi],
                defenders: [this.dojiWhisperer, this.challenger, this.rider],
                type: 'military'
            });

            this.player2.clickCard(this.flank);
            expect(this.player1).toHavePrompt('Choose a character');
            this.player1.clickCard(this.vice);
            expect(this.vice.bowed).toBe(true);
            expect(this.getChatLogs(3)).toContain('player2 plays Flank the Enemy to bow Vice Proprietor');
        });

        it('should not work if equal on participating characters', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.yoshi],
                defenders: [this.dojiWhisperer],
                type: 'military'
            });

            expect(this.player2).toHavePrompt('Conflict Action Window');
            this.player2.clickCard(this.flank);
            expect(this.player2).toHavePrompt('Conflict Action Window');
        });

        it('should not work if lower on participating characters', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.yoshi, this.vice],
                defenders: [this.dojiWhisperer],
                type: 'military'
            });

            expect(this.player2).toHavePrompt('Conflict Action Window');
            this.player2.clickCard(this.flank);
            expect(this.player2).toHavePrompt('Conflict Action Window');
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
            this.player1.passConflict();
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.challenger],
                defenders: [],
                type: 'military'
            });

            this.player1.pass();
            expect(this.player2).toHavePrompt('Conflict Action Window');
            this.player2.clickCard(this.flank);
            expect(this.player2).toHavePrompt('Conflict Action Window');
        });
    });
});
