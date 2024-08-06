describe('Void Wielder', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['void-wielder', 'iuchi-wayfinder']
                },
                player2: {
                    inPlay: ['borderlands-defender', 'doji-whisperer'],
                    hand: ['fine-katana', 'ornate-fan', 'a-new-name']
                }
            });

            this.void = this.player1.findCardByName('void-wielder');
            this.wayfinder = this.player1.findCardByName('iuchi-wayfinder');
            this.defender = this.player2.findCardByName('borderlands-defender');
            this.whisperer = this.player2.findCardByName('doji-whisperer');

            this.wayfinder.taint();
            this.wayfinder.honor();
            this.whisperer.honor();

            this.katana = this.player2.findCardByName('fine-katana');
            this.ornateFan = this.player2.findCardByName('ornate-fan');
            this.ann = this.player2.findCardByName('a-new-name');

            this.player1.pass();
            this.player2.playAttachment(this.katana, this.whisperer);
            this.player1.pass();
            this.player2.playAttachment(this.ornateFan, this.whisperer);
            this.player1.pass();
            this.player2.playAttachment(this.ann, this.defender);
        });

        it('should not be able to be triggered outside of a conflict', function() {
            expect(this.player1).toHavePrompt('Action Window');
            this.player1.clickCard(this.void);
            expect(this.player1).toHavePrompt('Action Window');
        });

        it('should not be able to be triggered in a non-void conflict', function() {
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.wayfinder],
                defenders: [this.defender, this.whisperer],
                ring: 'air'
            });
            this.player2.pass();
            expect(this.player1).toHavePrompt('Conflict Action Window');
            this.player1.clickCard(this.void);
            expect(this.player1).toHavePrompt('Conflict Action Window');
        });

        it('should prompt for valid options on a character', function() {
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.wayfinder],
                defenders: [this.defender, this.whisperer],
                ring: 'void'
            });
            this.player2.pass();
            this.player1.clickCard(this.void);
            expect(this.player1).not.toBeAbleToSelect(this.void);
            expect(this.player1).not.toBeAbleToSelect(this.defender);
            expect(this.player1).toBeAbleToSelect(this.wayfinder);
            expect(this.player1).toBeAbleToSelect(this.whisperer);
            this.player1.clickCard(this.whisperer);
            expect(this.player2).toHavePromptButton('Move this character home');
            expect(this.player2).toHavePromptButton('Discard a status token from this character');
            expect(this.player2).toHavePromptButton('Discard an attachment from this character');
        });

        it('send home', function() {
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.wayfinder],
                defenders: [this.defender, this.whisperer],
                ring: 'void'
            });
            this.player2.pass();
            this.player1.clickCard(this.void);
            expect(this.player1).not.toBeAbleToSelect(this.defender);
            expect(this.player1).toBeAbleToSelect(this.wayfinder);
            expect(this.player1).toBeAbleToSelect(this.whisperer);
            this.player1.clickCard(this.whisperer);
            this.player2.clickPrompt('Move this character home');
            expect(this.whisperer.isParticipating()).toBe(false);
            expect(this.getChatLogs(5)).toContain('player1 uses Void Wielder to send Doji Whisperer home');
        });

        it('discard status token', function() {
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.wayfinder],
                defenders: [this.defender, this.whisperer],
                ring: 'void'
            });
            this.player2.pass();
            this.player1.clickCard(this.void);
            this.player1.clickCard(this.whisperer);
            this.player2.clickPrompt('Discard a status token from this character');
            expect(this.whisperer.isHonored).toBe(false);
            expect(this.getChatLogs(5)).toContain('player1 uses Void Wielder to discard a status token from Doji Whisperer');
            expect(this.getChatLogs(5)).toContain('player2 discards Honored Token');
        });

        it('discard status token - multiple tokens', function() {
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.wayfinder],
                defenders: [this.defender, this.whisperer],
                ring: 'void'
            });
            this.whisperer.taint();
            this.player2.pass();
            this.player1.clickCard(this.void);
            this.player1.clickCard(this.whisperer);
            this.player2.clickPrompt('Discard a status token from this character');
            expect(this.player2).toHavePrompt('Which token do you wish to discard?');
            expect(this.player2).toHavePromptButton('Honored Token');
            expect(this.player2).toHavePromptButton('Tainted Token');
            this.player2.clickPrompt('Tainted Token');
            expect(this.whisperer.isHonored).toBe(true);
            expect(this.whisperer.isTainted).toBe(false);
            expect(this.getChatLogs(5)).toContain('player1 uses Void Wielder to discard a status token from Doji Whisperer');
            expect(this.getChatLogs(3)).toContain('player2 discards Tainted Token');
        });

        it('discard status token - multiple tokens', function() {
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.wayfinder],
                defenders: [this.defender, this.whisperer],
                ring: 'void'
            });
            this.whisperer.taint();
            this.player2.pass();
            this.player1.clickCard(this.void);
            this.player1.clickCard(this.wayfinder);

            expect(this.player1).toHavePromptButton('Move this character home');
            expect(this.player1).toHavePromptButton('Discard a status token from this character');
            expect(this.player1).not.toHavePromptButton('Discard an attachment from this character');

            this.player1.clickPrompt('Discard a status token from this character');
            expect(this.player1).toHavePrompt('Which token do you wish to discard?');
            expect(this.player1).toHavePromptButton('Honored Token');
            expect(this.player1).toHavePromptButton('Tainted Token');
            this.player1.clickPrompt('Honored Token');
            expect(this.wayfinder.isHonored).toBe(false);
            expect(this.wayfinder.isTainted).toBe(true);
            expect(this.getChatLogs(5)).toContain('player1 uses Void Wielder to discard a status token from Iuchi Wayfinder');
            expect(this.getChatLogs(3)).toContain('player1 discards Honored Token');
        });

        it('discard attachment', function() {
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.wayfinder],
                defenders: [this.defender, this.whisperer],
                ring: 'void'
            });
            this.whisperer.taint();
            this.player2.pass();
            this.player1.clickCard(this.void);
            this.player1.clickCard(this.whisperer);
            this.player2.clickPrompt('Discard an attachment from this character');
            expect(this.player2).toHavePrompt('Which attachment do you wish to discard?');
            expect(this.player2).toBeAbleToSelect(this.katana);
            expect(this.player2).toBeAbleToSelect(this.ornateFan);
            this.player2.clickCard(this.katana);
            expect(this.katana.location).toBe('conflict discard pile');
            expect(this.getChatLogs(5)).toContain('player1 uses Void Wielder to discard an attachment from Doji Whisperer');
            expect(this.getChatLogs(3)).toContain('player2 discards Fine Katana');
        });
    });
});
