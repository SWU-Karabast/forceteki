describe('Ikoma Ujiaki 2', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    fate: 3,
                    inPlay: ['ikoma-ujiaki-2', 'brash-samurai']
                },
                player2: {
                    inPlay: []
                }
            });
            this.ujiaki = this.player1.findCardByName('ikoma-ujiaki-2');
            this.brashSamurai = this.player1.findCardByName('brash-samurai');
        });


        it('should switch the conflict type from military to political', function() {
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.ujiaki],
                defenders: []
            });
            let honor = this.player1.honor;
            this.player2.pass();
            this.player1.clickCard(this.ujiaki);
            expect(this.game.currentConflict.conflictType).toBe('political');
            expect(this.player1.honor).toBe(honor - 2);
            expect(this.player2).toHavePrompt('Conflict Action Window');
            expect(this.getChatLogs(3)).toContain('player1 uses Ikoma Ujiaki, losing 2 honor to switch the conflict type');
        });

        it('should switch the conflict type from political to military', function() {
            this.noMoreActions();
            this.initiateConflict({
                type: 'political',
                attackers: [this.ujiaki],
                defenders: []
            });
            this.player2.pass();
            this.player1.clickCard(this.ujiaki);
            expect(this.player2).toHavePrompt('Conflict Action Window');
            expect(this.game.currentConflict.conflictType).toBe('military');
        });

        it('should not trigger if not participating', function() {
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.brashSamurai],
                defenders: []
            });
            this.player2.pass();
            expect(this.player1).toHavePrompt('Conflict Action Window');
            this.player1.clickCard(this.ujiaki);
            expect(this.player1).toHavePrompt('Conflict Action Window');
        });

        it('should not trigger outside of a conflict', function() {
            expect(this.player1).toHavePrompt('Action Window');
            this.player1.clickCard(this.ujiaki);
            expect(this.player1).toHavePrompt('Action Window');
        });
    });
});
