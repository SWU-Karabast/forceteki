describe('Darth Vader, Dark Lord of the Sith', function() {
    integration(function() {
        describe('Vader\'s undeployed ability', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['tieln-fighter', 'swoop-racer'],
                        groundArena: ['atst'],
                        leader: 'darth-vader#dark-lord-of-the-sith',
                        resources: 6 //making vader undeployable makes testing the activated ability's condition smoother
                    },
                    player2: {
                        spaceArena: ['alliance-xwing'],
                        leader: { card: 'luke-skywalker#faithful-friend', deployed: true }
                    }
                });
            });

            it('should only be usable if the controller played a villainy card this phase', function () {
                expect(this.darthVader).not.toHaveAvailableActionWhenClickedInActionPhaseBy(this.player1);
                this.player1.clickCard(this.tielnFighter);
                this.player2.passAction();
                const exhaustedResourcesBeforeAbilityUsed = this.player1.countExhaustedResources();
                expect(this.darthVader).toHaveAvailableActionWhenClickedInActionPhaseBy(this.player1);
                expect(this.player1).toBeAbleToSelectExactly([this.tielnFighter, this.atst, this.allianceXwing, this.lukeSkywalker]); //can target any unit
                this.player1.clickCard(this.lukeSkywalker);
                expect(this.darthVader.exhausted).toBe(true);
                expect(this.player1.countExhaustedResources()).toBe(exhaustedResourcesBeforeAbilityUsed + 1);
                expect(this.lukeSkywalker.damage).toBe(1);
                expect(this.p2Base.damage).toBe(1);

                this.moveToNextActionPhase();
                expect(this.darthVader).not.toHaveAvailableActionWhenClickedInActionPhaseBy(this.player1);
                this.player1.clickCard(this.swoopRacer);
                this.player2.passAction();
                expect(this.darthVader).not.toHaveAvailableActionWhenClickedInActionPhaseBy(this.player1);
            });
        });

        describe('Vader\'s deployed ability', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['atst'],
                        spaceArena: ['tieln-fighter'],
                        leader: { card: 'darth-vader#dark-lord-of-the-sith', deployed: true }
                    },
                    player2: {
                        spaceArena: ['alliance-xwing'],
                        leader: { card: 'luke-skywalker#faithful-friend', deployed: true }
                    }
                });
            });

            it('should optionally deal 2 damage to any unit on attack', function () {
                this.player1.clickCard(this.darthVader);
                this.player1.clickCard(this.lukeSkywalker);
                expect(this.player1).toBeAbleToSelectExactly([this.darthVader, this.atst, this.tielnFighter, this.allianceXwing, this.lukeSkywalker]);
                expect(this.player1).toHaveEnabledPromptButton('Pass ability');
                this.player1.clickCard(this.allianceXwing);
                expect(this.allianceXwing.damage).toBe(2);
                expect(this.lukeSkywalker.damage).toBe(5);
                expect(this.p2Base.damage).toBe(0);
            });
        });
    });
});