describe('Smuggler\'s Starfighter', function() {
    integration(function(contextRef) {
        describe('Smuggler\'s Starfighter\'s ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['smugglers-starfighter'],
                        groundArena: ['greedo#slow-on-the-draw'],
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: ['green-squadron-awing']
                    }
                });
            });

            it('should give -3/-0 to an enemy unit if we control another Underworld unit.', function () {
                const { context } = contextRef;
                context.player1.clickCard(context.smugglersStarfighter);
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.greenSquadronAwing]);
                context.player1.clickCard(context.wampa);
                expect(context.wampa.getPower()).toBe(1);
                expect(context.wampa.getHp()).toBe(5);
                expect(context.player2).toBeActivePlayer();

                // attack with wampa to check power again
                context.player2.clickCard(context.wampa);
                context.player2.clickCard(context.p1Base);
                expect(context.p1Base.damage).toBe(1);
            });
        });

        describe('Smuggler\'s Starfighter\'s ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['smugglers-starfighter'],
                        groundArena: ['battlefield-marine']
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: ['green-squadron-awing']
                    }
                });
            });

            it('should not give -3/-0 to an enemy unit if we do not control another Underworld unit.', function () {
                const { context } = contextRef;
                context.player1.clickCard(context.smugglersStarfighter);
                expect(context.player2).toBeActivePlayer();

                // attack with wampa to check power
                context.player2.clickCard(context.wampa);
                expect(context.p1Base.damage).toBe(4);
            });
        });
    });
});
