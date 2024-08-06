describe('Forthright Ide', function() {
    integration(function() {
        describe('Forthright Ide\'s ability', function() {
            beforeEach(function() {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['forthright-ide','yogo-outcast', 'kakita-toshimoko'],
                        hand: ['let-go', 'assassination']
                    },
                    player2: {
                        inPlay: ['doji-whisperer']
                    }
                });
                this.yogo = this.player1.findCardByName('yogo-outcast');
                this.ide = this.player1.findCardByName('forthright-ide');
                this.toshimoko = this.player1.findCardByName('kakita-toshimoko');
                this.whisperer = this.player2.findCardByName('doji-whisperer');
                this.letGo = this.player1.findCardByName('let-go');
            });

            it('should not work out of conflict', function() {
                this.yogo.bowed = true;
                this.whisperer.bowed = true;

                expect(this.player1).toHavePrompt('Action Window');
                this.player1.clickCard(this.ide);
                expect(this.player1).toHavePrompt('Action Window');
            });

            it('should allow targeting bowed characters who cost 3 or less', function() {
                this.yogo.bowed = true;
                this.whisperer.bowed = true;
                this.toshimoko.bowed = true;

                this.noMoreActions();
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.ide],
                    defenders: []
                });
                this.player2.pass();
                this.player1.clickCard(this.ide);
                expect(this.player1).toBeAbleToSelect(this.yogo);
                expect(this.player1).toBeAbleToSelect(this.whisperer);
                expect(this.player1).not.toBeAbleToSelect(this.toshimoko);
            });

            it('should not allow targeting standing characters', function() {
                this.yogo.bowed = false;
                this.whisperer.bowed = true;
                this.toshimoko.bowed = true;

                this.noMoreActions();
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.ide],
                    defenders: []
                });
                this.player2.pass();
                this.player1.clickCard(this.ide);
                expect(this.player1).not.toBeAbleToSelect(this.yogo);
                expect(this.player1).toBeAbleToSelect(this.whisperer);
                expect(this.player1).not.toBeAbleToSelect(this.toshimoko);
            });

            it('should ready the selected character and make you discard a card if you control it', function() {
                this.yogo.bowed = true;
                this.whisperer.bowed = true;

                this.noMoreActions();
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.ide],
                    defenders: []
                });
                this.player2.pass();
                this.player1.clickCard(this.ide);
                this.player1.clickCard(this.yogo);
                expect(this.player1).toHavePrompt('Choose a card to discard');
                this.player1.clickCard(this.letGo);
                expect(this.letGo.location).toBe('conflict discard pile');
                expect(this.yogo.bowed).toBe(false);
            });

            it('should ready the selected character and not make you discard a card if you do not control it', function() {
                this.yogo.bowed = true;
                this.whisperer.bowed = true;

                this.noMoreActions();
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.ide],
                    defenders: []
                });
                this.player2.pass();
                this.player1.clickCard(this.ide);
                this.player1.clickCard(this.whisperer);
                expect(this.player1).not.toHavePrompt('Choose a card to discard');
                expect(this.whisperer.bowed).toBe(false);
            });
        });
    });
});
