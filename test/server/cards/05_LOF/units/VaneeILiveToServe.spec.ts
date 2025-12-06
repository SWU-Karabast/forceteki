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

            expect(context.player1).toBeAbleToSelectExactly([context.darthVader, context.atst, context.vanee]);
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

            expect(context.player1).toBeAbleToSelectExactly([context.darthVader, context.vanee]);
            context.player1.clickCard(context.vanee);

            expect(context.vanee).toHaveExactUpgradeNames(['experience']);
            expect(context.darthVader).toHaveExactUpgradeNames([]);
        });

        it('Vanee\'s on attack ability can defeat an enemy Experience token on a friendly unit', async () => {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: [
                        'vanee#i-live-to-serve',
                        'darth-vader#commanding-the-first-legion',
                    ]
                },
                player2: {
                    hand: ['clan-wren-rescuer'],
                    hasInitiative: true,
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.clanWrenRescuer);
            context.player2.clickCard(context.darthVader);
            expect(context.darthVader).toHaveExactUpgradeNames(['experience']);

            const vaderExperience = context.darthVader.upgrades[0];

            context.player1.clickCard(context.vanee);
            context.player1.clickCard(context.p2Base);
            expect(context.player1).toBeAbleToSelectExactly([vaderExperience]);

            context.player1.clickCard(vaderExperience);
            expect(context.player1).toBeAbleToSelectExactly([context.darthVader, context.vanee]);

            context.player1.clickCard(context.vanee);
            expect(context.vanee).toHaveExactUpgradeNames(['experience']);
            expect(context.darthVader).toHaveExactUpgradeNames([]);
        });

        it('Vanee\'s on attack ability cannot defeat a friendly Experience token on an enemy unit', async () => {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['clan-wren-rescuer'],
                    groundArena: [
                        'vanee#i-live-to-serve',
                    ]
                },
                player2: {
                    groundArena: [
                        'darth-vader#commanding-the-first-legion',
                    ],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.clanWrenRescuer);
            context.player1.clickCard(context.darthVader);
            expect(context.darthVader).toHaveExactUpgradeNames(['experience']);

            context.player2.passAction();

            context.player1.clickCard(context.vanee);
            context.player1.clickCard(context.p2Base);

            expect(context.vanee).toHaveExactUpgradeNames([]);
            expect(context.darthVader).toHaveExactUpgradeNames(['experience']);
            expect(context.player2).toBeActivePlayer();
        });
    });
});