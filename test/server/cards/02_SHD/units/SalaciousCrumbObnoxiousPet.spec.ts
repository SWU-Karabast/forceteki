describe('Salacious Crumb, Obnoxious Pet', function() {
    integration(function(contextRef) {
        describe('Crumb\'s when played ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['salacious-crumb#obnoxious-pet']
                    }
                });
            });

            it('should heal 1 from friendly base', function () {
                const { context } = contextRef;

                context.setDamage(context.p1Base, 5);
                context.player1.clickCard(context.salaciousCrumb);
                expect(context.salaciousCrumb).toBeInLocation('ground arena');

                expect(context.p1Base.damage).toBe(4);
            });

            it('should heal 0 from base if base has no damage', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.salaciousCrumb);
                expect(context.salaciousCrumb).toBeInLocation('ground arena');

                expect(context.p1Base.damage).toBe(0);
            });
        });

        describe('Crumb\'s action ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['salacious-crumb#obnoxious-pet', 'wampa'],
                    },
                    player2: {
                        groundArena: ['frontier-atrt'],
                        spaceArena: ['cartel-spacer']
                    }
                });
            });

            it('should deal 1 damage to any selected ground unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.salaciousCrumb);
                context.player1.clickPrompt('Deal 1 damage to a ground unit');

                // can target any ground unit
                expect(context.player1).toBeAbleToSelectExactly([context.frontierAtrt, context.wampa]);

                context.player1.clickCard(context.frontierAtrt);
                expect(context.frontierAtrt.damage).toBe(1);
                expect(context.salaciousCrumb).toBeInLocation('hand');
            });

            it('should not be available if Crumb is exhausted', function () {
                const { context } = contextRef;

                context.salaciousCrumb.exhausted = true;
                expect(context.salaciousCrumb).not.toHaveAvailableActionWhenClickedBy(context.player1);
            });
        });
    });
});
