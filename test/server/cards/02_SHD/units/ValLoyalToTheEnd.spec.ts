describe('Val, Loyal To The End', function() {
    integration(function(contextRef) {
        describe('Val, Loyal To The End\'s Bounty ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['val#loyal-to-the-end', 'battlefield-marine'],
                        spaceArena: ['green-squadron-awing']
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });
            });

            it('should give 2 experience tokens and deal 3 damage', function () {
                const { context } = contextRef;

                // val kill herself to wampa
                context.player1.clickCard(context.val);
                context.player1.clickCard(context.wampa);

                // 2 triggers to resolve
                expect(context.player1).toHaveExactPromptButtons(['You', 'Opponent']);
                context.player1.clickPrompt('You');

                // give 2 experiences to battlefield marine
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.greenSquadronAwing]);
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.battlefieldMarine).toHaveExactUpgradeNames(['experience', 'experience']);

                // player 2 should be able to deal 3 damage to a unit
                expect(context.player2).toBeAbleToSelectExactly([context.battlefieldMarine, context.greenSquadronAwing, context.wampa]);
                expect(context.player2).toHavePassAbilityButton();

                // deal 3 damages to battlefield marine
                context.player2.clickCard(context.battlefieldMarine);
                expect(context.battlefieldMarine.damage).toBe(3);
                expect(context.player2).toBeActivePlayer();
            });

            it(', opponent is current player, he should choose which triggers to activate first', function () {
                const { context } = contextRef;

                context.player1.passAction();

                // wampa kill val
                context.player2.clickCard(context.wampa);
                context.player2.clickCard(context.val);

                expect(context.player2).toHaveExactPromptButtons(['You', 'Opponent']);
                context.player2.clickPrompt('You');

                // deal 3 damages to a unit
                expect(context.player2).toBeAbleToSelectExactly([context.battlefieldMarine, context.greenSquadronAwing, context.wampa]);
                expect(context.player2).toHavePassAbilityButton();

                // kill battlefield marine
                context.player2.clickCard(context.battlefieldMarine);
                expect(context.battlefieldMarine.location).toBe('discard');

                // green squadron awing is automatically choose
                expect(context.greenSquadronAwing).toHaveExactUpgradeNames(['experience', 'experience']);
                expect(context.player1).toBeActivePlayer();
            });
        });
    });
});
