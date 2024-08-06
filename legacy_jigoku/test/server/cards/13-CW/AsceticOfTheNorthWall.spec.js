describe('Ascetic of the North Wall', function() {
    integration(function() {
        describe('Ascetic of the North Wall\'s ability outside the fate phase', function() {
            beforeEach(function() {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['ascetic-of-the-north-wall'],
                        hand: ['assassination']
                    },
                    player2: {
                        inPlay: ['bayushi-liar'],
                        hand: ['assassination']
                    }
                });
                this.asceticOfTheNorthWall = this.player1.findCardByName('ascetic-of-the-north-wall');
                this.assassinationP1 = this.player1.findCardByName('assassination');

                this.liar = this.player2.findCardByName('bayushi-liar');
                this.assassinationP2 = this.player2.findCardByName('assassination');

                this.asceticOfTheNorthWall.fate = 1;
                this.liar.fate = 1;

                this.noMoreActions();
                this.player1.passConflict();
                this.noMoreActions();

                this.initiateConflict({
                    type: 'political',
                    ring: 'void',
                    attackers: [this.liar],
                    defenders: [this.asceticOfTheNorthWall]
                });
            });

            it('should do nothing if you don\'t have the earth ring - own discard effect', function() {
                this.player1.clickCard(this.assassinationP1);
                expect(this.player1).toBeAbleToSelect(this.asceticOfTheNorthWall);
                this.player1.clickCard(this.asceticOfTheNorthWall);
                expect(this.asceticOfTheNorthWall.location).toBe('dynasty discard pile');
            });

            it('should do nothing if you don\'t have the earth ring - opponent discard effect', function() {
                this.player1.pass();

                this.player2.clickCard(this.assassinationP2);
                expect(this.player2).toBeAbleToSelect(this.asceticOfTheNorthWall);
                this.player2.clickCard(this.asceticOfTheNorthWall);
                expect(this.asceticOfTheNorthWall.location).toBe('dynasty discard pile');
            });

            it('should do nothing if you don\'t have the earth ring - opponent void ring effect', function() {
                this.player1.pass();
                this.player2.pass();

                expect(this.player2).toHavePrompt('Void Ring');
                expect(this.player2).toBeAbleToSelect(this.asceticOfTheNorthWall);
                expect(this.player2).toBeAbleToSelect(this.liar);

                const asceticFate = this.asceticOfTheNorthWall.fate;
                this.player2.clickCard(this.asceticOfTheNorthWall);
                expect(this.asceticOfTheNorthWall.fate).toBe(asceticFate - 1);
            });

            it('should prevent discard effects if you own the earth ring - own discard effect', function() {
                this.player1.claimRing('earth');
                this.game.checkGameState(true);

                this.player1.clickCard(this.assassinationP1);
                expect(this.player1).not.toBeAbleToSelect(this.asceticOfTheNorthWall);
                expect(this.player1).toBeAbleToSelect(this.liar);
            });

            it('should prevent discard effects if you own the earth ring - opponent discard effect', function() {
                this.player1.claimRing('earth');
                this.game.checkGameState(true);
                this.player1.pass();

                this.player2.clickCard(this.assassinationP2);
                expect(this.player2).not.toBeAbleToSelect(this.asceticOfTheNorthWall);
                expect(this.player2).toBeAbleToSelect(this.liar);
            });

            it('should prevent losing fate - opponent void ring effect', function() {
                this.player1.claimRing('earth');
                this.player1.pass();
                this.player2.pass();

                expect(this.player2).toHavePrompt('Void Ring');
                expect(this.player2).not.toBeAbleToSelect(this.asceticOfTheNorthWall);
                expect(this.player2).toBeAbleToSelect(this.liar);
            });

            it('should not prevent losing fate - fate phase', function() {
                this.player1.claimRing('earth');
                this.player1.pass();
                this.player2.pass();

                expect(this.player2).toHavePrompt('Void Ring');
                expect(this.player2).not.toBeAbleToSelect(this.asceticOfTheNorthWall);
                expect(this.player2).toBeAbleToSelect(this.liar);

                this.player2.clickPrompt('Don\'t resolve');

                const asceticFate = this.asceticOfTheNorthWall.fate;

                this.noMoreActions();
                this.noMoreActions();
                this.noMoreActions();

                expect(this.game.currentPhase).toBe('fate');
                expect(this.asceticOfTheNorthWall.fate).toBe(asceticFate - 1);
            });
        });
    });
});
