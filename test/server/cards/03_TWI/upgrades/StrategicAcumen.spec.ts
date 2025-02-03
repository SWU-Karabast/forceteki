describe('Strategic Acumen', function() {
    integration(function(contextRef) {
        it('Strategic Acumen\'s activated ability should allow the controller to play a unit with a discount of 1', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    groundArena: [{ card: 'wampa', upgrades: ['strategic-acumen'] }],
                    base: 'echo-base',
                    leader: 'han-solo#audacious-smuggler',
                    hand: ['waylay', 'consortium-starviper', 'jawa-scavenger', 'swoop-racer', 'battlefield-marine'],
                    resources: 30
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.wampa);
            expect(context.player1).toHaveEnabledPromptButtons(['Attack', 'Play a unit from your hand. It costs 1 less']);
            context.player1.clickPrompt('Play a unit from your hand. It costs 1 less');
            expect(context.player1).toBeAbleToSelectExactly([context.consortiumStarviper, context.jawaScavenger, context.swoopRacer, context.battlefieldMarine]);
            expect(context.player1).toHaveChooseNoTargetButton();
            context.player1.clickCard(context.jawaScavenger);
            expect(context.wampa.exhausted).toBe(true);
            expect(context.jawaScavenger).toBeInZone('groundArena');
            expect(context.player1.exhaustedResourceCount).toBe(0);

            context.player2.passAction();

            // cost discount from Dispatcher should be gone
            context.player1.clickCard(context.swoopRacer);
            expect(context.swoopRacer).toBeInZone('groundArena');
            expect(context.player1.exhaustedResourceCount).toBe(3);

            const exhaustedResourceCount = context.player1.exhaustedResourceCount;
            context.player2.passAction();
            context.wampa.exhausted = false;

            // can choose no target and play it later without discount
            context.player1.clickCard(context.wampa);
            context.player1.clickPrompt('Play a unit from your hand. It costs 1 less');
            context.player1.clickPrompt('Choose no target');
            expect(context.wampa.exhausted).toBe(true);

            context.player2.passAction();

            context.player1.clickCard(context.battlefieldMarine);
            expect(context.battlefieldMarine).toBeInZone('groundArena');
            expect(context.player1.exhaustedResourceCount).toBe(exhaustedResourceCount + 2);

            context.player2.passAction();
            context.wampa.exhausted = false;

            // should be able to select and play a unit that costs exactly 1 more than ready resources
            context.player1.setResourceCount(2);
            context.player1.clickCard(context.wampa);
            context.player1.clickPrompt('Play a unit from your hand. It costs 1 less');
            expect(context.player1).toBeAbleToSelectExactly([context.consortiumStarviper]);
            expect(context.player1).toHaveChooseNoTargetButton();
            context.player1.clickCard(context.consortiumStarviper);
            expect(context.consortiumStarviper).toBeInZone('spaceArena');
            expect(context.player1.exhaustedResourceCount).toBe(2);
            expect(context.player2).toBeActivePlayer();
        });
    });
});
