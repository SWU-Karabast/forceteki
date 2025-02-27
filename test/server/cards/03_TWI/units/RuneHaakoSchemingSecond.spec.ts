describe('Rune Haako, Scheming Second', function () {
    integration(function (contextRef) {
        describe('Rune Haako\'s ability', function () {
            it('should not give -1/-1 because no friendly was defeated this phase', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['rune-haako#scheming-second', 'rivals-fall'],
                    },
                    player2: {
                        groundArena: ['battlefield-marine', 'wampa']
                    }
                });

                const { context } = contextRef;

                // defeat an opponent unit
                context.player1.clickCard(context.rivalsFall);
                context.player1.clickCard(context.wampa);

                context.player2.passAction();

                context.player1.clickCard(context.runeHaako);

                // no friendly unit was defeated, notihng happen
                expect(context.player2).toBeActivePlayer();
                expect(context.battlefieldMarine.getPower()).toBe(3);
                expect(context.battlefieldMarine.getHp()).toBe(3);
            });

            it('should give -1/-1 to a unit because a friendly unit was defeated this phase', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['rune-haako#scheming-second'],
                        groundArena: ['isb-agent']
                    },
                    player2: {
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['green-squadron-awing']
                    }
                });

                const { context } = contextRef;
                context.player1.passAction();

                // opponent defeats a friendly unit
                context.player2.clickCard(context.battlefieldMarine);
                context.player2.clickCard(context.isbAgent);

                // play rune haako, should select all units
                context.player1.clickCard(context.runeHaako);
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.greenSquadronAwing, context.runeHaako]);
                expect(context.player1).toHavePassAbilityButton();

                // give -1/-1 to green squadron a-wing
                context.player1.clickCard(context.greenSquadronAwing);
                expect(context.greenSquadronAwing.getPower()).toBe(0);
                expect(context.greenSquadronAwing.getHp()).toBe(2);

                // should be reset on next phase
                context.moveToNextActionPhase();
                expect(context.greenSquadronAwing.getPower()).toBe(1);
                expect(context.greenSquadronAwing.getHp()).toBe(3);
            });
        });
    });
});
