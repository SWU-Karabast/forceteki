describe('Third Whisker Sneak', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['third-whisker-sneak', 'brash-samurai'],
                    conflictDiscard: ['voice-of-honor', 'fine-katana', 'ornate-fan', 'assassination', 'calling-in-favors', 'watch-commander']
                },
                player2: {
                    inPlay: ['doji-representative']
                }
            });

            this.sneak = this.player1.findCardByName('third-whisker-sneak');
            this.brash = this.player1.findCardByName('brash-samurai');
            this.representative = this.player2.findCardByName('doji-representative');

            this.voice = this.player1.moveCard('voice-of-honor', 'conflict deck');
            this.katana = this.player1.moveCard('fine-katana', 'conflict deck');
            this.fan = this.player1.moveCard('ornate-fan', 'conflict deck');
            this.assassination = this.player1.moveCard('assassination', 'conflict deck');
            this.calling = this.player1.moveCard('calling-in-favors', 'conflict deck');
            this.watchCommander = this.player1.moveCard('watch-commander', 'conflict deck');

            this.sd1 = this.player1.findCardByName('shameful-display', 'province 1');
            this.sd2 = this.player1.findCardByName('shameful-display', 'province 2');
            this.sd3 = this.player1.findCardByName('shameful-display', 'province 3');
            this.sd4 = this.player1.findCardByName('shameful-display', 'province 4');
            this.sd5 = this.player1.findCardByName('shameful-display', 'stronghold province');
        });

        it('should react if you win unopposed', function() {
            this.noMoreActions();

            this.initiateConflict({
                attackers: [this.sneak],
                defenders: [],
                type: 'military'
            });
            this.noMoreActions();
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.sneak);
        });


        it('should not work if not participating', function() {
            this.noMoreActions();

            this.initiateConflict({
                attackers: [this.brash],
                defenders: [],
                type: 'military'
            });
            this.noMoreActions();
            expect(this.player1).not.toHavePrompt('Triggered Abilities');
        });

        it('should not prompt after you win opposed', function () {
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.sneak],
                defenders: [this.representative]
            });
            this.noMoreActions();
            expect(this.player1).not.toHavePrompt('Triggered Abilities');
        });

        it('should not prompt after you win unopposed on defense (RAW - not unopposed)', function () {
            this.noMoreActions();
            this.player1.passConflict();
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.representative],
                defenders: [this.sneak]
            });
            this.player1.pass();
            this.player2.clickCard(this.representative);
            this.noMoreActions();
            expect(this.player1).not.toHavePrompt('Triggered Abilities');
        });

        it('unbroken = 5, should show 5 cards', function() {
            this.noMoreActions();

            this.initiateConflict({
                attackers: [this.sneak],
                defenders: [],
                type: 'military'
            });
            this.noMoreActions();
            this.player1.clickCard(this.sneak);
            expect(this.player1).toHavePromptButton('Watch Commander');
            expect(this.player1).toHavePromptButton('Calling in Favors');
            expect(this.player1).toHavePromptButton('Assassination');
            expect(this.player1).toHavePromptButton('Ornate Fan');
            expect(this.player1).toHavePromptButton('Fine Katana');
            expect(this.player1).toHavePromptButton('Take nothing');

            expect(this.watchCommander.location).toBe('conflict deck');
            this.player1.clickPrompt('Watch Commander');
            expect(this.watchCommander.location).toBe('hand');
        });

        it('unbroken = 4, should show 4 cards', function() {
            this.sd4.isBroken = true;
            this.noMoreActions();

            this.initiateConflict({
                attackers: [this.sneak],
                defenders: [],
                type: 'military'
            });

            this.noMoreActions();
            this.player1.clickCard(this.sneak);
            expect(this.player1).toHavePromptButton('Watch Commander');
            expect(this.player1).toHavePromptButton('Calling in Favors');
            expect(this.player1).toHavePromptButton('Assassination');
            expect(this.player1).toHavePromptButton('Ornate Fan');
            expect(this.player1).not.toHavePromptButton('Fine Katana');
            expect(this.player1).toHavePromptButton('Take nothing');
        });

        it('unbroken = 2, should show 2 cards', function() {
            this.sd2.isBroken = true;
            this.sd3.isBroken = true;
            this.sd4.isBroken = true;
            this.noMoreActions();

            this.initiateConflict({
                attackers: [this.sneak],
                defenders: [],
                type: 'military'
            });

            this.noMoreActions();
            this.player1.clickCard(this.sneak);
            expect(this.player1).toHavePromptButton('Watch Commander');
            expect(this.player1).toHavePromptButton('Calling in Favors');
            expect(this.player1).not.toHavePromptButton('Assassination');
            expect(this.player1).not.toHavePromptButton('Ornate Fan');
            expect(this.player1).not.toHavePromptButton('Fine Katana');
            expect(this.player1).toHavePromptButton('Take nothing');
        });

        it('chat messages', function() {
            this.noMoreActions();

            this.initiateConflict({
                attackers: [this.sneak],
                defenders: [],
                type: 'military'
            });
            this.noMoreActions();
            this.player1.clickCard(this.sneak);
            this.player1.clickPrompt('Watch Commander');

            expect(this.getChatLogs(10)).toContain('player1 uses Third Whisker Sneak to look at the top 5 cards of their conflict deck');
            expect(this.getChatLogs(10)).toContain('player1 takes 1 card');
            expect(this.getChatLogs(10)).toContain('player1 is shuffling their conflict deck');
        });
    });
});
