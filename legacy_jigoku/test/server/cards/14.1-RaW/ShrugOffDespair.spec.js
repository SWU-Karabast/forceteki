describe('Shrug Off Despair', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['doji-challenger', 'doji-whisperer']
                },
                player2: {
                    inPlay: ['callow-delegate'],
                    provinces: ['shrug-off-despair', 'manicured-garden']
                }
            });

            this.callow = this.player2.findCardByName('callow-delegate');
            this.challenger = this.player1.findCardByName('doji-challenger');
            this.whisperer = this.player1.findCardByName('doji-whisperer');

            this.shrugOffDespair = this.player2.findCardByName('shrug-off-despair', 'province 1');
            this.manicuredGarden = this.player2.findCardByName('manicured-garden', 'province 2');
            this.shrugOffDespair.facedown = false;
            this.manicuredGarden.facedown = false;

            this.game.checkGameState(true);
        });

        it('should move the conflict to itself when at another province', function() {
            this.noMoreActions();

            this.initiateConflict({
                attackers: [this.challenger],
                defenders: [],
                type: 'military',
                province: this.manicuredGarden
            });

            expect(this.player2).toHavePrompt('Conflict Action Window');
            this.player2.clickCard(this.shrugOffDespair);
            expect(this.getChatLogs(10)).toContain('player2 uses Shrug Off Despair to move the conflict to Shrug Off Despair');
            expect(this.game.currentConflict.conflictProvince).toBe(this.shrugOffDespair);
        });

        it('should not move the conflict when you\'re attacking', function() {
            this.noMoreActions();
            this.player1.passConflict();
            this.noMoreActions();

            this.initiateConflict({
                attackers: [this.callow],
                defenders: [],
                type: 'military'
            });

            this.player1.pass();
            expect(this.player2).toHavePrompt('Conflict Action Window');
            this.player2.clickCard(this.shrugOffDespair);
            expect(this.player2).toHavePrompt('Conflict Action Window');
        });
    });
});
