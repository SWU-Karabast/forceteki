describe('Smuggler\'s Aid', function() {
    integration(function() {
        describe('Smuggler\'s Aid\'s ability', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['smugglers-aid']
                    }
                });
            });

            it('heals base from hand', function () {
                this.p1Base.damage = 3;

                this.player1.clickCard(this.smugglersAid);
                expect(this.p1Base.damage).toBe(0);
            });
        });

        describe('Smuggler\'s Aid\'s ability', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        hand: [],
                        resources: ['smugglers-aid', 'atst', 'atst', 'atst', 'atst', 'atst']
                    }
                });
            });

            it('heals base from Smuggle', function () {
                this.p1Base.damage = 3;

                this.player1.clickCard(this.smugglersAid);
                expect(this.p1Base.damage).toBe(0);
            });
        });
    });
});
