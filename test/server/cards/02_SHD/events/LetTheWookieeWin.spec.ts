describe('Let The Wookiee Win', function() {
    integration(function(contextRef) {
        describe('Let The Wookiee Win\'s ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        base: 'administrators-tower',
                        hand: ['let-the-wookiee-win'],
                        groundArena: ['liberated-slaves', 'isb-agent'],
                    },
                    player2: {
                        groundArena: ['wampa'],
                    }
                });
            });

            it('lets the opponent choose if you ready up to 6 resources or ready a friendly unit', function () {
                const { context } = contextRef;
                const reset = () => {
                    context.player1.moveCard(context.letTheWookieeWin, 'hand');
                    context.player2.passAction();
                };

                context.isbAgent.exhausted = true;

                // Scenario 1: choose to ready a friendly unit that is a wookiee and it is not exhausted
                context.player1.clickCard(context.letTheWookieeWin);
                context.player2.clickPrompt(`${context.player1.name} readies a friendly unit. If it’s a Wookiee unit, they attack with it and it gets +2/+0 for this attack`);
                expect(context.player1).toBeAbleToSelectExactly([context.liberatedSlaves, context.isbAgent]);

                context.player1.clickCard(context.liberatedSlaves);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(5);
                expect(context.player2).toBeActivePlayer();

                reset();

                // Scenario 2: choose to ready a friendly unit that is not a wookiee
                context.player1.clickCard(context.letTheWookieeWin);
                context.player2.clickPrompt(`${context.player1.name} readies a friendly unit. If it’s a Wookiee unit, they attack with it and it gets +2/+0 for this attack`);
                expect(context.player1).toBeAbleToSelectExactly([context.liberatedSlaves, context.isbAgent]);

                context.player1.clickCard(context.isbAgent);
                expect(context.isbAgent.exhausted).toBe(false);
                expect(context.player2).toBeActivePlayer();

                reset();

                // Scenario 3: choose to ready a friendly unit that is a wookiee and it is exhausted
                expect(context.liberatedSlaves.exhausted).toBe(true);
                context.player1.clickCard(context.letTheWookieeWin);
                context.player2.clickPrompt(`${context.player1.name} readies a friendly unit. If it’s a Wookiee unit, they attack with it and it gets +2/+0 for this attack`);
                expect(context.player1).toBeAbleToSelectExactly([context.liberatedSlaves, context.isbAgent]);

                context.player1.clickCard(context.liberatedSlaves);
                context.player1.clickCard(context.wampa);
                expect(context.wampa).toBeInZone('discard', context.player2);
                expect(context.player2).toBeActivePlayer();

                reset();

                // Scenario 4: choose to ready up to 6 resources
                context.player1.clickCard(context.letTheWookieeWin);
                const readyResourcesBeforeChoise = context.player1.readyResourceCount;
                context.player2.clickPrompt(`${context.player1.name} readies up to 6 resources`);
                expect(context.player1.readyResourceCount).toBe(readyResourcesBeforeChoise + 6);
            });
        });
    });
});
