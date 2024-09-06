describe('Luke Skywalker, Faithful Friend', function() {
    integration(function() {
        describe('Luke\'s undeployed ability', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['battlefield-marine', 'cartel-spacer'],
                        groundArena: ['atst'],
                        leader: 'luke-skywalker#faithful-friend'
                    },
                    player2: {
                        hand: ['alliance-dispatcher'],
                        groundArena: ['specforce-soldier'],
                    }
                });
            });

            it('should give a friendly heroism unit played by us this turn a shield token', function () {
                this.player1.clickCard(this.battlefieldMarine);

                this.player2.clickCard(this.allianceDispatcher);

                this.player1.clickCard(this.cartelSpacer);

                this.player2.passAction();

                this.player1.clickCard(this.lukeSkywalker);
                this.player1.clickPrompt('Give a shield to a heroism unit you played this phase');
                expect(this.battlefieldMarine).toHaveExactUpgradeNames(['shield']);
            });
        });

        // describe('Luke\'s deployed ability', function() {
        //     beforeEach(function () {
        //         this.setupTest({
        //             phase: 'action',
        //             player1: {
        //                 groundArena: ['atst', 'battlefield-marine'],
        //                 spaceArena: ['tieln-fighter'],
        //                 leader: { card: 'grand-moff-tarkin#oversector-governor', deployed: true }
        //             },
        //             player2: {
        //                 groundArena: ['wampa'],
        //                 spaceArena: ['tie-advanced']
        //             }
        //         });
        //     });

        //     it('should give a friendly imperial unit an experience token on attack', function () {
        //         this.player1.clickCard(this.grandMoffTarkin);
        //         this.player1.clickCard(this.wampa);

        //         expect(this.player1).toHavePrompt('Choose a card');
        //         expect(this.player1).toHaveEnabledPromptButton('Pass ability');
        //         expect(this.player1).toBeAbleToSelectExactly([this.atst, this.tielnFighter]);
        //         this.player1.clickCard(this.tielnFighter);

        //         expect(this.tielnFighter.upgrades.length).toBe(1);
        //         expect(this.tielnFighter.upgrades[0].internalName).toBe('experience');
        //         expect(this.grandMoffTarkin.damage).toBe(4);
        //         expect(this.wampa.damage).toBe(2);
        //     });
        // });
    });
});
