describe('Soshi Mika', function() {
    integration(function() {
        describe('Triggered ability', function() {
            beforeEach(function() {
                this.setupTest({
                    phase: 'draw',
                    player1: {
                        honor: 10,
                        inPlay: ['soshi-mika']
                    },
                    player2: {
                        honor: 10
                    }
                });

                this.mika = this.player1.findCardByName('soshi-mika');

                // select bid for both players
                this.player1.clickPrompt('1');
                this.player2.clickPrompt('1');
            });

            it('should trigger at the start of the conflict phase', function() {
                let p1Hand = this.player1.hand.length;
                let p2Hand = this.player2.hand.length;

                let p1Honor = this.player1.honor;
                let p2Honor = this.player2.honor;

                this.noMoreActions();
                expect(this.game.currentPhase).toBe('conflict');

                expect(this.player1.honor).toBe(p1Honor - 1);
                expect(this.player2.honor).toBe(p2Honor - 1);
                expect(this.player1.hand.length).toBe(p1Hand + 2);
                expect(this.player2.hand.length).toBe(p2Hand + 2);

                expect(this.getChatLogs(1)).toContain('player1 uses Soshi Mika to have each player lose an honor and draw two cards');
            });

            it('should let player 1 win if both are at 1 honor', function() {
                let p1Hand = this.player1.hand.length;
                let p2Hand = this.player2.hand.length;

                this.player1.honor = 1;
                this.player2.honor = 1;

                let p1Honor = this.player1.honor;
                let p2Honor = this.player2.honor;

                this.noMoreActions();
                expect(this.game.currentPhase).toBe('conflict');

                expect(this.player1.honor).toBe(p1Honor - 1);
                expect(this.player2.honor).toBe(p2Honor - 1);
                expect(this.player1.hand.length).toBe(p1Hand + 2);
                expect(this.player2.hand.length).toBe(p2Hand + 2);

                expect(this.getChatLogs(1)).toContain('player1 has won the game');
            });
        });

        describe('Active ability (flip favor)', function() {
            beforeEach(function() {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['soshi-mika', 'steward-of-law'],
                        hand: ['severed-from-the-stream']
                    },
                    player2: {
                        inPlay: ['doji-diplomat']
                    }
                });

                this.mika = this.player1.findCardByName('soshi-mika');
                this.steward = this.player1.findCardByName('steward-of-law');
                this.diplomat = this.player2.findCardByName('doji-diplomat');
                this.stream = this.player1.findCardByName('severed-from-the-stream');
            });

            it('flip favor (player 1)', function() {
                this.player1.player.imperialFavor = 'political';
                this.noMoreActions();
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.steward],
                    defenders: []
                });
                expect(this.game.currentConflict.attackerSkill).toBe(1);
                this.player2.pass();
                this.player1.clickCard(this.mika);
                expect(this.player1.player.imperialFavor).toBe('military');
                expect(this.game.currentConflict.attackerSkill).toBe(2);
                expect(this.getChatLogs(5)).toContain('player1 uses Soshi Mika to flip the Imperial favor');
            });

            it('flip favor (player 2)', function() {
                this.player2.player.imperialFavor = 'political';
                this.noMoreActions();
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.steward],
                    defenders: [this.diplomat]
                });
                expect(this.game.currentConflict.defenderSkill).toBe(0);
                this.player2.pass();
                this.player1.clickCard(this.mika);
                expect(this.player2.player.imperialFavor).toBe('military');
                expect(this.game.currentConflict.defenderSkill).toBe(1);
                expect(this.getChatLogs(5)).toContain('player1 uses Soshi Mika to flip the Imperial favor');
            });

            it('no trigger (no one has favor)', function() {
                this.noMoreActions();
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.steward],
                    defenders: [this.diplomat]
                });
                this.player2.pass();
                expect(this.player1).toHavePrompt('Conflict Action Window');
                this.player1.clickCard(this.mika);
                expect(this.player1).toHavePrompt('Conflict Action Window');
            });

            it('no trigger (skirmish favor)', function() {
                this.player1.player.imperialFavor = 'both';
                this.noMoreActions();
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.steward],
                    defenders: [this.diplomat]
                });
                this.player2.pass();
                expect(this.player1).toHavePrompt('Conflict Action Window');
                this.player1.clickCard(this.mika);
                expect(this.player1).toHavePrompt('Conflict Action Window');
            });
        });
    });
});
