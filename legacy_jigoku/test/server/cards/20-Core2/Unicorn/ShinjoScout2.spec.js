describe('Shinjo Scout 2', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['shinjo-scout-2'],
                    hand: []
                },
                player2: {
                    provinces: ['midnight-revels']
                }
            });

            this.shinjoScout = this.player1.findCardByName('shinjo-scout-2');

            this.revels = this.player2.findCardByName('midnight-revels', 'province 1');
        });

        it('blocks province triggers when revealing a province', function () {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.shinjoScout],
                type: 'military',
                province: this.revels
            });
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.shinjoScout);

            this.player1.clickCard(this.shinjoScout);
            expect(this.player2).not.toHavePrompt('Triggered Abilities');
            expect(this.getChatLogs(5)).toContain(
                'player1 uses Shinjo Scout to avoid the dangers of their exploration'
            );
            expect(this.getChatLogs(5)).toContain(
                'player1 prevents Midnight Revels from triggering its abilities during this conflict'
            );
        });

        it('does not block province triggers when revealing a province', function () {
            this.revels.facedown = false;

            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.shinjoScout],
                type: 'military',
                province: this.revels
            });
            expect(this.player1).not.toHavePrompt('Triggered Abilities');
            expect(this.player1).not.toBeAbleToSelect(this.shinjoScout);
            expect(this.player2).toHavePrompt('Triggered Abilities');
            expect(this.player2).toBeAbleToSelect(this.revels);
        });
    });
});
