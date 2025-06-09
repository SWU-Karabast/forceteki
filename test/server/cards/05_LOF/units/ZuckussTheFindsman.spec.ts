describe('Zuckuss, The Findsman', function() {
    integration(function(contextRef) {
        it('Zuckuss\'s ability should name a card, discard the top card of defender\'s deck, the card is the named card, zuckuss gets +4/+0 for this attack', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['zuckuss#the-findsman'],
                },
                player2: {
                    deck: ['fetts-firespray#feared-silhouette']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.zuckuss);
            context.player1.clickCard(context.p2Base);

            expect(context.player1).toHaveExactDropdownListOptions(context.getPlayableCardTitles());
            context.player1.chooseListOption('Fett\'s Firespray');

            expect(context.p2Base.damage).toBe(8);
            expect(context.fettsFirespray).toBeInZone('discard', context.player2);
            expect(context.player2).toBeActivePlayer();
        });

        it('Zuckuss\'s ability should name a card, discard the top card of defender\'s deck, the card is not the named card, zuckuss does not get +4/+0 for this attack', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['zuckuss#the-findsman'],
                },
                player2: {
                    deck: ['atst', 'fetts-firespray#feared-silhouette']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.zuckuss);
            context.player1.clickCard(context.p2Base);

            expect(context.player1).toHaveExactDropdownListOptions(context.getPlayableCardTitles());
            context.player1.chooseListOption('Fett\'s Firespray');

            expect(context.p2Base.damage).toBe(4);
            expect(context.atst).toBeInZone('discard', context.player2);
            expect(context.player2).toBeActivePlayer();
        });

        it('Zuckuss\'s multiple ability should kill defender before naming a card, his ability should name a card, discard the top card of defender\'s deck, get +4/+0 for this attack and use it with Overwhelm', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: [{ card: 'zuckuss#the-findsman', upgrades: ['jedi-lightsaber', 'grievouss-wheel-bike'] }],
                },
                player2: {
                    groundArena: ['jedha-agitator'],
                    deck: ['fetts-firespray#feared-silhouette']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.zuckuss);
            context.player1.clickCard(context.jedhaAgitator);

            context.player1.clickPrompt('Give the defender -2/-2 for this phase');

            expect(context.player1).toHaveExactDropdownListOptions(context.getPlayableCardTitles());
            context.player1.chooseListOption('Fett\'s Firespray');

            expect(context.fettsFirespray).toBeInZone('discard', context.player2);
            expect(context.player2).toBeActivePlayer();
            expect(context.p2Base.damage).toBe(14);
        });

        it('Zuckuss\'s ability should name a card (skipped because of empty deck), not discard the top card of defender\'s deck because he is empty', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['zuckuss#the-findsman'],
                },
                player2: {
                    deck: []
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.zuckuss);
            context.player1.clickCard(context.p2Base);

            expect(context.player2).toBeActivePlayer();
            expect(context.p2Base.damage).toBe(4);
        });
    });
});