describe('Darth Sion, Lord of Pain', function () {
    integration(function(contextRef) {
        describe('Darth Sion\'s when played ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['vigilance', 'darth-sion#lord-of-pain', 'superlaser-blast'],
                        groundArena: ['battlefield-marine', 'wilderness-fighter', 'seasoned-shoretrooper'],
                    },
                    player2: {
                        groundArena: ['wampa', 'atst'],
                    },
                });
            });

            it('should give Darth Sion no experience tokens if no enemy unit was defeated this phase', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.darthSionLordOfPain);
                expect(context.darthSionLordOfPain).toHaveExactUpgradeNames([]);
            });

            it('should give Darth Sion an experience token for each enemy unit defeated this phase', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.superlaserBlast);
                context.player2.passAction();
                context.player1.clickCard(context.darthSionLordOfPain);
                expect(context.darthSionLordOfPain).toHaveExactUpgradeNames(['experience', 'experience']);
            });
        });

        describe('Darth Sion\'s when defeated ability', function () {
            it('should not return Darth Sion to hand if defeated with less than 7 power', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['darth-sion#lord-of-pain', 'wilderness-fighter', 'seasoned-shoretrooper'],
                    },
                    player2: {
                        hand: ['vanquish'],
                        groundArena: ['wampa', 'atst'],
                    },
                });
                const { context } = contextRef;

                context.player1.passAction();
                context.player2.clickCard(context.vanquish);
                context.player2.clickCard(context.darthSionLordOfPain);
                expect(context.darthSionLordOfPain.zoneName).toBe('discard');
            });

            it('should return Darth Sion to hand if defeated with 7 or more power', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'darth-sion#lord-of-pain', upgrades: ['experience', 'experience'] }, 'wilderness-fighter', 'seasoned-shoretrooper'],
                    },
                    player2: {
                        hand: ['vanquish'],
                        groundArena: ['wampa', 'atst'],
                    },
                });
                const { context } = contextRef;

                context.player1.passAction();
                context.player2.clickCard(context.vanquish);
                context.player2.clickCard(context.darthSionLordOfPain);
                expect(context.darthSionLordOfPain.zoneName).toBe('hand');
            });
        });
    });
});