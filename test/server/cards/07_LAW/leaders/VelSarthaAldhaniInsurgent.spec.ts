describe('Vel Sartha, Aldhani Insurgent', function() {
    integration(function(contextRef) {
        describe('Vel Sartha, Aldhani Insurgent\'s leader ability (undeployed)', function() {
            beforeEach(function() {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['rebel-pathfinder'],
                        spaceArena: ['heroic-arc170'],
                        leader: 'vel-sartha#aldhani-insurgent'
                    },
                    player2: {
                        groundArena: ['wookiee-warrior'],
                        spaceArena: ['tieln-fighter'],
                        leader: 'rio-durant#wisecracking-wheelman'
                    }
                });
            });

            it('should give an experience token to a unit and an opponent creates a Credit token', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.velSarthaAldhaniInsurgent);
                context.player1.clickPrompt('Give an experience token to a unit, an opponent creates a Credit token');
                expect(context.player1).toBeAbleToSelectExactly([context.rebelPathfinder, context.heroicArc170, context.wookieeWarrior, context.tielnFighter]);
                context.player1.clickCard(context.rebelPathfinder);

                expect(context.rebelPathfinder).toHaveExactUpgradeNames(['experience']);
                expect(context.velSarthaAldhaniInsurgent.exhausted).toBeTrue();

                const creditTokens = context.player2.findCardsByName('credit');
                expect(creditTokens.length).toBe(1);
                expect(context.player2).toBeActivePlayer();
            });

            it('should not give an experience token as there\'s no units and an opponent creates a Credit token', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'vel-sartha#aldhani-insurgent'
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.velSarthaAldhaniInsurgent);
                context.player1.clickPrompt('Give an experience token to a unit, an opponent creates a Credit token');
                expect(context.velSarthaAldhaniInsurgent.exhausted).toBeTrue();

                const creditTokens = context.player2.findCardsByName('credit');
                expect(creditTokens.length).toBe(1);
                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('Vel Sartha, Aldhani Insurgent\'s leader ability (deployed)', function() {
            beforeEach(function() {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['rebel-pathfinder'],
                        spaceArena: ['heroic-arc170'],
                        leader: { card: 'vel-sartha#aldhani-insurgent', deployed: true }
                    },
                    player2: {
                        groundArena: ['wookiee-warrior'],
                        spaceArena: ['tieln-fighter']
                    }
                });
            });

            it('should give an experience token to a unit and an opponent creates a Credit token on attack', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.velSarthaAldhaniInsurgent);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toHavePrompt('Give an experience token to a unit, an opponent creates a Credit token');
                expect(context.player1).toBeAbleToSelectExactly([context.rebelPathfinder, context.heroicArc170, context.wookieeWarrior, context.tielnFighter, context.velSarthaAldhaniInsurgent]);
                context.player1.clickCard(context.velSarthaAldhaniInsurgent);

                expect(context.velSarthaAldhaniInsurgent).toHaveExactUpgradeNames(['experience']);
                const creditTokens = context.player2.findCardsByName('credit');
                expect(creditTokens.length).toBe(1);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});