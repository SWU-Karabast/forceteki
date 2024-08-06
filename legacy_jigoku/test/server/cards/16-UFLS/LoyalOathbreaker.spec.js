describe('Loyal Oathbreaker', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    stronghold: 'city-of-the-open-hand',
                    hand: ['prove-your-skill'],
                    inPlay: ['aranat'],
                    dynastyDiscard: ['loyal-oathbreaker'],
                    honor: 15
                },
                player2: {
                    stronghold: 'city-of-the-open-hand',
                    hand: ['prove-your-skill'],
                    inPlay: ['aranat'],
                    dynastyDiscard: ['loyal-oathbreaker'],
                    honor: 10
                }
            });

            this.city = this.player1.findCardByName('city-of-the-open-hand');
            this.aranat = this.player1.findCardByName('aranat');
            this.oathbreaker = this.player1.findCardByName('loyal-oathbreaker');
            this.skill = this.player1.findCardByName('prove-your-skill');

            this.city2 = this.player2.findCardByName('city-of-the-open-hand');
            this.aranat2 = this.player2.findCardByName('aranat');
            this.oathbreaker2 = this.player2.findCardByName('loyal-oathbreaker');
            this.skill2 = this.player2.findCardByName('prove-your-skill');

            this.aranat.honor();
            this.aranat2.honor();
        });

        it('should let you use less honorable triggers even if more honorable', function() {
            let honor = this.player1.honor;
            this.player1.clickCard(this.city);
            expect(this.player1).toHavePrompt('Action Window');
            this.player1.moveCard(this.oathbreaker, 'play area');
            this.game.checkGameState(true);
            this.player1.clickCard(this.city);
            expect(this.player2).toHavePrompt('Action Window');
            expect(this.player1.honor).toBe(honor + 1);
        });

        it('should not let opponent use less honorable triggers even if less honorable', function() {
            this.player1.moveCard(this.oathbreaker, 'play area');
            this.game.checkGameState(true);
            this.player1.pass();
            this.player2.clickCard(this.city2);
            expect(this.player2).toHavePrompt('Action Window');
        });

        it('should not let you use more honorable triggers even if more honorable', function() {
            this.player1.clickCard(this.skill);
            expect(this.player1).toHavePrompt('Prove Your Skill');
            this.player1.clickPrompt('Cancel');
            this.player1.moveCard(this.oathbreaker, 'play area');
            this.game.checkGameState(true);
            this.player1.clickCard(this.skill);
            expect(this.player1).toHavePrompt('Action Window');
        });

        it('should let opponent use more honorable triggers even if less honorable', function() {
            this.player1.moveCard(this.oathbreaker, 'play area');
            this.game.checkGameState(true);
            this.player1.pass();
            this.player2.clickCard(this.skill2);
            expect(this.player2).toHavePrompt('Prove Your Skill');
        });

        it('two oathbreakers - should not let you use more honorable triggers no matter what', function() {
            this.player1.moveCard(this.oathbreaker, 'play area');
            this.player2.moveCard(this.oathbreaker2, 'play area');
            this.game.checkGameState(true);
            this.player1.clickCard(this.skill);
            expect(this.player1).toHavePrompt('Action Window');
            this.player1.pass();
            this.player2.clickCard(this.skill2);
            expect(this.player2).toHavePrompt('Action Window');
        });

        it('two oathbreakers - should let you use less honorable triggers no matter what', function() {
            let honor = this.player1.honor;
            let honor2 = this.player2.honor;

            this.player1.moveCard(this.oathbreaker, 'play area');
            this.player2.moveCard(this.oathbreaker2, 'play area');
            this.game.checkGameState(true);
            this.player1.clickCard(this.city);
            this.player2.clickCard(this.city2);
            expect(this.player1.honor).toBe(honor + 1);
            expect(this.player2.honor).toBe(honor2 + 1);
        });
    });
});
