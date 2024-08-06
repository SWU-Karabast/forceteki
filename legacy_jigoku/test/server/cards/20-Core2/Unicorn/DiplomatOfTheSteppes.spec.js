describe('Diplomat of the Steppes', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['arbiter-of-authority']
                },
                player2: {
                    inPlay: ['diplomat-of-the-steppes', 'wandering-ronin','golden-eagle'],
                    hand: []
                }
            });

            this.arbiterOfAuthority = this.player1.findCardByName('arbiter-of-authority');
            this.diplomatOfTheSteppes = this.player2.findCardByName('diplomat-of-the-steppes');
            this.wanderingRonin = this.player2.findCardByName('wandering-ronin');
            this.goldenEagle = this.player2.findCardByName('golden-eagle');
            this.noMoreActions();
        });

        it('does not trigger unless winning on political', function () {
            let honor = this.player2.player.honor;
            this.initiateConflict({
                type: 'political',
                attackers: [this.arbiterOfAuthority],
                defenders: [this.diplomatOfTheSteppes]
            });
            expect(this.game.currentConflict.conflictType).toBe('political');
            this.player2.clickCard(this.diplomatOfTheSteppes);
            expect(this.player2.player.honor).not.toBe(honor - 1);
            expect(this.game.currentConflict.conflictType).toBe('political');
            expect(this.getChatLogs(5)).not.toContain(
                'player2 uses Diplomat of the Steppes, losing 1 honor to switch the conflict type to military'
            );
        });

        it('should cost 1 honor and switch the conflict type from political to military', function () {
            let honor = this.player2.player.honor;
            this.initiateConflict({
                type: 'political',
                attackers: [this.arbiterOfAuthority],
                defenders: [this.diplomatOfTheSteppes, this.goldenEagle]
            });
            expect(this.game.currentConflict.conflictType).toBe('political');
            this.player2.clickCard(this.diplomatOfTheSteppes);
            expect(this.player2.player.honor).toBe(honor - 1);
            expect(this.game.currentConflict.conflictType).toBe('military');
            expect(this.getChatLogs(5)).toContain(
                'player2 uses Diplomat of the Steppes, losing 1 honor to switch the conflict type to military'
            );
        });

        it('should not switch the conflict from military to political', function () {
            let honor = this.player2.player.honor;
            this.initiateConflict({
                type: 'military',
                attackers: [this.arbiterOfAuthority],
                defenders: [this.diplomatOfTheSteppes, this.wanderingRonin]
            });

            expect(this.game.currentConflict.conflictType).toBe('military');
            this.player2.clickCard(this.diplomatOfTheSteppes);
            expect(this.player2.player.honor).toBe(honor);
            expect(this.game.currentConflict.conflictType).toBe('military');
        });
    });
});
