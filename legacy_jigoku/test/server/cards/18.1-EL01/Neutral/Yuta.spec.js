describe('Yuta', function() {
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
                    inPlay: ['yuta', 'kakita-yoshi'],
                    hand: ['policy-debate', 'ornate-fan']
                }
            });

            this.yoshi = this.player2.findCardByName('kakita-yoshi');
            this.yuta = this.player2.findCardByName('yuta');
            this.policyDebate = this.player2.findCardByName('policy-debate');
            this.fan = this.player2.findCardByName('ornate-fan');

            this.borderRider = this.player1.findCardByName('border-rider');
            this.challenge = this.player1.findCardByName('challenge-on-the-fields');
        });

        it('should not react to winning a conflict on defense', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.borderRider],
                defenders: [this.yuta]
            });

            this.noMoreActions();
            expect(this.player2).not.toHavePrompt('Triggered Abilities');
        });

        it('should react to winning an attack', function() {
            this.noMoreActions();
            this.player1.passConflict();
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.yuta],
                defenders: [this.borderRider]
            });

            let p1Fate = this.player1.fate;
            let p2Fate = this.player2.fate;

            this.noMoreActions();
            expect(this.player2).toHavePrompt('Triggered Abilities');
            expect(this.player2).toBeAbleToSelect(this.yuta);
            this.player2.clickCard(this.yuta);

            expect(this.player1.fate).toBe(p1Fate - 1);
            expect(this.player2.fate).toBe(p2Fate + 1);
            expect(this.getChatLogs(5)).toContain('player2 uses Yuta to take 1 fate from player1');
        });

        it('should not react to losing on attack a mil conflict', function() {
            this.noMoreActions();
            this.player1.passConflict();
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.yuta],
                defenders: [this.borderRider]
            });

            this.yuta.bow();
            this.noMoreActions();
            expect(this.player2).not.toHavePrompt('Triggered Abilities');
        });
    });
});
