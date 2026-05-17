describe('The Armorer, Secrecy is our Survival', function() {
    integration(function(contextRef) {
        it('The Armorer\'s ability should give a shield to each friendly unit with Shielded keyword', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['the-armorer#secrecy-is-our-survival'],
                    groundArena: ['droid-laser-turret', 'yoda#old-master']
                },
                player2: {
                    spaceArena: ['black-sun-patroller']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.theArmorer);
            context.player1.clickPrompt('Shielded');

            expect(context.player2).toBeActivePlayer();
            expect(context.droidLaserTurret).toHaveExactUpgradeNames(['shield']);
            expect(context.theArmorer).toHaveExactUpgradeNames(['shield', 'shield']);
            expect(context.blackSunPatroller).toHaveExactUpgradeNames([]);
            expect(context.yoda).toHaveExactUpgradeNames([]);
        });

        it('The Armorer\'s ability should give a shield to each friendly unit with Shielded keyword (keyword gained from other sources)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['the-armorer#secrecy-is-our-survival', 'admiral-yularen#fleet-coordinator'],
                    groundArena: ['kanan-jarrus#revealed-jedi'],
                    spaceArena: ['the-ghost#heart-of-the-family'],
                    leader: { card: 'sabine-wren#galvanized-revolutionary', deployed: true }
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.admiralYularen);
            context.player1.clickPrompt('Shielded');

            context.player2.passAction();

            context.player1.clickCard(context.theArmorer);
            context.player1.clickPrompt('Shielded');

            expect(context.player2).toBeActivePlayer();
            expect(context.kananJarrus).toHaveExactUpgradeNames(['shield']);
            expect(context.sabineWren).toHaveExactUpgradeNames(['shield']);
            expect(context.theGhost).toHaveExactUpgradeNames(['shield']);
            expect(context.theArmorer).toHaveExactUpgradeNames(['shield', 'shield']);
            expect(context.admiralYularen).toHaveExactUpgradeNames([]);
        });

        it('The Armorer\'s ability should not give a shield to friendly unit who lost Shielded keyword', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['the-armorer#secrecy-is-our-survival'],
                    groundArena: ['rukh#thrawns-assassin'],
                },
                player2: {
                    spaceArena: ['screeching-tie-fighter'],
                    hasInitiative: true,
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.screechingTieFighter);
            context.player2.clickCard(context.p1Base);
            context.player2.clickCard(context.rukh);

            context.player1.clickCard(context.theArmorer);
            context.player1.clickPrompt('Shielded');

            expect(context.player2).toBeActivePlayer();
            expect(context.theArmorer).toHaveExactUpgradeNames(['shield', 'shield']);
            expect(context.screechingTieFighter).toHaveExactUpgradeNames([]);
            expect(context.rukh).toHaveExactUpgradeNames([]);
        });
    });
});
