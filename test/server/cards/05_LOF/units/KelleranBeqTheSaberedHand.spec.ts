describe('Kelleran Beq, The Sabered Hand', function () {
    integration(function (contextRef) {
        it('Kelleran Beq\'s ability should search the top 7 of the deck for a unit and play it for 3 resources less', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hasForceToken: false,
                    hand: ['kelleran-beq#the-sabered-hand'],
                    deck: ['wampa', 'porg', 'yoda#old-master', 'obiwan-kenobi#following-fate', 'protector', 'the-force-is-with-me', 'force-throw', 'battlefield-marine'],
                    base: 'echo-base',
                    leader: 'luke-skywalker#faithful-friend'
                },
            });
            const { context } = contextRef;

            context.player1.clickCard(context.kelleranBeq);

            expect(context.player1).toHaveExactDisplayPromptCards({
                selectable: [context.wampa, context.porg, context.yoda, context.obiwanKenobi],
                invalid: [context.protector, context.theForceIsWithMe, context.forceThrow]
            });
            expect(context.player1).toHaveEnabledPromptButton('Take nothing');

            context.player1.clickCardInDisplayCardPrompt(context.obiwanKenobi);

            expect(context.player2).toBeActivePlayer();
            expect(context.obiwanKenobi).toBeInZone('groundArena', context.player1);
            expect(context.player1.exhaustedResourceCount).toBe(10);// 7+(6-3)
            expect([context.wampa, context.porg, context.yoda, context.protector, context.theForceIsWithMe, context.forceThrow]).toAllBeInBottomOfDeck(context.player1, 6);
        });

        it('Kelleran Beq\'s ability should search the top 7 of the deck for a unit and play it for 3 resources less (no prompt for pilote)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hasForceToken: false,
                    hand: ['kelleran-beq#the-sabered-hand'],
                    spaceArena: ['green-squadron-awing'],
                    deck: ['hopeful-volunteer', 'porg', 'yoda#old-master', 'obiwan-kenobi#following-fate', 'protector', 'the-force-is-with-me', 'force-throw', 'battlefield-marine'],
                    base: 'echo-base',
                    leader: 'luke-skywalker#faithful-friend'
                },
            });
            const { context } = contextRef;

            context.player1.clickCard(context.kelleranBeq);

            expect(context.player1).toHaveExactDisplayPromptCards({
                selectable: [context.hopefulVolunteer, context.porg, context.yoda, context.obiwanKenobi],
                invalid: [context.protector, context.theForceIsWithMe, context.forceThrow]
            });
            expect(context.player1).toHaveEnabledPromptButton('Take nothing');

            context.player1.clickCardInDisplayCardPrompt(context.hopefulVolunteer);

            expect(context.player2).toBeActivePlayer();
            expect(context.hopefulVolunteer).toBeInZone('groundArena', context.player1);
            expect(context.player1.exhaustedResourceCount).toBe(7);// 7+(2-3)
            expect([context.obiwanKenobi, context.porg, context.yoda, context.protector, context.theForceIsWithMe, context.forceThrow]).toAllBeInBottomOfDeck(context.player1, 6);
        });
    });
});