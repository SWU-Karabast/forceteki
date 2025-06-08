describe('Hyena Bomber', function() {
    integration(function(contextRef) {
        describe('Hyena Bomber\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['hyena-bomber'],
                        groundArena: ['wampa'],
                    },
                    player2: {
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['green-squadron-awing']
                    }
                });
            });

            it('should deal 2 damage to friendly unit because we control another aggression unit.', function () {
                const { context } = contextRef;
                context.player1.clickCard(context.hyenaBomber);
                // should select ground unit of both players
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.battlefieldMarine]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickCard(context.wampa);
                expect(context.wampa.damage).toBe(2);
                expect(context.player2).toBeActivePlayer();
            });

            it('should deal 2 damage to enemy unit because we control another aggression unit.', function () {
                const { context } = contextRef;
                context.player1.clickCard(context.hyenaBomber);
                // should select ground unit of both players
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.battlefieldMarine]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.battlefieldMarine.damage).toBe(2);
                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('Hyena Bomber\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['hyena-bomber'],
                        groundArena: ['battlefield-marine'],
                    },
                    player2: {
                        groundArena: ['wampa', 'greedo#slow-on-the-draw']
                    }
                });
            });

            it('should not deal 2 damage to unit because we do not control another Bounty Hunter unit.', function () {
                const { context } = contextRef;
                context.player1.clickCard(context.hyenaBomber);
                expect(context.wampa.damage).toBe(0);
                expect(context.greedo.damage).toBe(0);
                expect(context.battlefieldMarine.damage).toBe(0);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});