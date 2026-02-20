describe('Display Piece', function () {
    integration(function (contextRef) {
        it('Display Piece\'s ability should defeat an enemy unit, its controller must resource it from discard', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['display-piece'],
                    groundArena: ['wampa']
                },
                player2: {
                    groundArena: ['yoda#old-master'],
                    spaceArena: ['awing']
                }
            });

            const { context } = contextRef;

            const p2resources = context.player2.resources.length;

            context.player1.clickCard(context.displayPiece);
            expect(context.player1).toBeAbleToSelectExactly([context.yoda, context.awing]);
            context.player1.clickCard(context.awing);

            expect(context.player2).toBeActivePlayer();
            expect(context.awing).toBeInZone('resource', context.player2);
            expect(context.player2.resources.length).toBe(p2resources + 1);
        });

        it('Display Piece\'s ability should defeat an enemy unit and its controller must resource it from discard and apply (do not resource it if not defeated)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['display-piece'],
                    groundArena: ['wampa']
                },
                player2: {
                    spaceArena: ['lurking-tie-phantom']
                }
            });

            const { context } = contextRef;

            const p2resources = context.player2.resources.length;

            context.player1.clickCard(context.displayPiece);
            context.player1.clickCard(context.lurkingTiePhantom);

            expect(context.player2).toBeActivePlayer();
            expect(context.lurkingTiePhantom).toBeInZone('spaceArena', context.player2);
            expect(context.player2.resources.length).toBe(p2resources);
        });

        it('Display Piece\'s ability should defeat an stolen unit, its controller must resource it from discard', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['display-piece'],
                    spaceArena: ['awing']
                },
                player2: {
                    hand: ['traitorous'],
                    hasInitiative: true,
                }
            });

            const { context } = contextRef;

            const p2resources = context.player2.resources.length;

            context.player2.clickCard(context.traitorous);
            context.player2.clickCard(context.awing);

            context.player1.clickCard(context.displayPiece);
            context.player1.clickCard(context.awing);

            expect(context.player2).toBeActivePlayer();
            expect(context.awing).toBeInZone('resource', context.player2);
            expect(context.player2.resources.length).toBe(p2resources + 1);
        });

        it('Display Piece\'s ability should defeat an enemy unit and its controller must resource it from discard (do not resource 2 time SLT)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['display-piece'],
                    spaceArena: ['awing']
                },
                player2: {
                    groundArena: ['superlaser-technician']
                }
            });

            const { context } = contextRef;

            const p2resources = context.player2.resources.length;

            context.player1.clickCard(context.displayPiece);
            context.player1.clickCard(context.superlaserTechnician);

            expect(context.player2).toBeActivePlayer();
            expect(context.superlaserTechnician).toBeInZone('resource', context.player2);
            expect(context.player2.resources.length).toBe(p2resources + 1);
        });

        it('Display Piece\'s ability should defeat an enemy unit, its controller must resource it from discard and apply when defeated', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['display-piece'],
                    spaceArena: ['awing']
                },
                player2: {
                    groundArena: ['battlefield-marine', 'scarif-lieutenant']
                }
            });

            const { context } = contextRef;

            const p2resources = context.player2.resources.length;

            context.player1.clickCard(context.displayPiece);
            context.player1.clickCard(context.scarifLieutenant);

            expect(context.scarifLieutenant).toBeInZone('resource', context.player2);
            expect(context.player2.resources.length).toBe(p2resources + 1);

            expect(context.player2).toBeAbleToSelectExactly([context.battlefieldMarine]);
            context.player2.clickCard(context.battlefieldMarine);

            expect(context.player2).toBeActivePlayer();
            expect(context.battlefieldMarine).toHaveExactUpgradeNames(['experience']);
        });

        it('Display Piece\'s ability should defeat an upgrade unit and its controller must resource it from discard', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['display-piece'],
                },
                player2: {
                    hand: ['paige-tico#dropping-the-hammer'],
                    spaceArena: ['awing'],
                    hasInitiative: true,
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.paigeTico);
            context.player2.clickPrompt('Play Paige Tico with Piloting');
            context.player2.clickCard(context.awing);

            const p2resources = context.player2.resources.length;

            context.player1.clickCard(context.displayPiece);
            context.player1.clickCard(context.awing);

            expect(context.player2).toBeActivePlayer();
            expect(context.awing).toBeInZone('resource', context.player2);
            expect(context.paigeTico).toBeInZone('discard', context.player2);
            expect(context.player2.resources.length).toBe(p2resources + 1);
        });
    });
});