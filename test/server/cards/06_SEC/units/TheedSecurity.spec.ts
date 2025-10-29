describe('Theed Security', function() {
    integration(function(contextRef) {
        it('should give an Experience token to a chosen unit if the opponent controls an upgrade', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['theed-security'],
                    groundArena: ['battlefield-marine'],
                    spaceArena: ['cartel-spacer'],
                },
                player2: {
                    groundArena: [{ card: 'wampa', upgrades: ['academy-training'] }],
                    spaceArena: ['tieln-fighter'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.theedSecurity);

            // Should be able to select any unit (friendly or enemy, in any arena, including leaders)
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.cartelSpacer, context.theedSecurity, context.wampa, context.tielnFighter]);

            // Choose a friendly unit and give it an Experience token
            context.player1.clickCard(context.battlefieldMarine);

            expect(context.battlefieldMarine).toHaveExactUpgradeNames(['experience']);
            expect(context.wampa.upgrades).toContain(context.academyTraining); // pre-existing opponent upgrade remains

            expect(context.player2).toBeActivePlayer();
        });

        it('should do nothing if the opponent controls no upgrades', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['theed-security'],
                    groundArena: ['battlefield-marine']
                },
                player2: {
                    groundArena: ['wampa']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.theedSecurity);

            // Since the condition is false, no Experience should be granted and priority should pass
            expect(context.theedSecurity.isUpgraded()).toBeFalse();
            expect(context.battlefieldMarine.isUpgraded()).toBeFalse();
            expect(context.wampa.isUpgraded()).toBeFalse();
            expect(context.player2).toBeActivePlayer();
        });

        it('should give an Experience token to a chosen unit if the opponent controls an upgrade on a friendly unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['theed-security'],
                    groundArena: ['battlefield-marine']
                },
                player2: {
                    hasInitiative: true,
                    groundArena: ['wampa'],
                    hand: ['public-enemy']
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.publicEnemy);
            context.player2.clickCard(context.battlefieldMarine);

            context.player1.clickCard(context.theedSecurity);

            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.wampa, context.theedSecurity]);
            context.player1.clickCard(context.battlefieldMarine);

            expect(context.battlefieldMarine).toHaveExactUpgradeNames(['public-enemy', 'experience']);
            expect(context.player2).toBeActivePlayer();
        });

        it('should give an Experience token to a chosen unit if the opponent controls a leader Pilot upgrade', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['theed-security'],
                    groundArena: ['battlefield-marine']
                },
                player2: {
                    hasInitiative: true,
                    spaceArena: ['awing'],
                    leader: 'major-vonreg#red-baron'
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.majorVonreg);
            context.player2.clickPrompt('Deploy Major Vonreg as a Pilot');
            context.player2.clickCard(context.awing);

            context.player1.clickCard(context.theedSecurity);

            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.awing, context.theedSecurity]);
            context.player1.clickCard(context.battlefieldMarine);

            expect(context.battlefieldMarine).toHaveExactUpgradeNames(['experience']);
            expect(context.player2).toBeActivePlayer();
        });

        it('should give an Experience token to a chosen unit if the opponent controls a stolen upgrade', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['theed-security'],
                    groundArena: [{ card: 'battlefield-marine', upgrades: ['shield'] }]
                },
                player2: {
                    hasInitiative: true,
                    spaceArena: ['awing'],
                    hand: ['evidence-of-the-crime']
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.evidenceOfTheCrime);
            const shield = context.player1.findCardByName('shield');
            context.player2.clickCard(shield);
            context.player2.clickCard(context.awing);

            context.player1.clickCard(context.theedSecurity);

            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.awing, context.theedSecurity]);
            context.player1.clickCard(context.battlefieldMarine);

            expect(context.battlefieldMarine).toHaveExactUpgradeNames(['experience']);
            expect(context.player2).toBeActivePlayer();
        });
    });
});
