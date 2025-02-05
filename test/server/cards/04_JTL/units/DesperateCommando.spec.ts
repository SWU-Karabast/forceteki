describe('Desperate Commando', function () {
    integration(function (contextRef) {
        it('Desperate Commando\'s ability should give a unit -1/-1 on defeat', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    groundArena: ['desperate-commando', 'battlefield-marine'],
                    spaceArena: ['tie-advanced']
                },
                player2: {
                    hand: ['takedown'],
                    groundArena: ['battle-droid', 'pyke-sentinel', 'admiral-motti#brazen-and-scornful'],
                    spaceArena: ['cartel-spacer'],
                    hasInitiative: true
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.takedown);
            context.player2.clickCard(context.desperateCommando);
            expect(context.player1).toHavePassAbilityButton();
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.battleDroid, context.pykeSentinel, context.admiralMotti, context.cartelSpacer, context.tieAdvanced]);
            context.player1.clickCard(context.pykeSentinel);
            expect(context.pykeSentinel.getPower()).toBe(1);
            expect(context.pykeSentinel.getHp()).toBe(2);
            context.moveToNextActionPhase();
            expect(context.pykeSentinel.getPower()).toBe(2);
            expect(context.pykeSentinel.getHp()).toBe(3);
        });
    });
});
