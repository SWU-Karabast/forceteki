describe('Desperate Commando', function () {
    integration(function (contextRef) {
        it('Desperate Commando\'s ability should give a unit -1/-1 on defeat', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['desperate-commando', 'battlefield-marine'],
                    spaceArena: ['tie-advanced']
                },
                player2: {
                    hand: ['takedown', 'rivals-fall'],
                    groundArena: ['battle-droid', 'pyke-sentinel', 'admiral-motti#brazen-and-scornful'],
                    spaceArena: ['cartel-spacer'],
                    hasInitiative: true
                }
            });

            const { context } = contextRef;
            // Defeat Desperate Commando
            context.player2.clickCard(context.takedown);
            context.player2.clickCard(context.desperateCommando);
            expect(context.player1).toHavePassAbilityButton();
            expect(context.player1).toBeAbleToSelectExactly([
                context.battlefieldMarine,
                context.battleDroid,
                context.pykeSentinel,
                context.admiralMotti,
                context.cartelSpacer,
                context.tieAdvanced
            ]);

            // Apply "When Defeated Ability"
            context.player1.clickCard(context.pykeSentinel);
            expect(context.pykeSentinel.getPower()).toBe(1);
            expect(context.pykeSentinel.getHp()).toBe(2);

            // Reset for new test
            context.desperateCommando.moveTo('hand');
            context.moveToNextActionPhase();

            // Ensure "For Phase" only
            expect(context.pykeSentinel.getPower()).toBe(2);
            expect(context.pykeSentinel.getHp()).toBe(3);

            // Defeat a unit using the "When Defeated Ability"
            context.player2.passAction();
            context.player1.clickCard(context.desperateCommando);
            context.player2.clickCard(context.rivalsFall);
            context.player2.clickCard(context.desperateCommando);
            context.player1.clickCard(context.battleDroid);
            expect(context.battleDroid).toBeInZone('outsideTheGame');
        });
    });
});
