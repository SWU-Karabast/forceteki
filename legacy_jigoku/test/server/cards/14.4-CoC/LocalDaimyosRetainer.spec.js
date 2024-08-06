describe('Local Daimyo\'s Retainer', function() {
    integration(function() {
        describe('Conflict Phase', function() {
            beforeEach(function() {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        hand: ['local-daimyo-s-retainer']
                    },
                    player2: {
                    }
                });

                this.retainer = this.player1.findCardByName('local-daimyo-s-retainer');

                this.p1 = this.player1.findCardByName('shameful-display', 'province 1');
                this.p2 = this.player1.findCardByName('shameful-display', 'province 2');
                this.p3 = this.player1.findCardByName('shameful-display', 'province 3');
                this.p4 = this.player1.findCardByName('shameful-display', 'province 4');
                this.p4 = this.player1.findCardByName('shameful-display', 'province 4');
                this.pStronghold = this.player1.findCardByName('shameful-display', 'stronghold province');
            });

            it('should not be able to play unless you control 3 faceup provinces', function() {
                expect(this.player1).toHavePrompt('Action Window');
                this.player1.clickCard(this.retainer);
                expect(this.player1).toHavePrompt('Action Window');
                this.p1.facedown = false;
                this.game.checkGameState(true);
                this.player1.clickCard(this.retainer);
                expect(this.player1).toHavePrompt('Action Window');
                this.p2.facedown = false;
                this.game.checkGameState(true);
                this.player1.clickCard(this.retainer);
                expect(this.player1).toHavePrompt('Action Window');
                this.p3.facedown = false;
                this.game.checkGameState(true);
                this.player1.clickCard(this.retainer);
                expect(this.player1).toHavePromptButton('0');
                this.player1.clickPrompt('0');
                expect(this.retainer.location).toBe('play area');
            });

            it('new chat message feature', function() {
                this.p1.facedown = false;
                this.p2.facedown = false;
                this.p3.facedown = false;
                this.game.checkGameState(true);
                this.player1.clickCard(this.retainer);
                expect(this.player1).toHavePromptButton('0');
                expect(this.player2).toHavePrompt('Waiting for opponent to take an action or pass');
                expect(this.player2).not.toHavePrompt('Waiting for opponent to use Local Daimyō\'s Retainer');
            });
        });

        describe('Dynasty Phase', function() {
            beforeEach(function() {
                this.setupTest({
                    phase: 'dynasty',
                    player1: {
                        hand: ['local-daimyo-s-retainer']
                    },
                    player2: {
                    }
                });

                this.retainer = this.player1.findCardByName('local-daimyo-s-retainer');

                this.p1 = this.player1.findCardByName('shameful-display', 'province 1');
                this.p2 = this.player1.findCardByName('shameful-display', 'province 2');
                this.p3 = this.player1.findCardByName('shameful-display', 'province 3');
                this.p4 = this.player1.findCardByName('shameful-display', 'province 4');
                this.p4 = this.player1.findCardByName('shameful-display', 'province 4');
                this.pStronghold = this.player1.findCardByName('shameful-display', 'stronghold province');
            });

            it('should not be able to play even if you control 3 faceup provinces', function() {
                expect(this.player1).toHavePrompt('Play cards from provinces');
                this.player1.clickCard(this.retainer);
                expect(this.player1).toHavePrompt('Play cards from provinces');
                this.p1.facedown = false;
                this.game.checkGameState(true);
                this.player1.clickCard(this.retainer);
                expect(this.player1).toHavePrompt('Play cards from provinces');
                this.p2.facedown = false;
                this.game.checkGameState(true);
                this.player1.clickCard(this.retainer);
                expect(this.player1).toHavePrompt('Play cards from provinces');
                this.p3.facedown = false;
                this.game.checkGameState(true);
                this.player1.clickCard(this.retainer);
                expect(this.player1).toHavePrompt('Play cards from provinces');
            });
        });
    });
});
