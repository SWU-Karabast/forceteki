describe('Ambush keyword', function() {
    integration(function() {
        describe('When a unit with the Ambush keyword', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['syndicate-lackeys'],
                        groundArena: ['wampa']
                    },
                    player2: {
                        groundArena: ['consular-security-force', 'snowspeeder'],
                        spaceArena: ['cartel-spacer']
                    }
                });
            });

            it('enters play, Ambush allows readying and attacking an enemy unit', function () {
                this.player1.clickCard(this.syndicateLackeys);
                expect(this.player1).toHavePassAbilityPrompt('Ambush');
                this.player1.clickPrompt('Ambush');

                expect(this.player1).toBeAbleToSelectExactly([this.consularSecurityForce, this.snowspeeder]);

                this.player1.clickCard(this.consularSecurityForce);
                expect(this.syndicateLackeys.exhausted).toBe(true);
                expect(this.p2Base.damage).toBe(0);
                expect(this.syndicateLackeys.damage).toBe(3);
                expect(this.consularSecurityForce.damage).toBe(5);
                expect(this.player2).toBeActivePlayer();
            });
        });

        describe('When a unit with the Ambush keyword', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['syndicate-lackeys'],
                        groundArena: ['wampa']
                    },
                    player2: {
                        groundArena: ['consular-security-force'],
                        spaceArena: ['cartel-spacer']
                    }
                });
            });

            it('enters play and there is only one target, Ambush will automatically choose it', function () {
                this.player1.clickCard(this.syndicateLackeys);
                expect(this.player1).toHavePassAbilityPrompt('Ambush');
                this.player1.clickPrompt('Ambush');

                expect(this.syndicateLackeys.exhausted).toBe(true);
                expect(this.p2Base.damage).toBe(0);
                expect(this.syndicateLackeys.damage).toBe(3);
                expect(this.consularSecurityForce.damage).toBe(5);
                expect(this.player2).toBeActivePlayer();
            });
        });

        describe('When a unit with the Ambush keyword', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['syndicate-lackeys'],
                        groundArena: ['wampa']
                    },
                    player2: {
                        spaceArena: ['cartel-spacer']
                    }
                });
            });

            it('enters play and there is only no target, the Ambush prompt will not happen', function () {
                this.player1.clickCard(this.syndicateLackeys);
                expect(this.player2).toBeActivePlayer();
            });
        });
    });
});
