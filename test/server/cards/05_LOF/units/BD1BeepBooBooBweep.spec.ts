describe('BD-1, Beep Boo Boo Bweep', function() {
    integration(function(contextRef) {
        it('BD-1\'s ability gives another friendly unit +1/+0 and Saboteur until he leaves play', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['bd1#beep-boo-boo-bweep'],
                    groundArena: ['battlefield-marine']
                },
                player2: {
                    hand: ['takedown'],
                    groundArena: ['echo-base-defender']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.bd1);
            expect(context.player1).toBeAbleToSelect(context.battlefieldMarine);
            context.player1.clickCard(context.battlefieldMarine);

            expect(context.battlefieldMarine.getPower()).toBe(4);
            expect(context.battlefieldMarine.getHp()).toBe(3);
            expect(context.bd1.getPower()).toBe(1);
            expect(context.bd1.getHp()).toBe(3);

            context.player2.passAction();

            context.player1.clickCard(context.battlefieldMarine);
            expect(context.player1).toBeAbleToSelectExactly([context.echoBaseDefender, context.p2Base]);
            context.player1.clickCard(context.p2Base);
            expect(context.p2Base.damage).toBe(4);

            context.moveToNextActionPhase();

            expect(context.battlefieldMarine.getPower()).toBe(4);
            expect(context.battlefieldMarine.getHp()).toBe(3);

            context.player1.passAction();

            // Defeat BD-1, effect goes away
            context.player2.clickCard(context.takedown);
            context.player2.clickCard(context.bd1);

            expect(context.battlefieldMarine.getPower()).toBe(3);
            expect(context.battlefieldMarine.getHp()).toBe(3);
        });
    });
});
