describe('BoShek, Charismatic Smuggler', function () {
    integration(function (contextRef) {
        it('Bunker Defender\'s ability should discard 2 cards of deck and return each of them which have an odd cost', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['boshek#charismatic-smuggler'],
                    spaceArena: ['strafing-gunship'],
                    deck: ['battlefield-marine', 'red-three#unstoppable', 'atst']
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.boshek);
            context.player1.clickPrompt('Play BoShek with Piloting');
            context.player1.clickCard(context.strafingGunship);

            expect(context.player2).toBeActivePlayer();

            expect(context.redThree).toBeInZone('hand');
            expect(context.battlefieldMarine).toBeInZone('discard');

            expect(context.atst).toBeInZone('deck');
        });
    });
});
