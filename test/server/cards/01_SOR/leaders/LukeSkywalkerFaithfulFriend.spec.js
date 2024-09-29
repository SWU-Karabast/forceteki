describe('Luke Skywalker, Faithful Friend', function() {
    integration(function() {
        describe('Luke\'s undeployed ability', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['battlefield-marine', 'cartel-spacer', 'alliance-xwing'],
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

                const resourcesSpentBeforeLukeActivation = this.player1.countExhaustedResources();
                this.player1.clickCard(this.lukeSkywalker);
                this.player1.clickPrompt('Give a shield to a heroism unit you played this phase');
                expect(this.battlefieldMarine).toHaveExactUpgradeNames(['shield']);
                expect(this.lukeSkywalker.exhausted).toBe(true);
                expect(this.player1.countExhaustedResources()).toBe(resourcesSpentBeforeLukeActivation + 1);
            });

            it('should not be able to give a shield to a unit played in the previous phase', function () {
                this.player1.clickCard(this.battlefieldMarine);

                this.moveToNextActionPhase();

                this.player1.clickCard(this.allianceXwing);

                this.player2.passAction();

                const resourcesSpentBeforeLukeActivation = this.player1.countExhaustedResources();
                this.player1.clickCard(this.lukeSkywalker);
                this.player1.clickPrompt('Give a shield to a heroism unit you played this phase');
                expect(this.allianceXwing).toHaveExactUpgradeNames(['shield']);
                expect(this.lukeSkywalker.exhausted).toBe(true);
                expect(this.player1.countExhaustedResources()).toBe(resourcesSpentBeforeLukeActivation + 1);
            });
        });

        describe('Luke\'s deployed ability', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['atst'],
                        spaceArena: ['tieln-fighter'],
                        leader: { card: 'luke-skywalker#faithful-friend', deployed: true }
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: ['tie-advanced']
                    }
                });
            });

            it('should give any unit a shield token on attack', function () {
                this.player1.clickCard(this.lukeSkywalker);
                this.player1.clickCard(this.wampa);

                expect(this.player1).toHavePrompt('Choose a card');
                expect(this.player1).toHavePassAbilityButton();
                expect(this.player1).toBeAbleToSelectExactly([this.atst, this.tielnFighter, this.wampa, this.tieAdvanced]);
                this.player1.clickCard(this.tielnFighter);

                expect(this.tielnFighter).toHaveExactUpgradeNames(['shield']);
                expect(this.lukeSkywalker.damage).toBe(4);
                expect(this.wampa.damage).toBe(4);

                // reset for a second attack to confirm that shield gets applied to wampa before the attack damage happens
                this.lukeSkywalker.damage = 0;
                this.lukeSkywalker.exhausted = false;
                this.wampa.damage = 0;
                this.player2.passAction();

                this.player1.clickCard(this.lukeSkywalker);
                this.player1.clickCard(this.wampa);
                this.player1.clickCard(this.wampa);

                expect(this.lukeSkywalker.damage).toBe(4);
                expect(this.wampa.damage).toBe(0);
                expect(this.wampa.isUpgraded()).toBe(false);
            });
        });
    });
});
