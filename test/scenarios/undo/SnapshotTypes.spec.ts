describe('Snapshot types', function() {
    undoIntegration(function(contextRef) {
        describe('Action snapshots', function() {
            beforeEach(async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['death-trooper'],
                        groundArena: ['secretive-sage'],
                        spaceArena: ['cartel-spacer']
                    },
                    player2: {
                        groundArena: ['wampa', 'superlaser-technician'],
                        spaceArena: ['tieln-fighter']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.cartelSpacer);
                context.player1.clickCard(context.p2Base);

                context.player2.clickCard(context.superlaserTechnician);
                context.player2.clickCard(context.p1Base);

                context.p1Action1SnapshotId = contextRef.currentSnapshotId;
                context.p1Action1ActionId = contextRef.currentSnapshottedAction;

                // Play Death Trooper
                context.player1.clickCard(context.deathTrooper);

                // Choose Friendly
                context.player1.clickCard(context.deathTrooper);

                // Choose Enemy
                context.player1.clickCard(context.wampa);
                expect(context.deathTrooper.damage).toEqual(2);
                expect(context.wampa.damage).toEqual(2);

                context.p2Action1SnapshotId = contextRef.currentSnapshotId;
                context.p2Action1ActionId = contextRef.currentSnapshottedAction;

                context.player2.clickCard(context.wampa);
                context.player2.clickCard(context.p1Base);

                context.p1Action2SnapshotId = contextRef.currentSnapshotId;
                context.p1Action2ActionId = contextRef.currentSnapshottedAction;

                context.player1.clickCard(context.secretiveSage);
                context.player1.clickCard(context.p2Base);

                context.p2Action2SnapshotId = contextRef.currentSnapshotId;
                context.p2Action2ActionId = contextRef.currentSnapshottedAction;

                context.player2.clickCard(context.tielnFighter);
                context.player2.clickCard(context.p1Base);

                context.finalSnapshotId = contextRef.currentSnapshotId;
                context.finalActionId = contextRef.currentSnapshottedAction;
            });

            it('can revert back one action for p1 as the default', function () {
                const { context } = contextRef;

                contextRef.rollbackToSnapshot({
                    type: 'action',
                    playerId: context.player1.id,
                    offset: -2
                });

                expect(contextRef.currentSnapshotId).toEqual(context.p1Action1SnapshotId);
                expect(contextRef.currentSnapshottedAction).toEqual(context.p1Action1ActionId);

                expect(context.deathTrooper).toBeInZone('hand');
                expect(context.wampa.damage).toEqual(0);
                expect(context.p1Base.damage).toEqual(0);
                expect(context.p2Base.damage).toEqual(0);
            });
        });
    });
});
