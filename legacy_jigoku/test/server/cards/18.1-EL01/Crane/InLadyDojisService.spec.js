describe('In Lady Dojis Service', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    honor: 10,
                    inPlay: ['doji-whisperer', 'doji-diplomat', 'brash-samurai', 'kakita-yoshi'],
                    hand: ['in-lady-doji-s-service', 'i-can-swim', 'game-of-sadane']
                },
                player2: {
                    honor: 10,
                    inPlay: ['kakita-asami', 'doji-challenger']
                }
            });

            this.yoshi = this.player1.findCardByName('kakita-yoshi');
            this.whisperer = this.player1.findCardByName('doji-whisperer');
            this.diplomat = this.player1.findCardByName('doji-diplomat');
            this.brash = this.player1.findCardByName('brash-samurai');

            this.asami = this.player2.findCardByName('kakita-asami');
            this.challenger = this.player2.findCardByName('doji-challenger');
            this.service = this.player1.findCardByName('in-lady-doji-s-service');
            this.swim = this.player1.findCardByName('i-can-swim');
            this.sadane = this.player1.findCardByName('game-of-sadane');
        });

        it('should let you choose attacker or defender', function () {
            this.player1.clickCard(this.service);
            this.player1.clickCard(this.asami);
            expect(this.player1).toHavePromptButton('Prevent Attacking');
            expect(this.player1).toHavePromptButton('Prevent Defending');
        });

        it('should prevent the targeted character from being declared as an attacker', function () {
            this.player1.clickCard(this.service);
            this.player1.clickCard(this.asami);
            this.player1.clickPrompt('Prevent Attacking');
            this.player1.clickCard(this.whisperer);
            expect(this.getChatLogs(5)).toContain('player1 plays In Lady Dōji\'s Service, bowing Doji Whisperer to prevent Kakita Asami from being declared as an attacker this phase');
            this.noMoreActions();
            this.player1.passConflict();
            this.noMoreActions();
            this.player2.clickCard(this.player1.provinces['province 1'].provinceCard);
            this.player2.clickRing('fire');
            this.player2.clickCard(this.asami);
            expect(this.player2).not.toHavePromptButton('Initiate Conflict');
            this.player2.clickCard(this.challenger);
            expect(this.player2).toHavePromptButton('Initiate Conflict');
        });

        it('should prevent the targeted character from being declared as a defender until the end of the round', function () {
            this.player1.clickCard(this.service);
            this.player1.clickCard(this.asami);
            this.player1.clickPrompt('Prevent Defending');
            this.player1.clickCard(this.whisperer);
            expect(this.getChatLogs(5)).toContain('player1 plays In Lady Dōji\'s Service, bowing Doji Whisperer to prevent Kakita Asami from being declared as a defender this phase');
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.diplomat],
                defenders: [this.asami, this.challenger]
            });
            expect(this.asami.isParticipating()).toBe(false);
            expect(this.challenger.isParticipating()).toBe(true);
        });
    });
});
