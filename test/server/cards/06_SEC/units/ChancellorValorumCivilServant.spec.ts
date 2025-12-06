describe('Chancellor Valorum, Civil Servant', function() {
    integration(function(contextRef) {
        it('Chancellor Valorum\'s ability should discloses Command, Command, Command to puts the top card of your deck into play as a resource', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['salvage', 'command'],
                    groundArena: ['chancellor-valorum#civil-servant'],
                    deck: ['battlefield-marine', 'wampa', 'cartel-spacer'],
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.chancellorValorum);
            context.player1.clickCard(context.p2Base);

            // We should be able to select the Command and the double-Command cards
            expect(context.player1).toBeAbleToSelectExactly([context.salvage, context.command]);
            expect(context.player1).toHaveChooseNothingButton();

            // Choose which cards to disclose (Command+Command from 'command' and one Command from 'salvage')
            context.player1.clickCard(context.command);
            context.player1.clickCard(context.salvage);
            context.player1.clickDone();

            // Opponent sees the revealed cards
            expect(context.player2).toHaveExactViewableDisplayPromptCards([context.command, context.salvage]);
            context.player2.clickDone();

            // Top of deck should be placed as a resource
            expect(context.battlefieldMarine).toBeInZone('resource');
            expect(context.player2).toBeActivePlayer();
        });

        it('Chancellor Valorum\'s ability should not trigger if he dies on attack', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['salvage', 'command'],
                    groundArena: ['chancellor-valorum#civil-servant'],
                    deck: ['battlefield-marine', 'wampa', 'cartel-spacer'],
                },
                player2: {
                    groundArena: ['cad-bane#hostage-taker']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.chancellorValorum);
            context.player1.clickCard(context.cadBane);

            // valorum die on his attack, no trigger
            expect(context.player2).toBeActivePlayer();
        });
    });
});