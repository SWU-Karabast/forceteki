describe('Luke Skywalker, Jedi Knight', function () {
    integration(function (contextRef) {
        describe('Luke Skywalker\'s ability', function () {
            it('should give -3/-3 to an enemy unit because no friendly was defeated this phase', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['luke-skywalker#jedi-knight', 'rivals-fall'],
                    },
                    player2: {
                        groundArena: ['battlefield-marine', 'wampa']
                    }
                });

                const { context } = contextRef;

                // defeat an opponent unit
                context.player1.clickCard(context.rivalsFall);
                context.player1.clickCard(context.battlefieldMarine);

                context.player2.passAction();

                context.player1.clickCard(context.lukeSkywalker);
                context.player1.clickCard(context.wampa);

                // no friendly unit was defeated, so Wampa should be -3/-3
                expect(context.player2).toBeActivePlayer();
                expect(context.wampa.getPower()).toBe(1);
                expect(context.wampa.getHp()).toBe(2);
            });

            it('should give -6/-6 to an enemy unit because a friendly unit was defeated this phase', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['luke-skywalker#jedi-knight'],
                        groundArena: ['isb-agent']
                    },
                    player2: {
                        groundArena: ['battlefield-marine', 'atat-suppressor'],
                        spaceArena: ['green-squadron-awing']
                    }
                });

                const { context } = contextRef;
                context.player1.passAction();

                // opponent defeats a friendly unit
                context.player2.clickCard(context.battlefieldMarine);
                context.player2.clickCard(context.isbAgent);

                // play Luke, should select all units
                context.player1.clickCard(context.lukeSkywalker);
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.greenSquadronAwing, context.atatSuppressor]);
                expect(context.player1).not.toHavePassAbilityButton();

                // give -6/-6 to AT-AT Suppressor
                context.player1.clickCard(context.atatSuppressor);
                expect(context.atatSuppressor.getPower()).toBe(2);
                expect(context.atatSuppressor.getHp()).toBe(2);

                // should be reset on next phase
                context.moveToNextActionPhase();
                expect(context.atatSuppressor.getPower()).toBe(8);
                expect(context.atatSuppressor.getHp()).toBe(8);
            });
        });
    });
});
