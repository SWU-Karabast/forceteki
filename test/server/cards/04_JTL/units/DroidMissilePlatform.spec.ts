describe('Droid Missile Platform', function () {
    integration(function (contextRef) {
        it('Droid Missile Platform\'s ability should deal 3 indirect damage when defeated', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['rivals-fall'],
                    groundArena: ['battlefield-marine']
                },
                player2: {
                    spaceArena: ['droid-missile-platform']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.rivalsFall);
            context.player1.clickCard(context.droidMissilePlatform);

            context.player2.clickPrompt('Deal indirect damage to opponent');

            context.player1.setDistributeIndirectDamagePromptState(new Map([
                [context.p1Base, 3],
            ]));

            expect(context.player2).toBeActivePlayer();
            expect(context.p1Base.damage).toBe(3);
        });

        it('Droid Missile Platform\'s ability should deal 3 indirect damage when defeated after changing controller', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['no-glory-only-results'],
                    groundArena: ['battlefield-marine']
                },
                player2: {
                    spaceArena: ['droid-missile-platform']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.noGloryOnlyResults);
            context.player1.clickCard(context.droidMissilePlatform);
            context.player1.clickPrompt('Deal indirect damage to opponent');

            expect(context.player2).toBeActivePlayer();
            expect(context.p2Base.damage).toBe(3);
        });
    });
});
