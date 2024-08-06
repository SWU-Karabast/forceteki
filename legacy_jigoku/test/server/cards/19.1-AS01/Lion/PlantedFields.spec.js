describe('Planted Fields', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['vanguard-warrior'],
                    dynastyDiscard: ['planted-fields']
                },
                player2: {
                    inPlay: ['vanguard-warrior']
                }
            });

            this.plantedFields = this.player1.findCardByName('planted-fields');
            this.shameful = this.player1.findCardByName('shameful-display', 'province 1');
            this.player1.placeCardInProvince(this.plantedFields, 'province 1');

            this.noMoreActions();
            this.player1.passConflict();
            this.noMoreActions();
            this.player2.passConflict();
            this.noMoreActions();
            this.player1.passConflict();
            this.noMoreActions();
            this.player2.passConflict();
        });

        it('should trigger at the end of the conflict phase if it is in an unbroken province', function() {
            this.noMoreActions();
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.plantedFields);
        });

        it('should not trigger at the end of the conflict phase if it is in a broken province', function() {
            this.shameful.isBroken = true;
            this.noMoreActions();
            expect(this.player1).not.toHavePrompt('Triggered Abilities');
        });

        it('should sacrifice itself to give 2 fate and draw 2 cards', function() {
            let honor = this.player1.honor;
            let fate = this.player1.fate;
            let handSize = this.player1.hand.length;
            this.noMoreActions();
            this.player1.clickCard(this.plantedFields);

            expect(this.player1.honor).toBe(honor);
            expect(this.player1.fate).toBe(fate + 2);
            expect(this.player1.hand.length).toBe(handSize + 2);
            expect(this.plantedFields.location).toBe('dynasty discard pile');
            expect(this.getChatLogs(5)).toContain('player1 uses Planted Fields, sacrificing Planted Fields to gain 2 fate and draw 2 cards');
        });
    });
});
