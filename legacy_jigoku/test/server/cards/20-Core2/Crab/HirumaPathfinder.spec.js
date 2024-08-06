describe('Hiruma Pathfinder', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'dynasty',
                player1: {
                    dynastyDiscard: ['hiruma-pathfinder']
                }
            });

            this.pathfinder = this.player1.moveCard('hiruma-pathfinder', 'province 1');
            this.shamefulDisplay1 = this.player2.findCardByName('shameful-display', 'province 1');
            this.shamefulDisplay2 = this.player2.findCardByName('shameful-display', 'province 2');
            this.shamefulDisplay2.facedown = false;
        });

        it('should allow targeting only facedown provinces', function () {
            this.player1.clickCard(this.pathfinder);
            this.player1.clickPrompt('0');
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.pathfinder);

            this.player1.clickCard(this.pathfinder);
            expect(this.player1).toBeAbleToSelect(this.shamefulDisplay1);
            expect(this.player1).not.toBeAbleToSelect(this.shamefulDisplay2);
        });

        it('should display a message in chat when a province is chosen', function () {
            this.player1.clickCard(this.pathfinder);
            this.player1.clickPrompt('0');
            this.player1.clickCard(this.pathfinder);
            this.player1.clickCard(this.shamefulDisplay1);
            expect(this.getChatLogs(1)).toContain('Hiruma Pathfinder sees Shameful Display in province 1');
        });
    });
});
