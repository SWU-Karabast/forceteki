describe('Obi-Wan\'s Interceptor, Nothing Too Fancy', function() {
    integration(function(contextRef) {
        it('Obi-Wan\'s Interceptor\'s ability should give other friendly Republic units +0/+1', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['clone-trooper', 'battlefield-marine'],
                    spaceArena: ['obiwans-interceptor#nothing-too-fancy', 'republic-defense-carrier'],
                },
                player2: {
                    groundArena: ['compassionate-senator'],
                }
            });

            const { context } = contextRef;

            // Friendly Republic units get +0/+1
            expect(context.cloneTrooper.getPower()).toBe(2);
            expect(context.cloneTrooper.getHp()).toBe(3);
            expect(context.republicDefenseCarrier.getPower()).toBe(6);
            expect(context.republicDefenseCarrier.getHp()).toBe(8);

            // The Interceptor itself does not get the buff
            expect(context.obiwansInterceptor.getPower()).toBe(2);
            expect(context.obiwansInterceptor.getHp()).toBe(3);

            // Friendly non-Republic unit is unaffected
            expect(context.battlefieldMarine.getPower()).toBe(3);
            expect(context.battlefieldMarine.getHp()).toBe(3);

            // Enemy Republic unit is unaffected
            expect(context.compassionateSenator.getPower()).toBe(0);
            expect(context.compassionateSenator.getHp()).toBe(4);
        });
    });
});
