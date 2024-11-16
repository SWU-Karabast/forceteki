describe('Grand Moff Tarkin, Oversector Governor', function() {
    integration(function(contextRef) {
        describe('Tarkin\'s undeployed ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['atst', 'battlefield-marine'],
                        spaceArena: ['tieln-fighter'],
                        leader: 'grand-moff-tarkin#oversector-governor'
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: ['tie-advanced']
                    }
                });
            });

            it('should give a friendly imperial unit an experience token', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.grandMoffTarkin);
                context.player1.clickPrompt('Give an experience token to an Imperial unit');
                expect(context.player1).toBeAbleToSelectExactly([context.atst, context.tielnFighter]);

                context.player1.clickCard(context.atst);
                expect(context.grandMoffTarkin.exhausted).toBe(true);
                expect(context.atst).toHaveExactUpgradeNames(['experience']);
                expect(context.player1.exhaustedResourceCount).toBe(1);
            });
        });

        describe('Tarkin\'s undeployed ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['battlefield-marine'],
                        leader: 'grand-moff-tarkin#oversector-governor'
                    },
                    player2: {
                        groundArena: ['wampa'],
                    }
                });
            });

            it('can be activated with no target', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.grandMoffTarkin);
                context.player1.clickPrompt('Give an experience token to an Imperial unit');

                expect(context.player2).toBeActivePlayer();
                expect(context.grandMoffTarkin.exhausted).toBe(true);
                expect(context.player1.exhaustedResourceCount).toBe(1);
            });
        });


        describe('Tarkin\'s deployed ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['atst', 'battlefield-marine'],
                        spaceArena: ['tieln-fighter'],
                        leader: { card: 'grand-moff-tarkin#oversector-governor', deployed: true }
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: ['tie-advanced']
                    }
                });
            });

            it('should give a friendly imperial unit an experience token on attack', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.grandMoffTarkin);
                context.player1.clickCard(context.wampa);

                expect(context.player1).toHavePrompt('Choose a card');
                expect(context.player1).toHavePassAbilityButton();
                expect(context.player1).toBeAbleToSelectExactly([context.atst, context.tielnFighter]);
                context.player1.clickCard(context.tielnFighter);

                expect(context.tielnFighter).toHaveExactUpgradeNames(['experience']);
                expect(context.grandMoffTarkin.damage).toBe(4);
                expect(context.wampa.damage).toBe(2);
            });
        });
    });
});
