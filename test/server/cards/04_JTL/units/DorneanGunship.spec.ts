describe('Dornean Gunship', function () {
    integration(function (contextRef) {
        it('Dornean Gunship\'s when played ability should deal indirect damage equal to the number of Vehicle unit we control', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['dornean-gunship'],
                    groundArena: ['battlefield-marine', 'escort-skiff'],
                    spaceArena: ['avenger#hunting-star-destroyer']
                },
                player2: {
                    groundArena: ['atst']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.dorneanGunship);
            context.player1.clickPrompt('Deal indirect damage to opponent');

            context.player2.setDistributeIndirectDamagePromptState(new Map([
                // avenger + escort skiff + dornean gunship
                [context.p2Base, 3],
            ]));

            expect(context.player2).toBeActivePlayer();
            expect(context.p2Base.damage).toBe(3);
        });
    });
});
