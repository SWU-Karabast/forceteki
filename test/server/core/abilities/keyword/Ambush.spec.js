describe('Ambush keyword', function() {
    integration(function() {
        describe('When a unit with the Ambush keyword', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['syndicate-lackeys']
                    },
                    player2: {
                        groundArena: ['consular-security-force']
                    }
                });
            });

            it('enters play, Ambush is optional', function () {
                this.player1.clickCard(this.syndicateLackeys);
                expect(this.player1).toHavePassAbilityPrompt();
            });

            it('enters play, Ambush allows readying and attacking an enemy unit', function () {
                this.player1.clickCard(this.syndicateLackeys);
                expect(this.player1).toHavePassAbilityPrompt();
                expect(this.player1).toHaveEnabledPromptButtons(['Trigger', 'Pass']);
                this.player1.clickPrompt('Trigger');
                expect(this.p2Base.damage).toBe(0);
                expect(this.syndicateLackeys.damage).toBe(3);
                expect(this.consularSecurityForce.damage).toBe(5);
                expect(this.player1).toHaveEnabledPromptButtons(['']);
                expect(this.syndicateLackeys.exhausted).toBe(false);
                expect(this.player1).toBeAbleToSelectExactly([this.consularSecurityForce]);
            });
        });
    });
});
