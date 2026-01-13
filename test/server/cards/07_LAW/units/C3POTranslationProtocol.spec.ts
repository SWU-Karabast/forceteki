describe('C-3PO, Translation Protocol', function () {
    integration(function (contextRef) {
        it('C-3PO\'s ability should give an Experience token to another non-leader unit that shares a Trait with a friendly leader', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: 'leia-organa#alliance-general',
                    groundArena: ['c3po#translation-protocol', 'wampa', 'populist-advisor'],
                    spaceArena: ['green-squadron-awing']
                },
                player2: {
                    groundArena: ['battlefield-marine'],
                    leader: 'sabine-wren#galvanized-revolutionary'
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.c3po);
            context.player1.clickCard(context.p2Base);

            expect(context.player1).toBeAbleToSelectExactly([context.populistAdvisor, context.greenSquadronAwing, context.battlefieldMarine]);
            expect(context.player1).toHavePassAbilityButton();
            context.player1.clickCard(context.greenSquadronAwing);

            expect(context.player2).toBeActivePlayer();
            expect(context.greenSquadronAwing).toHaveExactUpgradeNames(['experience']);
        });
    });
});
