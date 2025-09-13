describe('Naboo Royal Starship, Fit For A Queen', function () {
    integration(function (contextRef) {
        it('Naboo Royal Starship\'s ability should grant Raid 2 and Overwhelm to friendly leader units ', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: { card: 'han-solo#worth-the-risk', deployed: true },
                    spaceArena: ['naboo-royal-starship#fit-for-a-queen']
                },
                player2: {
                    groundArena: ['battlefield-marine'],
                    leader: { card: 'sabine-wren#galvanized-revolutionary', deployed: true }
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.hanSolo);
            context.player1.clickCard(context.battlefieldMarine);

            // han2 should have raid 2 and overwhelm
            expect(context.p2Base.damage).toBe(2);

            context.player2.clickCard(context.sabineWren);
            context.player2.clickCard(context.p1Base);

            expect(context.p1Base.damage).toBe(3);
        });

        it('can be played using Plot and still grants Raid 2 and Overwhelm to friendly leader units', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: 'han-solo#worth-the-risk',
                    resources: ['naboo-royal-starship#fit-for-a-queen', 'wampa', 'wampa', 'wampa', 'wampa'],
                    deck: ['pyke-sentinel'],
                    base: 'echo-base'
                },
                player2: {
                    groundArena: ['battlefield-marine']
                }
            });
            const { context } = contextRef;

            // Deploy leader to open Plot window
            context.player1.clickCard(context.hanSolo);
            context.player1.clickPrompt('Deploy Han Solo');

            // Expect Plot prompt for the Starship
            expect(context.player1).toHavePassAbilityPrompt('Play Naboo Royal Starship using Plot');
            context.player1.clickPrompt('Trigger');

            // Starship should be in space and replacement card should go to resources
            expect(context.nabooRoyalStarshipFitForAQueen).toBeInZone('spaceArena');
            expect(context.pykeSentinel).toBeInZone('resource');

            context.player2.passAction();

            // Now Han should have Raid 2 and Overwhelm; attack a unit and verify spillover
            context.player1.clickCard(context.hanSolo);
            context.player1.clickCard(context.battlefieldMarine);
            expect(context.p2Base.damage).toBe(2);
        });
    });
});
