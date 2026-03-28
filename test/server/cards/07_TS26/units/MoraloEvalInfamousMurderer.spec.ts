describe('Moralo Eval, Infamous Murderer', function() {
    integration(function(contextRef) {
        describe('Moralo Eval\'s ability', function() {
            beforeEach(function() {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['moralo-eval#infamous-murderer', 'battlefield-marine', 'wrecker#boom'],
                    },
                    player2: {
                        hand: ['daring-raid'],
                        groundArena: ['wampa'],
                        hasInitiative: true,
                    }
                });
            });

            it('should deal 1 damage to a unit when our base is dealt combat damage', function () {
                const { context } = contextRef;
                context.player2.clickCard(context.wampa);
                context.player2.clickCard(context.p1Base);

                expect(context.player1).toBeAbleToSelectExactly([context.moraloEval, context.battlefieldMarine, context.wampa, context.wrecker]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickCard(context.wampa);

                expect(context.player1).toBeActivePlayer();
                expect(context.wampa.damage).toBe(1);
            });

            it('should deal 1 damage to a unit when our base is dealt combat damage (overwhelm)', function () {
                const { context } = contextRef;
                context.player2.clickCard(context.wampa);
                context.player2.clickCard(context.battlefieldMarine);

                expect(context.player1).toBeAbleToSelectExactly([context.moraloEval, context.wampa, context.wrecker]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickCard(context.wampa);

                expect(context.player1).toBeActivePlayer();
                expect(context.wampa.damage).toBe(4);
            });

            it('should not deal 1 damage to a unit when opponent base is dealt combat damage', function () {
                const { context } = contextRef;

                context.player2.passAction();

                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.p2Base);

                expect(context.player2).toBeActivePlayer();
            });

            it('should not deal 1 damage to a unit when opponent base is dealt combat damage (overwhelm)', function () {
                const { context } = contextRef;

                context.player2.passAction();

                context.player1.clickCard(context.wrecker);
                context.player1.clickCard(context.wampa);

                expect(context.player2).toBeActivePlayer();
            });

            it('should not deal 1 damage to a unit when our base is dealt ability damage', function () {
                const { context } = contextRef;

                context.player2.clickCard(context.daringRaid);
                context.player2.clickCard(context.p1Base);

                expect(context.player1).toBeActivePlayer();
                expect(context.p1Base.damage).toBe(2);
            });
        });
    });
});
