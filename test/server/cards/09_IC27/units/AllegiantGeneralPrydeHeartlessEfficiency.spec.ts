describe('Allegiant General Pryde, Heartless Efficiency', function () {
    integration(function (contextRef) {
        it('Allegiant General Pryde\'s ability should give an Experience token to the friendly unit with the most power when defeated', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['allegiant-general-pryde#heartless-efficiency', 'wampa', 'battlefield-marine', 'specforce-soldier'],
                },
                player2: {
                    hand: ['takedown'],
                    hasInitiative: true,
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.takedown);
            context.player2.clickCard(context.allegiantGeneralPryde);

            // Wampa is the friendly unit with the most power, it gains the Experience token automatically
            expect(context.allegiantGeneralPryde).toBeInZone('discard');
            expect(context.wampa).toHaveExactUpgradeNames(['experience']);
            expect(context.battlefieldMarine).toHaveExactUpgradeNames([]);
            expect(context.specforceSoldier).toHaveExactUpgradeNames([]);
            expect(context.player1).toBeActivePlayer();
        });

        it('Allegiant General Pryde\'s ability should prompt to choose a friendly unit when multiple units are tied for the most power', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['allegiant-general-pryde#heartless-efficiency', 'battlefield-marine', 'consular-security-force', 'specforce-soldier'],
                },
                player2: {
                    hand: ['takedown'],
                    hasInitiative: true,
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.takedown);
            context.player2.clickCard(context.allegiantGeneralPryde);

            // Battlefield Marine and Consular Security Force are tied at 3 power, only they are selectable
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.consularSecurityForce]);
            context.player1.clickCard(context.consularSecurityForce);

            expect(context.consularSecurityForce).toHaveExactUpgradeNames(['experience']);
            expect(context.battlefieldMarine).toHaveExactUpgradeNames([]);
            expect(context.specforceSoldier).toHaveExactUpgradeNames([]);
            expect(context.player1).toBeActivePlayer();
        });

        it('Allegiant General Pryde\'s ability should give the Experience token to the remaining friendly unit when Pryde was the unit with the most power', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['allegiant-general-pryde#heartless-efficiency', 'c3po#impulse-buy'],
                },
                player2: {
                    hand: ['takedown'],
                    hasInitiative: true,
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.takedown);
            context.player2.clickCard(context.allegiantGeneralPryde);

            // Pryde (2 power) is gone: C-3PO (1 power) is now the friendly unit with the most power and gets the token
            expect(context.allegiantGeneralPryde).toBeInZone('discard');
            expect(context.c3po).toHaveExactUpgradeNames(['experience']);
            expect(context.player1).toBeActivePlayer();
        });

        it('Allegiant General Pryde\'s ability should do nothing if there are no other friendly units', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['allegiant-general-pryde#heartless-efficiency'],
                },
                player2: {
                    hand: ['takedown'],
                    hasInitiative: true,
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.takedown);
            context.player2.clickCard(context.allegiantGeneralPryde);

            expect(context.allegiantGeneralPryde).toBeInZone('discard');
            expect(context.player1).toBeActivePlayer();
        });

        it('Allegiant General Pryde\'s ability should give the Experience token to a unit of the player controlling it when defeated (No Glory, Only Results)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['allegiant-general-pryde#heartless-efficiency', 'wampa'],
                },
                player2: {
                    hand: ['no-glory-only-results'],
                    groundArena: ['consular-security-force', 'specforce-soldier'],
                }
            });

            const { context } = contextRef;

            context.player1.passAction();

            // Player 2 steals Pryde and defeats it, so player 2 controls the When Defeated ability
            context.player2.clickCard(context.noGloryOnlyResults);
            context.player2.clickCard(context.allegiantGeneralPryde);

            // Consular Security Force is player 2's strongest unit, Wampa gets nothing
            expect(context.allegiantGeneralPryde).toBeInZone('discard', context.player1);
            expect(context.consularSecurityForce).toHaveExactUpgradeNames(['experience']);
            expect(context.specforceSoldier).toHaveExactUpgradeNames([]);
            expect(context.wampa).toHaveExactUpgradeNames([]);
            expect(context.player1).toBeActivePlayer();
        });
    });
});
