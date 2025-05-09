describe('Chewbacca, Walking Carpet', function() {
    integration(function(contextRef) {
        describe('Chewbacca, Walking Carpet\'s undeployed ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['alliance-xwing', 'liberated-slaves', 'seventh-fleet-defender', 'consular-security-force'],
                        discard: ['yoda#old-master'],
                        resources: ['wilderness-fighter', 'homestead-militia', 'rogue-operative', 'vanquish', 'village-protectors'],
                        leader: 'chewbacca#walking-carpet',
                        base: 'administrators-tower'
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: ['tieln-fighter']
                    },
                });
            });

            it('should let the controller play a unit from hand with printed cost 3 or less and give it sentinel for the phase', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.chewbacca);
                expect(context.player1).toBeAbleToSelectExactly([context.allianceXwing, context.liberatedSlaves, context.seventhFleetDefender]);

                context.player1.clickCard(context.liberatedSlaves);
                expect(context.player1.exhaustedResourceCount).toBe(3);
                expect(context.liberatedSlaves.hasSomeKeyword('sentinel')).toBeTrue();

                // player 2 attacks, liberated slaves automatically selected due to sentinel
                context.player2.clickCard(context.wampa);
                expect(context.player2).toBeAbleToSelectExactly([context.liberatedSlaves]);

                context.player2.clickCard(context.liberatedSlaves);
                expect(context.player1).toBeActivePlayer();
                expect(context.liberatedSlaves.damage).toBe(4);
                expect(context.wampa.damage).toBe(3);

                // next round, liberated slaves should no longer have sentinel
                context.moveToNextActionPhase();
                expect(context.liberatedSlaves.hasSomeKeyword('sentinel')).toBeFalse();

                context.player1.passAction();
                context.player2.clickCard(context.wampa);
                expect(context.player2).toBeAbleToSelectExactly([context.p1Base, context.liberatedSlaves]);
                context.player2.clickCard(context.p1Base);
            });

            it('should not affect the cost of playing a unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.chewbacca);
                context.player1.clickCard(context.seventhFleetDefender);
                expect(context.player1.exhaustedResourceCount).toBe(5);

                // test sentinel gain again for good measure
                context.player2.clickCard(context.tielnFighter);
                expect(context.player2).toBeAbleToSelectExactly([context.seventhFleetDefender]);

                context.player2.clickCard(context.seventhFleetDefender);
                expect(context.tielnFighter).toBeInZone('discard');
            });

            it('should not allow the player to select a unit that cannot be played', function () {
                const { context } = contextRef;

                context.player1.exhaustResources(context.player1.readyResourceCount - 2);

                context.player1.clickCard(context.chewbacca);
                expect(context.player1).toBeAbleToSelectExactly([context.allianceXwing]);
                expect(context.liberatedSlaves).not.toHaveAvailableActionWhenClickedBy(context.player1);
                expect(context.seventhFleetDefender).not.toHaveAvailableActionWhenClickedBy(context.player1);

                context.player1.clickCard(context.allianceXwing);
                expect(context.allianceXwing.hasSomeKeyword('sentinel')).toBeTrue();
            });

            it('should not give sentinel when choosing nothing', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.chewbacca);
                context.player1.clickPrompt('Choose nothing');

                expect(context.allianceXwing).toBeInZone('hand');
                expect(context.allianceXwing.hasSomeKeyword('sentinel')).toBeFalse();
                expect(context.liberatedSlaves).toBeInZone('hand');
                expect(context.liberatedSlaves.hasSomeKeyword('sentinel')).toBeFalse();
                expect(context.seventhFleetDefender).toBeInZone('hand');
                expect(context.seventhFleetDefender.hasSomeKeyword('sentinel')).toBeFalse();
            });
        });
    }); // No tests for the unit side because it's only text is keywords.
});
