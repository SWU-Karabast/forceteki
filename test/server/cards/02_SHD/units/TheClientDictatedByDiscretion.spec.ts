describe('The Client, Dictated by Discretion', function() {
    integration(function(contextRef) {
        describe('The Client\'s Bounty ability', function() {
            beforeEach(function() {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        base: { card: 'kestro-city', damage: 10 },
                        groundArena: ['the-client#dictated-by-discretion', 'jango-fett#renowned-bounty-hunter']
                    },
                    player2: {
                        base: { card: 'echo-base', damage: 5 },
                        groundArena: ['wampa']
                    }
                });
            });

            it('should add a bounty which heal 5 damage from a base', function () {
                const { context } = contextRef;

                // add a bounty to wampa
                context.player1.clickCard(context.theClient);
                context.player1.clickPrompt('Choose a unit. For this phase, it gains: "Bounty — Heal 5 damage from a base."');

                expect(context.player1).toBeAbleToSelectExactly([context.theClient, context.wampa, context.jangoFett]);
                context.player1.clickCard(context.wampa);

                expect(context.theClient.exhausted).toBeTrue();
                expect(context.player2).toBeActivePlayer();
                context.player2.passAction();

                // kill wampa with jango (while wampa has a bounty, jango gets +3/+0)
                context.player1.clickCard(context.jangoFett);
                context.player1.clickCard(context.wampa);

                // heal 5 from kestro city
                context.player1.clickPrompt('Bounty: Heal 5 damage from a base');
                expect(context.player1).toBeAbleToSelectExactly([context.p1Base, context.p2Base]);
                expect(context.player1).toHavePassAbilityButton();

                context.player1.clickCard(context.p1Base);
                expect(context.p1Base.damage).toBe(5);
            });

            it('should add a bounty which expire with action phase', function () {
                const { context } = contextRef;

                // add a bounty to wampa
                context.player1.clickCard(context.theClient);
                context.player1.clickPrompt('Choose a unit. For this phase, it gains: "Bounty — Heal 5 damage from a base."');

                expect(context.player1).toBeAbleToSelectExactly([context.theClient, context.wampa, context.jangoFett]);
                context.player1.clickCard(context.wampa);

                expect(context.theClient.exhausted).toBeTrue();
                expect(context.player2).toBeActivePlayer();

                context.moveToNextActionPhase();

                // attack wampa with jango (as bounty expires on action phase, wampa is not dead)
                context.player1.clickCard(context.jangoFett);
                context.player1.clickCard(context.wampa);

                expect(context.wampa.location).toBe('ground arena');
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});