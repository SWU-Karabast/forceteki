describe('Senator Chuchi, Voice for the Voiceless', function () {
    integration(function (contextRef) {
        it('Senator Chuchi\'s on attack ability should give another friendly Official unit Restore 2', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['senator-chuchi#voice-for-the-voiceless', 'wartime-trade-official', 'general-dodonna#massassi-group-commander', 'wampa'],
                    base: { card: 'dagobah-swamp', damage: 6 }
                },
                player2: {
                    groundArena: ['vanee#i-live-to-serve']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.senatorChuchi);
            context.player1.clickCard(context.p2Base);
            context.player1.clickPrompt('Restore 1');

            expect(context.player1).toBeAbleToSelectExactly([context.wartimeTradeOfficial, context.generalDodonna]);
            context.player1.clickCard(context.wartimeTradeOfficial);

            context.player2.passAction();

            context.player1.clickCard(context.wartimeTradeOfficial);
            context.player1.clickCard(context.p2Base);
            expect(context.p1Base.damage).toBe(3);

            context.player2.passAction();

            context.player1.clickCard(context.generalDodonna);
            context.player1.clickCard(context.p2Base);
            expect(context.p1Base.damage).toBe(3);
        });

        it('Senator Chuchi\'s on attack ability should give another friendly Official unit Restore 2 for this phase', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['senator-chuchi#voice-for-the-voiceless', 'general-dodonna#massassi-group-commander'],
                    base: { card: 'dagobah-swamp', damage: 6 }
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.senatorChuchi);
            context.player1.clickCard(context.p2Base);

            context.player1.clickPrompt('Restore 1');
            context.player1.clickCard(context.generalDodonna);

            context.moveToNextActionPhase();

            context.player1.clickCard(context.generalDodonna);
            context.player1.clickCard(context.p2Base);
            expect(context.p1Base.damage).toBe(5);
        });
    });
});
