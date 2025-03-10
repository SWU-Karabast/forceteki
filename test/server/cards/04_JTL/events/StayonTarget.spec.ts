describe('Stay on Target', function () {
    integration(function (contextRef) {
        describe('Stay on Target\'s ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['stay-on-target'],
                        spaceArena: ['alliance-xwing', 'special-forces-tie-fighter', 'red-squadron-ywing'],
                        groundArena: ['clone-commander-cody#commanding-the-212th']
                    },
                    player2: {
                        hand: ['vanquish'],
                        spaceArena: ['tieln-fighter']
                    }
                });
            });

            it('should Attack with a Vehicle unit. it gets +2/+0 and gains: "When this unit deals damage to a base: Draw a card', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.stayOnTarget);

                expect(context.player1).toBeAbleToSelectExactly([context.allianceXwing, context.specialForcesTieFighter, context.redSquadronYwing]);
                context.player1.clickCard(context.allianceXwing);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(5); // Cody gives +1/+1
                expect(context.player1.handSize).toBe(1);
            });

            it('should Attack a unit with a Vehicle unit. it gets +2/+0 and Overwhelm triggers to draw a card', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.stayOnTarget);

                expect(context.player1).toBeAbleToSelectExactly([context.allianceXwing, context.specialForcesTieFighter, context.redSquadronYwing]);
                context.player1.clickCard(context.allianceXwing);
                context.player1.clickCard(context.tielnFighter);
                expect(context.p2Base.damage).toBe(4); // Cody gives +1/+1
                expect(context.player1.handSize).toBe(1);
            });

            it('should Attack a unit with a Vehicle unit. it gets +2/+0 but no card draw as no base damage', function () {
                const { context } = contextRef;

                context.player1.passAction();
                context.player2.clickCard(context.vanquish);
                context.player2.clickCard(context.cloneCommanderCody);
                context.player1.clickCard(context.stayOnTarget);
                context.player1.clickCard(context.allianceXwing);
                context.player1.clickCard(context.tielnFighter);
                expect(context.player1.handSize).toBe(0);
            });

            it('should Attack with a Vehicle unit, opponent then assign indirect to base casuing card draw for both', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.stayOnTarget);

                context.player1.clickCard(context.redSquadronYwing);
                context.player1.clickCard(context.p2Base);
                context.player2.setDistributeIndirectDamagePromptState(new Map([
                    [context.p2Base, 3],
                ]));
                expect(context.player1.handSize).toBe(2);
            });
        });
    });
});
