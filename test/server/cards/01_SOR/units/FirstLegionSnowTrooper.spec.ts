describe('First Legion Snow Trooper', function() {
    integration(function(contextRef) {
        describe('First Legion Snow Trooper\'s ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['first-legion-snowtrooper'],
                    },
                    player2: {
                        groundArena: ['yoda#old-master'],
                    }
                });
            });

            it('should have no effect when attacking a non-damaged-unit', function () {
                const { context } = contextRef;

                // actions
                context.player1.clickCard(context.firstLegionSnowtrooper);
                context.player1.clickCard(context.yodaOldMaster);

                // check board state
                expect(context.firstLegionSnowtrooper.exhausted).toBe(true);
                expect(context.firstLegionSnowtrooper.damage).toBe(2);
                expect(context.yodaOldMaster.damage).toBe(2);
                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('First Legion Snow Troopers ability with a damaged unit.', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'first-legion-snowtrooper' }],
                    },
                    player2: {
                        groundArena: [{ card: 'snowtrooper-lieutenant', damage: 1 }],
                        base: { card: 'dagobah-swamp', damage: 5 }
                    }
                });
            });

            it('First Legion Snow Trooper should receive overwhelm and +2/+0, defeating the Snowtrooper Lieutenant and dealing 3 damage to opponents base.', function () {
                const { context } = contextRef;

                // Case 1: Defeating yoda and dealing 1 damage to opponents base
                context.player1.clickCard(context.firstLegionSnowtrooper);
                context.player1.clickCard(context.snowtrooperLieutenant);

                // Check board state
                expect(context.snowtrooperLieutenant).toBeInZone('discard');
                expect(context.firstLegionSnowtrooper.exhausted).toBe(true);
                expect(context.firstLegionSnowtrooper.damage).toBe(2);
                expect(context.p2Base.damage).toBe(8);
                expect(context.player2).toBeActivePlayer();

                // Reset state
                context.player2.passAction();
                context.firstLegionSnowtrooper.exhausted = false;

                // Case 2: Attacking base and not receiving +2/+0 and overwhelm
                context.player1.clickCard(context.firstLegionSnowtrooper);

                // Check board state
                expect(context.firstLegionSnowtrooper.exhausted).toBe(true);
                expect(context.firstLegionSnowtrooper.damage).toBe(2);
                expect(context.p2Base.damage).toBe(10);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
