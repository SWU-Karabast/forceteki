describe('Never Yield', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['moto-youth'],
                    hand: ['never-yield', 'ikoma-reservist']
                },
                player2: {
                    inPlay: ['doji-whisperer'],
                    hand: ['try-again-tomorrow', 'mirumoto-s-fury']
                }
            });

            this.youth = this.player1.findCardByName('moto-youth');
            this.neverYield = this.player1.findCardByName('never-yield');
            this.reservist = this.player1.findCardByName('ikoma-reservist');

            this.dojiWhisperer = this.player2.findCardByName('doji-whisperer');
            this.tryAgainTomorrow = this.player2.findCardByName('try-again-tomorrow');
            this.fury = this.player2.findCardByName('mirumoto-s-fury');
        });

        it('should trigger on your attack', function() {
            this.noMoreActions();

            this.initiateConflict({
                attackers: [this.youth],
                type: 'military'
            });

            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.neverYield);
        });

        it('should not trigger on opponent\'s attack', function() {
            this.noMoreActions();
            this.player1.passConflict();
            this.noMoreActions();

            this.initiateConflict({
                attackers: [this.dojiWhisperer],
                type: 'political'
            });

            expect(this.player1).not.toHavePrompt('Triggered Abilities');
            expect(this.player1).toHavePrompt('Choose Defenders');
        });

        it('should prevent your characters from being bowed', function() {
            this.noMoreActions();

            this.initiateConflict({
                attackers: [this.youth],
                type: 'military'
            });

            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.neverYield);

            this.player1.clickCard(this.neverYield);
            expect(this.getChatLogs(2)).toContain('player1 plays Never Yield to make it so player2\'s card effects can\'t bow or send home player1\'s characters currently in play until the end of the conflict.');

            this.player2.clickPrompt('Done');
            this.player2.clickCard(this.fury);
            expect(this.player2).toHavePrompt('Conflict Action Window');
        });

        it('should prevent your characters from being sent home', function() {
            this.dojiWhisperer.honor();
            this.noMoreActions();

            this.initiateConflict({
                attackers: [this.youth],
                type: 'military'
            });

            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.neverYield);

            this.player1.clickCard(this.neverYield);
            expect(this.getChatLogs(2)).toContain('player1 plays Never Yield to make it so player2\'s card effects can\'t bow or send home player1\'s characters currently in play until the end of the conflict.');

            this.player2.clickCard(this.dojiWhisperer);
            this.player2.clickPrompt('Done');
            expect(this.dojiWhisperer.isParticipating()).toBe(true);
            expect(this.player2).toHavePrompt('Conflict Action Window');
            this.player2.clickCard(this.tryAgainTomorrow);
            expect(this.player2).toHavePrompt('Conflict Action Window');
        });

        it('should not prevent characters that enter play later from being bowed or sent home', function() {
            this.dojiWhisperer.honor();
            this.noMoreActions();

            this.initiateConflict({
                attackers: [this.youth],
                type: 'military'
            });

            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.neverYield);

            this.player1.clickCard(this.neverYield);
            expect(this.getChatLogs(2)).toContain('player1 plays Never Yield to make it so player2\'s card effects can\'t bow or send home player1\'s characters currently in play until the end of the conflict.');

            this.player2.clickCard(this.dojiWhisperer);
            this.player2.clickPrompt('Done');
            expect(this.dojiWhisperer.isParticipating()).toBe(true);

            this.player2.pass();
            this.player1.clickCard(this.reservist);
            this.player1.clickPrompt('0');
            this.player1.clickPrompt('Conflict');

            this.player2.clickCard(this.fury);
            expect(this.player2).toBeAbleToSelect(this.reservist);
            this.player2.clickCard(this.reservist);
            expect(this.reservist.bowed).toBe(true);

            this.player1.pass();

            this.player2.clickCard(this.tryAgainTomorrow);
            expect(this.player2).toBeAbleToSelect(this.reservist);
            this.player2.clickCard(this.reservist);
            expect(this.reservist.isParticipating()).toBe(false);
        });
    });
});
