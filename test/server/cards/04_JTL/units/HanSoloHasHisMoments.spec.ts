
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

        describe('when the attached unit leaves play before the trigger resolves', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['han-solo#has-his-moments'],
                        groundArena: [{ card: 'atst', damage: 6 }],
                    },
                    player2: {
                        groundArena: ['krayt-dragon'],
                    }
                });
            });

            // Regression test for https://github.com/SWU-Karabast/forceteki/issues/2838:
            // the trigger must not be evaluated (and crash on parentCard) once Han Solo is no longer attached
            it('should not trigger if the attached unit is defeated by an enemy trigger first', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.hanSolo);
                context.player1.clickPrompt('Play Han Solo with Piloting');
                context.player1.clickCard(context.atst);

                // both players have pending triggers (Han Solo's When Played and Krayt Dragon's),
                // so the active player chooses who resolves first
                expect(context.player1).toHaveExactPromptButtons(['You', 'Opponent']);
                context.player1.clickPrompt('Opponent');

                // Krayt Dragon deals 5 damage (Han Solo's cost) to the damaged AT-ST, defeating it
                expect(context.player2).toBeAbleToSelectExactly([context.atst, context.p1Base]);
                context.player2.clickCard(context.atst);

                expect(context.atst).toBeInZone('discard', context.player1);
                expect(context.hanSolo).toBeInZone('discard', context.player1);

                // Han Solo's trigger has no legal target anymore, so it is skipped without a prompt
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});