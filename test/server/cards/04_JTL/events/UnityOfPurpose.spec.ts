describe('Unity of Purpose', function () {
    integration(function (contextRef) {
        it('Unity of Purpose\'s ability should give +1/+1 to each friendly unit for every different friendly unit name', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['unity-of-purpose', 'wampa'],
                    groundArena: ['battlefield-marine'],
                    spaceArena: ['millennium-falcon#get-out-and-push', 'millennium-falcon#landos-pride'],
                },
                player2: {
                    groundArena: ['atst']
                }
            });

            const { context } = contextRef;


            const set2Falcon = context.player1.findCardByName('millennium-falcon#landos-pride');
            const set4Falcon = context.player1.findCardByName('millennium-falcon#get-out-and-push');

            context.player1.clickCard(context.unityOfPurpose);

            expect(context.player2).toBeActivePlayer();

            expect(context.battlefieldMarine.getPower()).toBe(5);
            expect(context.battlefieldMarine.getHp()).toBe(5);

            expect(set2Falcon.getPower()).toBe(7);
            expect(set2Falcon.getHp()).toBe(7);

            expect(set4Falcon.getPower()).toBe(5);
            expect(set4Falcon.getHp()).toBe(6);

            expect(context.atst.getPower()).toBe(6);
            expect(context.atst.getHp()).toBe(7);

            context.player2.passAction();
            context.player1.clickCard(context.wampa);

            expect(context.wampa.getPower()).toBe(4);
            expect(context.wampa.getHp()).toBe(5);

            context.moveToNextActionPhase();

            expect(context.battlefieldMarine.getPower()).toBe(3);
            expect(context.battlefieldMarine.getHp()).toBe(3);

            expect(context.wampa.getPower()).toBe(4);
            expect(context.wampa.getHp()).toBe(5);

            expect(set2Falcon.getPower()).toBe(5);
            expect(set2Falcon.getHp()).toBe(5);

            expect(set4Falcon.getPower()).toBe(3);
            expect(set4Falcon.getHp()).toBe(4);

            expect(context.atst.getPower()).toBe(6);
            expect(context.atst.getHp()).toBe(7);
        });
    });
});
