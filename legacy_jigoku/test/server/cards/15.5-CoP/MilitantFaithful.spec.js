describe('Militant Faithful', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    honor:10,
                    inPlay: ['militant-faithful']
                },
                player2: {
                    honor:14,
                    fate: 100,
                    inPlay: ['yoritomo']
                }
            });

            this.faithful = this.player1.findCardByName('militant-faithful');
            this.yoritomo = this.player2.findCardByName('yoritomo');
            this.noMoreActions();
        });

        it('should not bow if opponent controls an honored character', function() {
            this.initiateConflict({
                type: 'military',
                attackers: [this.faithful],
                defenders: [this.yoritomo]
            });

            this.yoritomo.honor();
            this.noMoreActions();
            expect(this.player1).toHavePrompt('Action Window');
            expect(this.faithful.bowed).toBe(false);
        });

        it('should not bow if opponent controls a dishonored character', function() {
            this.initiateConflict({
                type: 'military',
                attackers: [this.faithful],
                defenders: [this.yoritomo]
            });

            this.yoritomo.dishonor();
            this.noMoreActions();
            expect(this.player1).toHavePrompt('Action Window');
            expect(this.faithful.bowed).toBe(false);
        });

        it('should bow if opponent does not control an honored or dishonored character', function() {
            this.initiateConflict({
                type: 'military',
                attackers: [this.faithful],
                defenders: [this.yoritomo]
            });

            this.noMoreActions();
            expect(this.player1).toHavePrompt('Action Window');
            expect(this.faithful.bowed).toBe(true);
        });
    });
});
