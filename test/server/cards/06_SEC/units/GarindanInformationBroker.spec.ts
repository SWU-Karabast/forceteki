describe('Garindan, Information Broker', function () {
    integration(function (contextRef) {
        it('Garinda\'s ability should name a card, look at opponent\'s hand and discard a card with the name', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['garindan#information-broker'],
                },
                player2: {
                    hand: ['wampa', 'millennium-falcon#bucket-of-bolts', 'millennium-falcon#piece-of-junk'],
                    spaceArena: ['millennium-falcon#landos-pride']
                }
            });

            const { context } = contextRef;

            const ibhFalcon = context.player2.findCardByName('millennium-falcon#bucket-of-bolts');
            const sorFalcon = context.player2.findCardByName('millennium-falcon#piece-of-junk');

            context.player1.clickCard(context.garindan);

            expect(context.player1).toHaveExactDropdownListOptions(context.getPlayableCardTitles());
            context.player1.chooseListOption('Millennium Falcon');

            expect(context.player1).toHaveExactDisplayPromptCards({
                selectable: [ibhFalcon, sorFalcon],
                invalid: [context.wampa],
            });
            context.player1.clickCardInDisplayCardPrompt(sorFalcon);

            expect(sorFalcon).toBeInZone('discard');
            expect(ibhFalcon).toBeInZone('hand');

            expect(context.player2).toBeActivePlayer();
        });

        it('Garinda\'s ability should be skipped as opponent has no card in hand', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['garindan#information-broker'],
                },
                player2: {
                    spaceArena: ['millennium-falcon#landos-pride']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.garindan);
            expect(context.player2).toBeActivePlayer();
        });

        it('Garinda\'s ability should name a card, look at opponent\'s hand and discard a card with the name (using Plot)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: 'general-grievous#general-of-the-droid-armies',
                    resources: ['garindan#information-broker', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst'],
                },
                player2: {
                    hand: ['wampa', 'millennium-falcon#bucket-of-bolts', 'millennium-falcon#piece-of-junk'],
                    spaceArena: ['millennium-falcon#landos-pride']
                }
            });

            const { context } = contextRef;

            const ibhFalcon = context.player2.findCardByName('millennium-falcon#bucket-of-bolts');
            const sorFalcon = context.player2.findCardByName('millennium-falcon#piece-of-junk');

            context.player1.clickCard(context.generalGrievous);
            context.player1.clickPrompt('Deploy General Grievous');
            context.player1.clickPrompt('Trigger');

            expect(context.player1).toHaveExactDropdownListOptions(context.getPlayableCardTitles());
            context.player1.chooseListOption('Millennium Falcon');

            expect(context.player1).toHaveExactDisplayPromptCards({
                selectable: [ibhFalcon, sorFalcon],
                invalid: [context.wampa],
            });
            context.player1.clickCardInDisplayCardPrompt(sorFalcon);

            expect(sorFalcon).toBeInZone('discard');
            expect(ibhFalcon).toBeInZone('hand');

            expect(context.player2).toBeActivePlayer();
        });
    });
});
