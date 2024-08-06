describe('Inquisitorial Initiate', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['inquisitorial-initiate']
                },
                player2: {
                    inPlay: ['doji-whisperer', 'border-rider', 'doji-challenger'],
                    hand: ['ornate-fan', 'fine-katana', 'banzai']
                }
            });

            this.initiate = this.player1.findCardByName('inquisitorial-initiate');
            this.whisperer = this.player2.findCardByName('doji-whisperer');
            this.challenger = this.player2.findCardByName('doji-challenger');
            this.rider = this.player2.findCardByName('border-rider');

            this.fan = this.player2.findCardByName('ornate-fan');
            this.katana = this.player2.findCardByName('fine-katana');
            this.banzai = this.player2.findCardByName('banzai');

            this.challenger.fate = 1;
        });

        it('should prompt after you win a conflict on attack', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.initiate],
                defenders: [],
                type: 'political'
            });
            this.noMoreActions();
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.initiate);
        });

        it('should prompt after you win a conflict on defense', function() {
            this.noMoreActions();
            this.player1.passConflict();
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.rider],
                defenders: [this.initiate],
                type: 'political'
            });
            this.noMoreActions();
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.initiate);
        });

        it('should not prompt if your opponent has less cards than characters with fate', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.initiate],
                defenders: [],
                type: 'political'
            });
            this.player2.playAttachment(this.fan, this.whisperer);
            this.player1.pass();
            this.player2.playAttachment(this.katana, this.whisperer);
            this.noMoreActions();
            expect(this.player1).not.toHavePrompt('Triggered Abilities');
        });

        it('should prompt your opponent to choose cards in their hand equal to the number of characters they control with no fate', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.initiate],
                defenders: [],
                type: 'political'
            });
            this.noMoreActions();
            this.player1.clickCard(this.initiate);
            expect(this.player2).toHavePrompt('Choose cards to reveal');
            expect(this.player2).toBeAbleToSelect(this.fan);
            expect(this.player2).toBeAbleToSelect(this.katana);
            expect(this.player2).toBeAbleToSelect(this.banzai);

            this.player2.clickCard(this.fan);
            this.player2.clickCard(this.banzai);
            this.player2.clickPrompt('Done');

            expect(this.player1).toHavePrompt('Select a card:');
            expect(this.player1).toHavePromptButton('Ornate Fan');
            expect(this.player1).toHavePromptButton('Banzai!');

            this.player1.clickPrompt('Ornate Fan');
            expect(this.fan.location).toBe('conflict discard pile');
            expect(this.getChatLogs(3)).toContain('player1 chooses Ornate Fan to be discarded');
            expect(this.getChatLogs(3)).toContain('Inquisitorial Initiate sees Ornate Fan and Banzai!');
        });

        it('should prompt your opponent to choose cards in their hand equal to the number of characters they control with no fate', function() {
            this.whisperer.fate = 1;
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.initiate],
                defenders: [],
                type: 'political'
            });
            this.noMoreActions();
            this.player1.clickCard(this.initiate);
            expect(this.player2).toHavePrompt('Choose cards to reveal');
            expect(this.player2).toBeAbleToSelect(this.fan);
            expect(this.player2).toBeAbleToSelect(this.katana);
            expect(this.player2).toBeAbleToSelect(this.banzai);

            this.player2.clickCard(this.fan);
            expect(this.player1).toHavePrompt('Select a card:');
            expect(this.player1).toHavePromptButton('Ornate Fan');

            this.player1.clickPrompt('Ornate Fan');
            expect(this.fan.location).toBe('conflict discard pile');
            expect(this.getChatLogs(3)).toContain('player1 chooses Ornate Fan to be discarded');
            expect(this.getChatLogs(3)).toContain('Inquisitorial Initiate sees Ornate Fan');
        });
    });
});
