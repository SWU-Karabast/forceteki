describe('Eloquent Advocate', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    honor: 10,
                    inPlay: ['border-rider'],
                    hand: ['challenge-on-the-fields']
                },
                player2: {
                    honor: 10,
                    inPlay: ['eloquent-advocate', 'kakita-yoshi'],
                    hand: ['policy-debate', 'ornate-fan']
                }
            });

            this.yoshi = this.player2.findCardByName('kakita-yoshi');
            this.advocate = this.player2.findCardByName('eloquent-advocate');
            this.policyDebate = this.player2.findCardByName('policy-debate');
            this.fan = this.player2.findCardByName('ornate-fan');

            this.borderRider = this.player1.findCardByName('border-rider');
            this.challenge = this.player1.findCardByName('challenge-on-the-fields');

            this.player2.reduceDeckToNumber('conflict deck', 0);
            this.player2.moveCard(this.policyDebate, 'conflict deck');
            this.player2.moveCard(this.fan, 'conflict deck');
        });

        it('should react to winning a pol conflict', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.borderRider],
                defenders: [this.advocate],
                type: 'political'
            });

            let hand = this.player2.hand.length;
            this.noMoreActions();
            expect(this.player2).toHavePrompt('Triggered Abilities');
            expect(this.player2).toBeAbleToSelect(this.advocate);
            this.player2.clickCard(this.advocate);

            expect(this.player2).toHavePrompt('Select a card');
            expect(this.player2).toHavePromptButton('Policy Debate');
            expect(this.player2).toHavePromptButton('Ornate Fan');
            expect(this.policyDebate.location).toBe('conflict deck');
            this.player2.clickPrompt('Policy Debate');
            expect(this.policyDebate.location).toBe('hand');
            expect(this.player2.hand.length).toBe(hand + 1);
            expect(this.getChatLogs(5)).toContain('player2 uses Eloquent Advocate to look at the top two cards of their conflict deck');
            expect(this.getChatLogs(5)).toContain('player2 takes 1 card');
            expect(this.getChatLogs(5)).toContain('player2 puts 1 card on the bottom of their conflict deck');
        });

        it('should not react to losing a pol conflict', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.borderRider],
                defenders: [this.advocate],
                type: 'political'
            });

            this.advocate.bow();
            this.noMoreActions();
            expect(this.player2).not.toHavePrompt('Triggered Abilities');
        });

        it('should not react to winning a mil conflict', function() {
            this.yoshi.honor();
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.borderRider],
                defenders: [this.advocate, this.yoshi],
                type: 'military'
            });

            this.noMoreActions();
            expect(this.player2).not.toHavePrompt('Triggered Abilities');
        });
    });
});
