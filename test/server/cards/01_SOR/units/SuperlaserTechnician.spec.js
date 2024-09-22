describe('Superlaser Technician', function() {
    integration(function() {
        describe('Superlaser Technician\'s ability', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['superlaser-technician']
                    },
                    player2: {
                        groundArena: ['sundari-peacekeeper']
                    }
                });
            });

            it('should allow the controller to put the defeated Technician into play as a resource and ready it', function () {
                this.player1.clickCard(this.superlaserTechnician);
                this.player1.clickCard(this.sundariPeacekeeper);

                const readyResourcesBeforeTrigger = this.player1.countSpendableResources();
                expect(this.player1).toHavePassAbilityPrompt('Put Superlaser Technician into play as a resource and ready it');
                this.player1.clickPrompt('Put Superlaser Technician into play as a resource and ready it');

                expect(this.player1.countSpendableResources()).toBe(readyResourcesBeforeTrigger + 1);
                expect(this.superlaserTechnician).toBeInLocation('resource');
                expect(this.player2).toBeActivePlayer();
            });
        });
    });
});
