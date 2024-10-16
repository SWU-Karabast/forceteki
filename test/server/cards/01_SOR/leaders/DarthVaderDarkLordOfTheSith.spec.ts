describe('Darth Vader, Dark Lord of the Sith', function() {
    integration(function(contextRef) {
        describe('Vader\'s undeployed ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['tieln-fighter', 'swoop-racer'],
                        groundArena: ['atst'],
                        leader: 'darth-vader#dark-lord-of-the-sith',
                        resources: 6 // making vader undeployable makes testing the activated ability's condition smoother
                    },
                    player2: {
                        spaceArena: ['alliance-xwing'],
                        leader: { card: 'luke-skywalker#faithful-friend', deployed: true }
                    }
                });
            });

            it('should only have an effect if the controller played a villainy card this phase, but still be usable otherwise', function () {
                const { context } = contextRef;

                // no card played; ability has no effect
                let exhaustedResourcesBeforeAbilityUsed = context.player1.countExhaustedResources();
                context.player1.clickCard(context.darthVader);

                expect(context.darthVader.exhausted).toBe(true);
                expect(context.player1.countExhaustedResources()).toBe(exhaustedResourcesBeforeAbilityUsed + 1);
                expect(context.atst.damage).toBe(0);
                expect(context.lukeSkywalker.damage).toBe(0);
                expect(context.allianceXwing.damage).toBe(0);
                expect(context.p1Base.damage).toBe(0);
                expect(context.p2Base.damage).toBe(0);

                // play a villainy card
                context.darthVader.exhausted = false;
                context.player2.passAction();
                context.player1.clickCard(context.tielnFighter);
                context.player2.passAction();

                // use ability with effect
                exhaustedResourcesBeforeAbilityUsed = context.player1.countExhaustedResources();
                context.player1.clickCard(context.darthVader);

                expect(context.player1).toBeAbleToSelectExactly([context.tielnFighter, context.atst, context.lukeSkywalker, context.allianceXwing]);
                context.player1.clickCard(context.lukeSkywalker);

                expect(context.player1).toBeAbleToSelectExactly([context.p1Base, context.p2Base]);
                context.player1.clickCard(context.p2Base);

                expect(context.darthVader.exhausted).toBe(true);
                expect(context.player1.countExhaustedResources()).toBe(exhaustedResourcesBeforeAbilityUsed + 1);
                expect(context.atst.damage).toBe(0);
                expect(context.lukeSkywalker.damage).toBe(1);
                expect(context.allianceXwing.damage).toBe(0);
                expect(context.p1Base.damage).toBe(0);
                expect(context.p2Base.damage).toBe(1);
            });
        });

        describe('Vader\'s deployed ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
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
                const { context } = contextRef;

                context.player1.clickCard(context.darthVader);
                context.player1.clickCard(context.lukeSkywalker);
                expect(context.player1).toBeAbleToSelectExactly([context.darthVader, context.atst, context.tielnFighter, context.allianceXwing, context.lukeSkywalker]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickCard(context.allianceXwing);
                expect(context.allianceXwing.damage).toBe(2);
                expect(context.lukeSkywalker.damage).toBe(5);
                expect(context.p2Base.damage).toBe(0);
            });
        });
    });
});
