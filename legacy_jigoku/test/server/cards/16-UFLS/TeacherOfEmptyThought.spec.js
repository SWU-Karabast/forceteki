describe('Teacher of Empty Thought', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['teacher-of-empty-thought', 'doji-whisperer'],
                    hand: ['fine-katana', 'ornate-fan', 'a-new-name']
                },
                player2: {
                    inPlay: ['bayushi-liar', 'bayushi-manipulator']
                }
            });
            this.teach = this.player1.findCardByName('teacher-of-empty-thought');
            this.whisperer = this.player1.findCardByName('doji-whisperer');
            this.katana = this.player1.findCardByName('fine-katana');
            this.fan = this.player1.findCardByName('ornate-fan');
            this.newName = this.player1.findCardByName('a-new-name');

            this.liar = this.player2.findCardByName('bayushi-liar');
            this.manipulator = this.player2.findCardByName('bayushi-manipulator');

            this.noMoreActions();
        });

        it('should not trigger unless the player has played three other cards & should draw a card', function() {
            this.initiateConflict({
                type: 'military',
                attackers: [this.teach, this.whisperer],
                defenders: [this.manipulator]
            });

            this.player2.pass();
            this.player1.clickCard(this.teach);
            expect(this.player1).toHavePrompt('Conflict Action Window');
            this.player1.clickCard(this.katana);
            this.player1.clickCard(this.teach);

            this.player2.pass();
            this.player1.clickCard(this.teach);
            expect(this.player1).toHavePrompt('Conflict Action Window');
            this.player1.clickCard(this.fan);
            this.player1.clickCard(this.teach);

            this.player2.pass();
            this.player1.clickCard(this.teach);
            expect(this.player1).toHavePrompt('Conflict Action Window');
            this.player1.clickCard(this.newName);
            this.player1.clickCard(this.teach);

            this.player2.pass();
            let count = this.player1.hand.length;
            this.player1.clickCard(this.teach);
            expect(this.player1.hand.length).toBe(count + 1);
            expect(this.getChatLogs(5)).toContain('player1 uses Teacher of Empty Thought to draw 1 card');
        });

        it('should not trigger if not participating', function() {
            this.initiateConflict({
                type: 'military',
                attackers: [this.whisperer],
                defenders: [this.manipulator]
            });

            this.player2.pass();
            this.player1.clickCard(this.teach);
            expect(this.player1).toHavePrompt('Conflict Action Window');
            this.player1.clickCard(this.katana);
            this.player1.clickCard(this.teach);

            this.player2.pass();
            this.player1.clickCard(this.teach);
            expect(this.player1).toHavePrompt('Conflict Action Window');
            this.player1.clickCard(this.fan);
            this.player1.clickCard(this.teach);

            this.player2.pass();
            this.player1.clickCard(this.teach);
            expect(this.player1).toHavePrompt('Conflict Action Window');
            this.player1.clickCard(this.newName);
            this.player1.clickCard(this.teach);

            this.player2.pass();
            this.player1.clickCard(this.teach);
            expect(this.player1).toHavePrompt('Conflict Action Window');
        });
    });
});
