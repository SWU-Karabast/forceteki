describe('First Legion Snow Trooper', function() {
    integration(function() {
        describe('First Legion Snow Trooper while attacking non-damaged unit.', function() {
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

            it(' Ability should do nothing', function () {
                this.player1.clickCard(this.firstLegionSnowtrooper);
                this.player1.clickCard(this.yodaOldMaster);
                expect(this.firstLegionSnowtrooper.exhausted).toBe(true);
                expect(this.firstLegionSnowtrooper.damage).toBe(2);
                expect(this.yodaOldMaster.damage).toBe(2);
                expect(this.player2).toBeActivePlayer();
            });
        });
        describe('First Legion Snow Trooper with a damaged enemy unit.', function() {
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

            it('First legion Snowtrooper should receive overwhelm and +2/+0, defeating yoda and dealing 1 damage to opponents base.', function () {
                this.player1.clickCard(this.firstLegionSnowtrooper);
                this.player1.clickCard(this.yoda);
                expect(this.firstLegionSnowtrooper.exhausted).toBe(true);
                expect(this.firstLegionSnowtrooper.damage).toBe(2);
                expect(this.p2Base.damage).toBe(6);
                expect(this.player2).toHaveEnabledPromptButtons(['You', 'Opponent', 'You and Opponent', 'No one']);
                this.player2.clickPrompt('You');
                expect(this.player2).toBeActivePlayer();
            });

            it('First legion Snowtrooper attacking base and should not receive +2/+0 and overwhelm.', function () {
                this.player1.clickCard(this.firstLegionSnowtrooper);
                this.player1.clickCard(this.p2Base);
                expect(this.firstLegionSnowtrooper.exhausted).toBe(true);
                expect(this.firstLegionSnowtrooper.damage).toBe(0);
                expect(this.p2Base.damage).toBe(7);
                expect(this.player2).toBeActivePlayer();
            });
        });
        describe('First Legion Snow Trooper with a damaged enemy unit.', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'first-legion-snowtrooper', upgrades: ['experience'] }],
                    },
                    player2: {
                        groundArena: [{ card: 'yoda#old-master', damage: 1 }],
                        base: { card: 'dagobah-swamp', damage: 5 }
                    }
                });
            });

            it('First legion Snowtrooper attacking yoda and should receive +2/+0, overwhelm +1/+1 from experience upgrade. Defeating Yoda and dealing 2 to base', function () {
                this.player1.clickCard(this.firstLegionSnowtrooper);
                expect(this.firstLegionSnowtrooper.getPower()).toBe(3);
                this.player1.clickCard(this.yoda);
                expect(this.firstLegionSnowtrooper.exhausted).toBe(true);
                expect(this.firstLegionSnowtrooper.damage).toBe(2);
                expect(this.p2Base.damage).toBe(7);
                expect(this.player2).toHaveEnabledPromptButtons(['You', 'Opponent', 'You and Opponent', 'No one']);
                this.player2.clickPrompt('You');
                expect(this.player2).toBeActivePlayer();
            });
        });
    });
});
