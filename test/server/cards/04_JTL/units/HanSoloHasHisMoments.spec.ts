
describe('Han Solo Has His Moments', function () {
    integration(function (contextRef) {
        describe('Astromech Pilot\'s piloting ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['han-solo#has-his-moments'],
                        spaceArena: ['millennium-falcon#piece-of-junk', 'millennium-falcon#get-out-and-push', 'millennium-falcon#landos-pride', 'gold-leader#fastest-ship-in-the-fleet'],
                    },
                    player2: {
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['cartel-spacer'],
                    }
                });
            });

            it('Han Solo\'s ability should allow attack with the attached unit and give damage first if attached to Millennium Falcon Piece of Junk', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.hanSolo);
                context.player1.clickPrompt('Play Han Solo with Piloting');
                expect(context.player1).toBeAbleToSelectExactly([
                    context.millenniumFalconPieceOfJunk,
                    context.millenniumFalconGetOutAndPush,
                    context.millenniumFalconLandosPride,
                    context.goldLeader
                ]);
                context.player1.clickCard(context.millenniumFalconPieceOfJunk);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickPrompt('Trigger');
                context.player1.clickCard(context.cartelSpacer);
                expect(context.cartelSpacer).toBeInZone('discard');
                expect(context.millenniumFalconPieceOfJunk.damage).toBe(0);
                expect(context.player2).toBeActivePlayer();
            });

            it('Han Solo\'s ability should allow attack with the attached unit and give damage first if attached to Millennium Falcon Get Out And Push', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.hanSolo);
                context.player1.clickPrompt('Play Han Solo with Piloting');
                expect(context.player1).toBeAbleToSelectExactly([
                    context.millenniumFalconPieceOfJunk,
                    context.millenniumFalconGetOutAndPush,
                    context.millenniumFalconLandosPride,
                    context.goldLeader
                ]);
                context.player1.clickCard(context.millenniumFalconGetOutAndPush);
                context.player1.clickPrompt('Trigger');
                context.player1.clickCard(context.cartelSpacer);
                expect(context.cartelSpacer).toBeInZone('discard');
                expect(context.millenniumFalconGetOutAndPush.damage).toBe(0);
                expect(context.player2).toBeActivePlayer();
            });

            it('Han Solo\'s ability should allow attack with the attached unit and give damage first if attached to Millennium Falcon Landos Pride', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.hanSolo);
                context.player1.clickPrompt('Play Han Solo with Piloting');
                expect(context.player1).toBeAbleToSelectExactly([
                    context.millenniumFalconPieceOfJunk,
                    context.millenniumFalconGetOutAndPush,
                    context.millenniumFalconLandosPride,
                    context.goldLeader
                ]);
                context.player1.clickCard(context.millenniumFalconLandosPride);
                context.player1.clickPrompt('Trigger');
                context.player1.clickCard(context.cartelSpacer);
                expect(context.cartelSpacer).toBeInZone('discard');
                expect(context.millenniumFalconLandosPride.damage).toBe(0);
                expect(context.player2).toBeActivePlayer();
            });

            it('Han Solo\'s ability should allow attack with the attached unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.hanSolo);
                context.player1.clickPrompt('Play Han Solo with Piloting');
                expect(context.player1).toBeAbleToSelectExactly([
                    context.millenniumFalconPieceOfJunk,
                    context.millenniumFalconGetOutAndPush,
                    context.millenniumFalconLandosPride,
                    context.goldLeader
                ]);
                context.player1.clickCard(context.goldLeader);
                context.player1.clickPrompt('Trigger');
                context.player1.clickCard(context.cartelSpacer);
                expect(context.cartelSpacer).toBeInZone('discard');
                expect(context.goldLeader.damage).toBe(2);
                expect(context.player2).toBeActivePlayer();
            });

            it('Han Solo\'s ability should allow attack a base with the attached unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.hanSolo);
                context.player1.clickPrompt('Play Han Solo with Piloting');
                expect(context.player1).toBeAbleToSelectExactly([
                    context.millenniumFalconPieceOfJunk,
                    context.millenniumFalconGetOutAndPush,
                    context.millenniumFalconLandosPride,
                    context.goldLeader
                ]);
                context.player1.clickCard(context.millenniumFalconLandosPride);
                context.player1.clickPrompt('Trigger');
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(7);
                expect(context.player2).toBeActivePlayer();
            });

            it('Han Solo\'s ability should allow to ambush if played as an unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.hanSolo);
                context.player1.clickPrompt('Play Han Solo');
                context.player1.clickPrompt('Trigger'); // Ambush
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine]);
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.battlefieldMarine).toBeInZone('discard');
                expect(context.hanSolo.damage).toBe(3);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});