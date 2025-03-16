describe('Shielded keyword', function() {
    integration(function(contextRef) {
        describe('When a unit with the Shielded keyword', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['crafty-smuggler']
                    },
                    player2: {
                        hand: ['waylay']
                    },

                    // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                    autoSingleTarget: true
                });
            });

            it('enters play, it receives a shield', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.craftySmuggler);
                expect(context.craftySmuggler).toHaveExactUpgradeNames(['shield']);
                expect(context.player2).toBeActivePlayer();
            });

            it('enters play, is removed from play and enters play again it should receive only 1 shield', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.craftySmuggler);
                context.player2.clickCard(context.waylay);
                context.player1.clickCard(context.craftySmuggler);

                expect(context.craftySmuggler).toHaveExactUpgradeNames(['shield']);
                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('When a leader with the Shielded keyword', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'iden-versio#inferno-squad-commander'
                    }
                });
            });

            it('is deployed, it receives a shield', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.idenVersio);
                context.player1.clickPrompt('Deploy Iden Versio');
                expect(context.idenVersio).toHaveExactUpgradeNames(['shield']);
                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('When a unit with Shielded is captured', function() {
            it('it should not regain its shield when it returns to play', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['wampa', 'wampa'],
                        hand: ['sanctioners-shuttle']
                    },
                    player2: {
                        spaceArena: [{ card: 'seventh-fleet-defender', upgrades: ['shield'] }],
                        hand: ['vanquish']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.sanctionersShuttle);
                context.player1.clickCard(context.seventhFleetDefender);
                expect(context.seventhFleetDefender).toBeCapturedBy(context.sanctionersShuttle);
                context.player2.clickCard(context.vanquish);
                context.player2.clickCard(context.sanctionersShuttle);
                expect(context.seventhFleetDefender).toBeInZone('spaceArena');
                expect(context.seventhFleetDefender).not.toHaveExactUpgradeNames(['shield']);
            });
        });
    });
});
