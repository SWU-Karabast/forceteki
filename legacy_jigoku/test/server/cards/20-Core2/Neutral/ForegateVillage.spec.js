describe('Foregate Village', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['matsu-berserker']
                },
                player2: {
                    provinces: ['foregate-village']
                }
            });
            this.matsuBerserker = this.player1.findCardByName('matsu-berserker');
            this.noMoreActions();
            this.initiateConflict({
                attackers: ['matsu-berserker']
            });
        });

        it('should trigger when attackers are declared', function () {
            expect(this.player2).toHavePrompt('Triggered Abilities');
            expect(this.player2).toBeAbleToSelect('foregate-village');
        });

        it('should change the conflict type and send illegal attackers home bowed', function () {
            this.player2.clickCard('foregate-village');
            expect(this.game.currentConflict.conflictType).toBe('political');
            expect(this.matsuBerserker.bowed).toBe(true);
            expect(this.matsuBerserker.inConflict).toBe(false);
        });
    });
});
