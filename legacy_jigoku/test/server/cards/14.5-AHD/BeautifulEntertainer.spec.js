describe('Beautiful Entertainer', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    honor: 9,
                    inPlay: ['bayushi-shoju']
                },
                player2: {
                    honor: 9,
                    inPlay: ['beautiful-entertainer']
                }
            });
            this.bayushiShoju = this.player1.findCardByName('bayushi-shoju');
            this.entertainer = this.player2.findCardByName('beautiful-entertainer');

            this.noMoreActions();
            this.initiateConflict({
                type: 'political',
                attackers: [this.bayushiShoju],
                defenders: [this.entertainer]
            });
            this.player2.pass();
        });

        it('should prompt you to gain 2 honor if you are less honorable', function() {
            this.player1.honor = 10;
            this.player2.honor = 9;
            let honor = this.player2.honor;

            this.player1.clickCard(this.bayushiShoju);
            this.player1.clickCard(this.entertainer);
            expect(this.player2).toHavePrompt('Triggered Abilities');
            expect(this.player2).toBeAbleToSelect(this.entertainer);
            this.player2.clickCard(this.entertainer);
            expect(this.player2.honor).toBe(honor + 2);
            expect(this.getChatLogs(5)).toContain('player2 uses Beautiful Entertainer to gain 2 honor');
        });

        it('should not prompt you to gain 2 honor if you are equally honorable', function() {
            this.player1.honor = 9;
            this.player2.honor = 9;

            this.player1.clickCard(this.bayushiShoju);
            this.player1.clickCard(this.entertainer);
            expect(this.player2).not.toHavePrompt('Triggered Abilities');
        });

        it('should not prompt you to gain 2 honor if you are more honorable', function() {
            this.player1.honor = 9;
            this.player2.honor = 10;

            this.player1.clickCard(this.bayushiShoju);
            this.player1.clickCard(this.entertainer);
            expect(this.player2).not.toHavePrompt('Triggered Abilities');
        });
    });
});
