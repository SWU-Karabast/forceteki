describe('Gallofree Transport', function() {
    integration(function(contextRef) {
        it('Gallofree Transport\'s ability should give 2 Advantage tokens to a friendly ground unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    spaceArena: ['gallofree-transport', 'phoenix-squadron-awing'],
                    groundArena: ['battlefield-marine']
                },
                player2: {
                    hand: ['vanquish', 'no-glory-only-results'],
                    groundArena: ['rebel-pathfinder'],
                    spaceArena: ['lurking-tie-phantom'],
                    hasInitiative: true

                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.vanquish);
            context.player2.clickCard(context.gallofreeTransport);

            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.phoenixSquadronAwing]);
            expect(context.player1).toHavePrompt('Give 2 Advantage tokens to a friendly unit');
            expect(context.player1).not.toHavePassAbilityButton();
            context.player1.clickCard(context.battlefieldMarine);

            expect(context.battlefieldMarine).toHaveExactUpgradeNames(['advantage', 'advantage']);
            expect(context.phoenixSquadronAwing).toHaveExactUpgradeNames([]);
            expect(context.rebelPathfinder).toHaveExactUpgradeNames([]);
            expect(context.lurkingTiePhantom).toHaveExactUpgradeNames([]);

            expect(context.player1).toBeActivePlayer();
        });

        it('Gallofree Transport\'s ability should give 2 Advantage tokens to a friendly space unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    spaceArena: ['gallofree-transport', 'phoenix-squadron-awing'],
                    groundArena: ['battlefield-marine']
                },
                player2: {
                    hand: ['vanquish', 'no-glory-only-results'],
                    groundArena: ['rebel-pathfinder'],
                    spaceArena: ['lurking-tie-phantom'],
                    hasInitiative: true

                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.vanquish);
            context.player2.clickCard(context.gallofreeTransport);

            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.phoenixSquadronAwing]);
            expect(context.player1).not.toHavePassAbilityButton();
            context.player1.clickCard(context.phoenixSquadronAwing);

            expect(context.battlefieldMarine).toHaveExactUpgradeNames([]);
            expect(context.phoenixSquadronAwing).toHaveExactUpgradeNames(['advantage', 'advantage']);
            expect(context.rebelPathfinder).toHaveExactUpgradeNames([]);
            expect(context.lurkingTiePhantom).toHaveExactUpgradeNames([]);

            expect(context.player1).toBeActivePlayer();
        });

        it('Gallofree Transport\'s ability should do nothing if there are no friendly units', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    spaceArena: ['gallofree-transport'],
                },
                player2: {
                    hand: ['vanquish', 'no-glory-only-results'],
                    groundArena: ['rebel-pathfinder'],
                    spaceArena: ['lurking-tie-phantom'],
                    hasInitiative: true

                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.vanquish);
            context.player2.clickCard(context.gallofreeTransport);

            expect(context.player1).not.toHavePrompt('Give 2 Advantage tokens to a friendly unit');

            expect(context.rebelPathfinder).toHaveExactUpgradeNames([]);
            expect(context.lurkingTiePhantom).toHaveExactUpgradeNames([]);

            expect(context.player1).toBeActivePlayer();
        });

        it('Gallofree Transport\'s ability should work with NGOR', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    spaceArena: ['gallofree-transport', 'phoenix-squadron-awing'],
                    groundArena: ['battlefield-marine']
                },
                player2: {
                    hand: ['vanquish', 'no-glory-only-results'],
                    groundArena: ['rebel-pathfinder'],
                    spaceArena: ['lurking-tie-phantom'],
                    hasInitiative: true

                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.noGloryOnlyResults);
            context.player2.clickCard(context.gallofreeTransport);

            expect(context.player2).toBeAbleToSelectExactly([context.rebelPathfinder, context.lurkingTiePhantom]);
            expect(context.player2).not.toHavePassAbilityButton();
            context.player2.clickCard(context.lurkingTiePhantom);

            expect(context.battlefieldMarine).toHaveExactUpgradeNames([]);
            expect(context.phoenixSquadronAwing).toHaveExactUpgradeNames([]);
            expect(context.rebelPathfinder).toHaveExactUpgradeNames([]);
            expect(context.lurkingTiePhantom).toHaveExactUpgradeNames(['advantage', 'advantage']);

            expect(context.player1).toBeActivePlayer();
        });
    });
});