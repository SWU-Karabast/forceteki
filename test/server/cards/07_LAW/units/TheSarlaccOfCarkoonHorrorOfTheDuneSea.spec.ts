describe('The Sarlacc of Carkoon, Horror of the Dune Sea', function () {
    integration(function (contextRef) {
        it('should move a unit from discard to bottom of deck and deal damage equal to its power to an enemy ground unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['the-sarlacc-of-carkoon#horror-of-the-dune-sea'],
                    discard: ['wampa', 'battlefield-marine', 'force-throw'],
                    deck: ['moisture-farmer', 'tieln-fighter'],
                },
                player2: {
                    groundArena: ['atst', 'consular-security-force'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.theSarlaccOfCarkoon);
            context.player1.clickCard(context.p2Base);

            expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.battlefieldMarine]);
            context.player1.clickCard(context.wampa);

            expect(context.player1).toBeAbleToSelectExactly([context.atst, context.consularSecurityForce]);
            context.player1.clickCard(context.consularSecurityForce);

            expect(context.wampa).toBeInBottomOfDeck(context.player1, 1);
            expect(context.battlefieldMarine).toBeInZone('discard');

            expect(context.consularSecurityForce.damage).toBe(4);
            expect(context.atst.damage).toBe(0);

            expect(context.player2).toBeActivePlayer();
        });

        it('should not trigger if there are no units in discard pile', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['the-sarlacc-of-carkoon#horror-of-the-dune-sea'],
                    discard: ['vanquish'],
                },
                player2: {
                    groundArena: ['atst'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.theSarlaccOfCarkoon);
            context.player1.clickCard(context.p2Base);

            expect(context.atst.damage).toBe(0);
            expect(context.player2).toBeActivePlayer();
        });

        it('should still be able to move card to deck if there are no enemy ground units', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['the-sarlacc-of-carkoon#horror-of-the-dune-sea'],
                    discard: ['wampa', 'battlefield-marine'],
                    deck: ['moisture-farmer', 'force-throw'],
                },
                player2: {
                    spaceArena: ['tieln-fighter'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.theSarlaccOfCarkoon);
            context.player1.clickCard(context.p2Base);

            context.player1.clickCard(context.wampa);

            expect(context.wampa).toBeInBottomOfDeck(context.player1, 1);
            expect(context.battlefieldMarine).toBeInZone('discard');

            expect(context.tielnFighter.damage).toBe(0);

            expect(context.player2).toBeActivePlayer();
        });

        it('should deal 0 damage when selecting a unit with 0 power', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['the-sarlacc-of-carkoon#horror-of-the-dune-sea'],
                    discard: ['moisture-farmer'], // 0 power unit
                },
                player2: {
                    groundArena: ['atst'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.theSarlaccOfCarkoon);
            context.player1.clickCard(context.p2Base);

            expect(context.player1).toBeAbleToSelectExactly([context.moistureFarmer]);
            context.player1.clickCard(context.moistureFarmer);

            expect(context.player1).toBeAbleToSelectExactly([context.atst]);
            context.player1.clickCard(context.atst);

            expect(context.moistureFarmer).toBeInBottomOfDeck(context.player1, 1);

            expect(context.atst.damage).toBe(0);
        });
    });
});