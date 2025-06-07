describe('Vanee, I Live to Serve', () => {
    integration(function (contextRef) {
        it('Vanee\'s when played ability may allow the player to defeat an Experience token on a friendly unit. If they do, give an Experience token to a friendly unit', async () => {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['vanee#i-live-to-serve'],
                    groundArena: [
                        { card: 'darth-vader#commanding-the-first-legion', upgrades: ['experience'] },
                        'atst'
                    ]
                },
                player2: {
                    spaceArena: [{ card: 'green-squadron-awing', upgrades: ['experience'] }]
                }
            });

            const { context } = contextRef;

            const vaderExperience = context.darthVader.upgrades[0];

            context.player1.clickCard(context.vanee);

            // green squadron awing experience can't be selected
            expect(context.player1).toBeAbleToSelectExactly([vaderExperience]);

            context.player1.clickCard(vaderExperience);
            context.player1.clickCard(context.atst);

            expect(context.atst).toHaveExactUpgradeNames(['experience']);
            expect(context.darthVader).toHaveExactUpgradeNames([]);
        });

        it('Vanee\'s on attack ability may allow the player to defeat an Experience token on a friendly unit. If they do, give an Experience token to a friendly unit', async () => {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: [
                        'vanee#i-live-to-serve',
                        { card: 'darth-vader#commanding-the-first-legion', upgrades: ['experience'] }
                    ]
                }
            });

            const { context } = contextRef;

            const vaderExperience = context.darthVader.upgrades[0];

            context.player1.clickCard(context.vanee);
            context.player1.clickCard(context.p2Base);

            // green squadron awing experience can't be selected
            expect(context.player1).toBeAbleToSelectExactly([vaderExperience]);

            context.player1.clickCard(vaderExperience);
            context.player1.clickCard(context.vanee);

            expect(context.vanee).toHaveExactUpgradeNames(['experience']);
            expect(context.darthVader).toHaveExactUpgradeNames([]);
        });
    });
});