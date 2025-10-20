describe('Inspector\'s Shuttle', function () {
    integration(function (contextRef) {
        it('should name a card, reveal opponent\'s hand and gain Experience for each copy of the named card (different cards with same title)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['inspectors-shuttle']
                },
                player2: {
                    hand: ['wampa', 'millennium-falcon#bucket-of-bolts', 'millennium-falcon#piece-of-junk']
                }
            });

            const { context } = contextRef;

            const ibhFalcon = context.player2.findCardByName('millennium-falcon#bucket-of-bolts');
            const sorFalcon = context.player2.findCardByName('millennium-falcon#piece-of-junk');

            context.player1.clickCard(context.inspectorsShuttle);

            // Should offer a dropdown of all playable card titles
            expect(context.player1).toHaveExactDropdownListOptions(context.getPlayableCardTitles());
            context.player1.chooseListOption('Millennium Falcon');

            // A reveal prompt should display opponent's hand
            expect(context.player1).toHaveExactViewableDisplayPromptCards([context.wampa, ibhFalcon, sorFalcon]);
            context.player1.clickDone();

            // Should gain 2 Experience tokens (two Millennium Falcon copies in opponent's hand)
            expect(context.inspectorsShuttle).toHaveExactUpgradeNames(['experience', 'experience']);

            expect(context.player2).toBeActivePlayer();
        });

        it('should name a card, reveal opponent\'s hand and gain Experience for each copy of the named card (same cards)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['inspectors-shuttle']
                },
                player2: {
                    hand: ['wampa', 'battlefield-marine', 'battlefield-marine']
                }
            });

            const { context } = contextRef;

            const marines = context.player2.findCardsByName('battlefield-marine');

            context.player1.clickCard(context.inspectorsShuttle);

            // Should offer a dropdown of all playable card titles
            expect(context.player1).toHaveExactDropdownListOptions(context.getPlayableCardTitles());
            context.player1.chooseListOption('Battlefield Marine');

            // A reveal prompt should display opponent's hand
            expect(context.player1).toHaveExactViewableDisplayPromptCards([context.wampa, ...marines]);
            context.player1.clickDone();

            // Should gain 2 Experience tokens (two Battlefield Marine copies in opponent's hand)
            expect(context.inspectorsShuttle).toHaveExactUpgradeNames(['experience', 'experience']);

            expect(context.player2).toBeActivePlayer();
        });

        it('should skip the ability when opponent has no cards in hand', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['inspectors-shuttle']
                },
                player2: {
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.inspectorsShuttle);

            expect(context.player2).toBeActivePlayer();
            expect(context.inspectorsShuttle).toHaveExactUpgradeNames([]);
        });
    });
});
