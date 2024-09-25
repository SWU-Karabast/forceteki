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

            it('should only have an effect if the controller played a villainy card this phase, but still be usable otherwise', function () {
                //no card played; ability has no effect
                let exhaustedResourcesBeforeAbilityUsed = this.player1.countExhaustedResources();
                this.player1.clickCard(this.darthVader);

                expect(this.darthVader.exhausted).toBe(true);
                expect(this.player1.countExhaustedResources()).toBe(exhaustedResourcesBeforeAbilityUsed + 1);
                expect(this.atst.damage).toBe(0);
                expect(this.lukeSkywalker.damage).toBe(0);
                expect(this.allianceXwing.damage).toBe(0);
                expect(this.p1Base.damage).toBe(0);
                expect(this.p2Base.damage).toBe(0);

                //play a villainy card
                this.darthVader.exhausted = false;
                this.player2.pass();
                this.player1.clickCard(this.tielnFighter);
                this.player2.pass();

                //use ability with effect
                exhaustedResourcesBeforeAbilityUsed = this.player1.countExhaustedResources();
                this.player1.clickCard(this.darthVader);

                expect(this.player1).toBeAbleToSelectExactly([this.tielnFighter, this.atst, this.lukeSkywalker, this.allianceXwing]);
                this.player1.clickCard(this.lukeSkywalker);

                expect(this.player1).toBeAbleToSelectExactly([this.p1Base, this.p2Base]);
                this.player1.clickCard(this.p2Base);

                expect(this.darthVader.exhausted).toBe(true);
                expect(this.player1.countExhaustedResources()).toBe(exhaustedResourcesBeforeAbilityUsed + 1);
                expect(this.atst.damage).toBe(0);
                expect(this.lukeSkywalker.damage).toBe(1);
                expect(this.allianceXwing.damage).toBe(0);
                expect(this.p1Base.damage).toBe(0);
                expect(this.p2Base.damage).toBe(1);
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
                expect(this.player1).toHavePassAbilityButton();
                this.player1.clickCard(this.allianceXwing);
                expect(this.allianceXwing.damage).toBe(2);
                expect(this.lukeSkywalker.damage).toBe(5);
                expect(this.p2Base.damage).toBe(0);
            });
        });
    });
});
