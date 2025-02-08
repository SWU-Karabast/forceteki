describe('Black Squadron Scout Wing', function() {
    integration(function(contextRef) {
        describe('Black Squadron Scout Wing\'s ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['academy-training', 'armed-to-the-teeth'],
                        spaceArena: ['black-squadron-scout-wing']
                    },
                    player2: {
                        hand: ['bounty-hunters-quarry']
                    }
                });
            });

            it('should attack when an upgrade is played on this unit giving it a +1/0 for this attack', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.academyTraining);
                context.player1.clickCard(context.blackSquadronScoutWing);

                expect(context.player1).toHavePassAbilityPrompt('You may attack with this unit. It gets +1/+0 for this attack.');

                context.player1.clickPrompt('You may attack with this unit. It gets +1/+0 for this attack.');
                context.player1.clickCard(context.p2Base);

                // Player 2's base should have 7 damage (4 from Black Squadron Scout Wing + 2 from Academy Training + 1 from card text)
                expect(context.p2Base.damage).toBe(7);
                expect(context.blackSquadronScoutWing).toHaveExactUpgradeNames(['academy-training']);
                expect(context.player2).toBeActivePlayer();

                // Should not be able to attack when Black Squadron Scout Wing is exhausted
                context.moveToNextActionPhase();
                context.blackSquadronScoutWing.exhausted = true;

                context.player1.clickCard(context.armedToTheTeeth);
                context.player1.clickCard(context.blackSquadronScoutWing);

                expect(context.player2).toBeActivePlayer();
            });

            it('should not attack when an upgrade is played by another player', function () {
                const { context } = contextRef;

                context.player1.passAction();
                context.player2.clickCard(context.bountyHuntersQuarry);
                context.player2.clickCard(context.blackSquadronScoutWing);

                expect(context.blackSquadronScoutWing).toHaveExactUpgradeNames(['bounty-hunters-quarry']);
                expect(context.player1).toBeActivePlayer();
            });
        });
    });
});
