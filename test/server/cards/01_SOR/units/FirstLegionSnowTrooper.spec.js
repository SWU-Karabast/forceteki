describe('First Legion Snow Trooper', function() {
    integration(function() {
        describe('First Legion Snow Troopers ability', function() {
            beforeEach(function () {
                this.setupTest({
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
                // actions
                this.player1.clickCard(this.firstLegionSnowtrooper);
                this.player1.clickCard(this.yodaOldMaster);

                // check board state
                expect(this.firstLegionSnowtrooper.exhausted).toBe(true);
                expect(this.firstLegionSnowtrooper.damage).toBe(2);
                expect(this.yodaOldMaster.damage).toBe(2);
                expect(this.player2).toBeActivePlayer();
            });
        });

        describe('First Legion Snow Troopers ability with a damaged unit.', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'first-legion-snowtrooper' }],
                    },
                    player2: {
                        groundArena: [{ card: 'yoda#old-master', damage: 1 }],
                        base: { card: 'dagobah-swamp', damage: 5 }
                    }
                });
            });

            it('Snowtrooper should receive overwhelm and +2/+0, defeating yoda and dealing 1 damage to opponents base.', function () {
                // Case 1: Defeating yoda and dealing 1 damage to opponents base
                this.player1.clickCard(this.firstLegionSnowtrooper);
                this.player1.clickCard(this.yoda);

                // Check board state
                expect(this.firstLegionSnowtrooper.exhausted).toBe(true);
                expect(this.firstLegionSnowtrooper.damage).toBe(2);
                expect(this.p2Base.damage).toBe(6);

                // Complete Yoda on death trigger
                expect(this.player2).toHaveEnabledPromptButtons(['You', 'Opponent', 'You and Opponent', 'No one']);
                this.player2.clickPrompt('You');
                expect(this.player2).toBeActivePlayer();

                // Reset state
                this.player2.passAction();
                this.firstLegionSnowtrooper.exhausted = false;

                // Case 2: Attacking base and not receiving +2/+0 and overwhelm
                this.player1.clickCard(this.firstLegionSnowtrooper);

                // Check board state
                expect(this.firstLegionSnowtrooper.exhausted).toBe(true);
                expect(this.firstLegionSnowtrooper.damage).toBe(2);
                expect(this.p2Base.damage).toBe(8);
                expect(this.player2).toBeActivePlayer();
            });
        });
    });
});
