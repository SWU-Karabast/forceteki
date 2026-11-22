describe('Pack Guardian', function () {
    integration(function (contextRef) {
        it('Pack Guardian\'s ability should not give it Sentinel when exhausted', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['pack-guardian'],
                    groundArena: [{ card: 'yoda#old-master', exhausted: true }]
                },
                player2: {
                    groundArena: ['battlefield-marine']
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.packGuardian);
            expect(context.packGuardian.hasSomeKeyword('sentinel')).toBeFalse();

            context.player2.clickCard(context.battlefieldMarine);
            expect(context.player2).toBeAbleToSelectExactly([context.packGuardian, context.yoda, context.p1Base]);
            context.player2.clickCard(context.p1Base);

            expect(context.player1).toBeActivePlayer();
        });

        it('Pack Guardian\'s ability should give it Sentinel when ready', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: [{ card: 'yoda#old-master', exhausted: true }, 'pack-guardian']
                },
                player2: {
                    groundArena: ['battlefield-marine'],
                    hasInitiative: true
                }
            });
            const { context } = contextRef;

            expect(context.packGuardian.hasSomeKeyword('sentinel')).toBeTrue();

            context.player2.clickCard(context.battlefieldMarine);
            expect(context.player2).toBeAbleToSelectExactly([context.packGuardian]);
            context.player2.clickCard(context.packGuardian);

            expect(context.player1).toBeActivePlayer();
        });
    });
});