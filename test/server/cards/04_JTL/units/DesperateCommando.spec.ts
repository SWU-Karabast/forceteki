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

        it('Desperate Commando\'s ability should be resolved by the new controller when defeated by No Glory, Only Results', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['desperate-commando', 'battlefield-marine']
                },
                player2: {
                    hand: ['no-glory-only-results'],
                    groundArena: ['pyke-sentinel'],
                    hasInitiative: true
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.noGloryOnlyResults);
            context.player2.clickCard(context.desperateCommando);

            // player2 controlled Desperate Commando when it was defeated, so player2 resolves the ability
            expect(context.player2).toHavePassAbilityButton();
            expect(context.player2).toBeAbleToSelectExactly([context.battlefieldMarine, context.pykeSentinel]);
            context.player2.clickCard(context.battlefieldMarine);

            expect(context.battlefieldMarine.getPower()).toBe(2);
            expect(context.battlefieldMarine.getHp()).toBe(2);
            expect(context.pykeSentinel.getPower()).toBe(2);
            expect(context.desperateCommando).toBeInZone('discard', context.player1);
            expect(context.player1).toBeActivePlayer();
        });
    });
});
