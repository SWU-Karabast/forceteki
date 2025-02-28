describe('Kylo\'s TIE Silencer, Ruthless Efficient', function () {
    integration(function (contextRef) {
        it('Kylo\'s TIE Silencer\'s can be played from the discard when it was discarded from hand or deck this phase', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['rogue-squadron-skirmisher'],
                    leader: 'kylo-ren#rash-and-deadly',
                    deck: ['kylos-tie-silencer#ruthlessly-efficient'],
                },
                player2: {
                    groundArena: ['kanan-jarrus#revealed-jedi'],
                    spaceArena: ['home-one#alliance-flagship'],
                    hand: ['spark-of-rebellion'],
                }
            });

            const { context } = contextRef;

            context.player1.passAction();

            // Player 2 attacks with Kanan Jarrus and discards Kylo's TIE Silencer
            context.player2.clickCard(context.kananJarrus);
            context.player2.clickCard(context.p1Base);
            context.player2.clickPrompt('Discard a card from the defending player\'s deck for each Spectre you control. Heal 1 damage for each aspect among the discarded cards.');
            context.player2.clickPrompt('Discard a card from the defending player\'s deck for each Spectre you control. Heal 1 damage for each aspect among the discarded cards.');
            expect(context.kylosTieSilencer).toBeInZone('discard', context.player1);
            expect(context.player1.currentActionTargets).toContain(context.kylosTieSilencer);

            // Player 1 plays Kylo's TIE Silencer from the discard
            {
                const readyResourcesBeforePlayingCard = context.player1.readyResourceCount;
                context.player1.clickCard(context.kylosTieSilencer);
                expect(context.player1.readyResourceCount).toBe(readyResourcesBeforePlayingCard - 2);
            }
            expect(context.kylosTieSilencer).toBeInZone('spaceArena', context.player1);

            // Player 2 kills Kylo's TIE Silencer and Player 1 cannot play it from the discard again
            context.player2.clickCard(context.homeOne);
            context.player2.clickCard(context.kylosTieSilencer);
            expect(context.kylosTieSilencer).toBeInZone('discard', context.player1);
            expect(context.player1.currentActionTargets).not.toContain(context.kylosTieSilencer);

            // Player 1 plays Rogue Squadron Skirmisher and returns Kylo's TIE Silencer to their hand
            context.player1.clickCard(context.rogueSquadronSkirmisher);
            context.player1.clickPrompt('Return a unit that costs 2 or less from your discard pile to your hand.');
            context.player1.clickCard(context.kylosTieSilencer);
            context.player1.passAction();
            expect(context.kylosTieSilencer).toBeInZone('hand', context.player1);

            // Player 2 discards Kylo's TIE Silencer from hand using Spark of Rebellion
            context.player2.clickCard(context.sparkOfRebellion);
            context.player2.clickCardInDisplayCardPrompt(context.kylosTieSilencer);
            expect(context.kylosTieSilencer).toBeInZone('discard', context.player1);

            // Player 1 plays Kylo's TIE Silencer from the discard
            {
                const readyResourcesBeforePlayingCard = context.player1.readyResourceCount;
                context.player1.clickCard(context.kylosTieSilencer);
                expect(context.player1.readyResourceCount).toBe(readyResourcesBeforePlayingCard - 2);
            }
            expect(context.kylosTieSilencer).toBeInZone('spaceArena', context.player1);
        });
    });
});
