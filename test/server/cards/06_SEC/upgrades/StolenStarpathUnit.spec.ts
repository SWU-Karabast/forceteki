describe('Stolen Starpath Unit', function () {
    integration(function (contextRef) {
        it('Stolen Starpath Unit\'s on attack ability should name a card, look at opponent\'s hand and create a spy token for each card which have the same name', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: [{ card: 'battlefield-marine', upgrades: ['stolen-starpath-unit'] }],
                },
                player2: {
                    hand: ['wampa', 'millennium-falcon#bucket-of-bolts', 'millennium-falcon#piece-of-junk'],
                    spaceArena: ['millennium-falcon#landos-pride']
                }
            });

            const { context } = contextRef;

            const ibhFalcon = context.player2.findCardByName('millennium-falcon#bucket-of-bolts');
            const sorFalcon = context.player2.findCardByName('millennium-falcon#piece-of-junk');

            context.player1.clickCard(context.battlefieldMarine);
            context.player1.clickCard(context.p2Base);

            expect(context.player1).toHaveExactDropdownListOptions(context.getPlayableCardTitles());
            context.player1.chooseListOption('Millennium Falcon');

            expect(context.player1).toHaveExactViewableDisplayPromptCards([context.wampa, ibhFalcon, sorFalcon]);
            context.player1.clickDone();

            expect(context.player2).toBeActivePlayer();
            const spies = context.player1.findCardsByName('spy');
            expect(spies.length).toBe(2);
            expect(spies).toAllBeInZone('groundArena');
            expect(spies.every((spy) => spy.exhausted)).toBeTrue();
        });

        it('Stolen Starpath Unit\'s on attack ability should be skipped as opponent have no card in hand', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: [{ card: 'battlefield-marine', upgrades: ['stolen-starpath-unit'] }],
                },
                player2: {
                    spaceArena: ['millennium-falcon#landos-pride']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.battlefieldMarine);
            context.player1.clickCard(context.p2Base);

            expect(context.player2).toBeActivePlayer();
            const spies = context.player1.findCardsByName('spy');
            expect(spies.length).toBe(0);
        });
    });
});
