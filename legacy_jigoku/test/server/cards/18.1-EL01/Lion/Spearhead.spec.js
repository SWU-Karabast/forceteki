describe('Spearhead', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['kakita-yoshi'],
                    hand: ['spearhead', 'fine-katana', 'a-new-name']
                },
                player2: {
                    inPlay: ['doji-whisperer', 'doji-challenger'],
                    hand: ['ornate-fan', 'kakita-blade']
                }
            });

            this.yoshi = this.player1.findCardByName('kakita-yoshi');
            this.dojiWhisperer = this.player2.findCardByName('doji-whisperer');
            this.challenger = this.player2.findCardByName('doji-challenger');
            this.spearhead = this.player1.findCardByName('spearhead');
            this.katana = this.player1.findCardByName('fine-katana');
            this.fan = this.player2.findCardByName('ornate-fan');
            this.ann = this.player1.findCardByName('a-new-name');
            this.blade = this.player2.findCardByName('kakita-blade');
            this.player1.playAttachment(this.katana, this.yoshi);
            this.player2.playAttachment(this.fan, this.yoshi);
            this.player1.playAttachment(this.ann, this.challenger);
            this.player2.playAttachment(this.blade, this.challenger);
        });

        it('should not work outside of conflicts', function() {
            expect(this.player1).toHavePrompt('Action Window');
            this.player1.clickCard(this.spearhead);
            expect(this.player1).toHavePrompt('Action Window');
        });

        it('should sac an attachment to make opponent choose a participating character they control to bow', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.yoshi],
                defenders: [this.dojiWhisperer],
                type: 'military'
            });

            this.player2.pass();
            this.player1.clickCard(this.spearhead);
            expect(this.player1).toHavePrompt('Select card to sacrifice');
            expect(this.player1).toBeAbleToSelect(this.katana);
            expect(this.player1).not.toBeAbleToSelect(this.fan);
            expect(this.player1).not.toBeAbleToSelect(this.ann);
            expect(this.player1).not.toBeAbleToSelect(this.blade);
            this.player1.clickCard(this.katana);

            expect(this.player2).toHavePrompt('Choose a character');
            expect(this.player2).not.toBeAbleToSelect(this.yoshi);
            expect(this.player2).toBeAbleToSelect(this.dojiWhisperer);
            expect(this.player2).not.toBeAbleToSelect(this.challenger);

            this.player2.clickCard(this.dojiWhisperer);

            expect(this.dojiWhisperer.bowed).toBe(true);
            expect(this.katana.location).toBe('conflict discard pile');
            expect(this.getChatLogs(3)).toContain('player1 plays Spearhead, sacrificing Fine Katana to bow Doji Whisperer');
        });

        it('should not work in pol conflicts', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.yoshi],
                defenders: [this.dojiWhisperer],
                type: 'political'
            });

            this.player2.pass();
            expect(this.player1).toHavePrompt('Conflict Action Window');
            this.player1.clickCard(this.spearhead);
            expect(this.player1).toHavePrompt('Conflict Action Window');
        });

        it('should not work if no opponent characters participating', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.yoshi],
                defenders: [],
                type: 'military'
            });

            this.player2.pass();
            expect(this.player1).toHavePrompt('Conflict Action Window');
            this.player1.clickCard(this.spearhead);
            expect(this.player1).toHavePrompt('Conflict Action Window');
        });

        it('should not work if no opponent ready characters participating', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.yoshi],
                defenders: [this.challenger],
                type: 'military'
            });

            this.challenger.bowed = true;

            this.player2.pass();
            expect(this.player1).toHavePrompt('Conflict Action Window');
            this.player1.clickCard(this.spearhead);
            expect(this.player1).toHavePrompt('Conflict Action Window');
        });
    });
});
