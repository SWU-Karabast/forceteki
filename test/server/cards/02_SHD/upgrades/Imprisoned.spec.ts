
describe('Imprisoned', function() {
    integration(function(contextRef) {
        it('Imprisoned\'s ability should cancel all abilities on attached unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['protector', 'imprisoned'],
                    spaceArena: ['avenger#hunting-star-destroyer'],
                    leader: { card: 'iden-versio#inferno-squad-commander', deployed: true }
                },
                player2: {
                    spaceArena: ['cartel-spacer'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.imprisoned);
            expect(context.player1).toBeAbleToSelectExactly([context.avenger, context.cartelSpacer]);
            context.player1.clickCard(context.avenger);

            context.player2.passAction();

            context.player1.clickCard(context.avenger);
            context.player1.clickCard(context.p2Base);

            expect(context.player2).toBeActivePlayer();

            context.player2.passAction();

            context.player1.clickCard(context.protector);
            context.player1.clickCard(context.avenger);

            context.player2.clickCard(context.cartelSpacer);
            expect(context.player2).toBeAbleToSelectExactly([context.avenger, context.p1Base]);
            context.player2.clickCard(context.p1Base);
        });

        it('Imprisoned should not prevent gaining constant abilities after it is removed', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    base: { card: 'dagobah-swamp', damage: 4 },
                    hand: ['admiral-yularen#fleet-coordinator', 'confiscate'],
                    spaceArena: ['millennium-falcon#landos-pride']
                },
                player2: {
                    hand: ['imprisoned'],
                    hasInitiative: true,
                }
            });

            const { context } = contextRef;

            // Player 2 plays Imprisoned on Millennium Falcon
            context.player2.clickCard(context.imprisoned);
            expect(context.player2).toBeAbleToSelectExactly([context.millenniumFalcon]);
            context.player2.clickCard(context.millenniumFalcon);

            // Player 1 plays Admiral Yularen, giving friendly Vehicle units Restore 1
            context.player1.clickCard(context.admiralYularen);
            context.player1.clickPrompt('Restore 1');
            context.player2.passAction();

            // Player 1 attacks with Millennium Falcon
            context.player1.clickCard(context.millenniumFalcon);
            context.player1.clickCard(context.p2Base);

            // Base health was not restored due to Imprisoned
            expect(context.p1Base.damage).toBe(4);
            context.player2.passAction();

            // Player 1 plays Confiscate to remove Imprisoned
            context.player1.clickCard(context.confiscate);
            context.player1.clickCard(context.imprisoned);

            context.moveToNextActionPhase();
            context.player2.passAction();

            // Player 1 attacks with Millennium Falcon again
            context.player1.clickCard(context.millenniumFalcon);
            context.player1.clickCard(context.p2Base);

            // Base health should be restored from Millennium Falcon's gained Restore 1 via Yularen
            expect(context.p1Base.damage).toBe(3);
        });

        it('Lasting effects applied while Imprisoned was attached do not return if it gets removed', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['in-the-heat-of-battle', 'confiscate'],
                    spaceArena: [
                        { card: 'millennium-falcon#landos-pride', upgrades: ['imprisoned'] },
                    ]
                }
            });

            const { context } = contextRef;

            // Player 1 plays In the Heat of Battle to give all units Sentinel
            context.player1.clickCard(context.inTheHeatOfBattle);

            // Millennium Falcon has Imprisoned, so it should not gain Sentinel
            expect(context.millenniumFalcon.hasSentinel()).toBeFalse();
            context.player2.passAction();

            // Player 1 plays Confiscate to remove Imprisoned
            context.player1.clickCard(context.confiscate);
            context.player1.clickCard(context.imprisoned);

            // After removing Imprisoned, Millennium Falcon should still not gain Sentinel (it missed the opportunity)
            expect(context.millenniumFalcon.hasSentinel()).toBeFalse();
        });
    });
});
