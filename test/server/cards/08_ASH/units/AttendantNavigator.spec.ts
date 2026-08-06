describe('Attendant Navigator', function() {
    integration(function(contextRef) {
        it('Attendant Navigator\'s ability should give 2 Advantage tokens to a friendly space unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['attendant-navigator'],
                    spaceArena: ['phoenix-squadron-awing'],
                    groundArena: ['battlefield-marine']
                },
                player2: {
                    groundArena: ['rebel-pathfinder'],
                    spaceArena: ['lurking-tie-phantom']

                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.attendantNavigator);

            expect(context.player1).toBeAbleToSelectExactly([context.lurkingTiePhantom, context.phoenixSquadronAwing]);
            expect(context.player1).toHavePrompt('Give 2 Advantage tokens to a space unit');
            expect(context.player1).toHavePassAbilityButton();
            context.player1.clickCard(context.phoenixSquadronAwing);

            expect(context.battlefieldMarine).toHaveExactUpgradeNames([]);
            expect(context.attendantNavigator).toHaveExactUpgradeNames([]);
            expect(context.phoenixSquadronAwing).toHaveExactUpgradeNames(['advantage', 'advantage']);
            expect(context.rebelPathfinder).toHaveExactUpgradeNames([]);
            expect(context.lurkingTiePhantom).toHaveExactUpgradeNames([]);

            expect(context.player2).toBeActivePlayer();
        });

        it('Attendant Navigator\'s ability should give 2 Advantage tokens to an enemy space unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['attendant-navigator'],
                    spaceArena: ['phoenix-squadron-awing'],
                    groundArena: ['battlefield-marine']
                },
                player2: {
                    groundArena: ['rebel-pathfinder'],
                    spaceArena: ['lurking-tie-phantom']

                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.attendantNavigator);

            expect(context.player1).toBeAbleToSelectExactly([context.lurkingTiePhantom, context.phoenixSquadronAwing]);
            expect(context.player1).toHavePassAbilityButton();
            context.player1.clickCard(context.lurkingTiePhantom);

            expect(context.battlefieldMarine).toHaveExactUpgradeNames([]);
            expect(context.attendantNavigator).toHaveExactUpgradeNames([]);
            expect(context.phoenixSquadronAwing).toHaveExactUpgradeNames([]);
            expect(context.rebelPathfinder).toHaveExactUpgradeNames([]);
            expect(context.lurkingTiePhantom).toHaveExactUpgradeNames(['advantage', 'advantage']);

            expect(context.player2).toBeActivePlayer();
        });

        it('Attendant Navigator\'s ability should be able to be passed', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['attendant-navigator'],
                    spaceArena: ['phoenix-squadron-awing'],
                    groundArena: ['battlefield-marine']
                },
                player2: {
                    groundArena: ['rebel-pathfinder'],
                    spaceArena: ['lurking-tie-phantom']

                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.attendantNavigator);

            expect(context.player1).toBeAbleToSelectExactly([context.lurkingTiePhantom, context.phoenixSquadronAwing]);
            expect(context.player1).toHavePassAbilityButton();
            context.player1.clickPrompt('Pass');

            expect(context.battlefieldMarine).toHaveExactUpgradeNames([]);
            expect(context.attendantNavigator).toHaveExactUpgradeNames([]);
            expect(context.phoenixSquadronAwing).toHaveExactUpgradeNames([]);
            expect(context.rebelPathfinder).toHaveExactUpgradeNames([]);
            expect(context.lurkingTiePhantom).toHaveExactUpgradeNames([]);

            expect(context.player2).toBeActivePlayer();
        });

        it('Attendant Navigator\'s ability should do nothing if there are no space units', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['attendant-navigator'],
                    groundArena: ['battlefield-marine']
                },
                player2: {
                    groundArena: ['rebel-pathfinder'],

                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.attendantNavigator);

            expect(context.player1).not.toHavePrompt('Give 2 Advantage tokens to a friendly unit');

            expect(context.rebelPathfinder).toHaveExactUpgradeNames([]);
            expect(context.attendantNavigator).toHaveExactUpgradeNames([]);

            expect(context.player2).toBeActivePlayer();
        });
    });
});