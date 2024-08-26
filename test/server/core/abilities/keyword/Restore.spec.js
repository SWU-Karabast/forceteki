describe('Restore keyword', function() {
    integration(function() {
        describe('When a unit with the Restore keyword', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['regional-sympathizers'],
                    },
                    player2: {
                    }
                });
                this.regionalSympathizers = this.player1.findCardByName('regional-sympathizers');
                this.p1Base = this.player1.base;
                this.p2Base = this.player2.base;

                this.noMoreActions();
            });

            it('attacks, base should be healed by the restore amount', function () {
                this.p1Base.damage = 5;

                // attack resolves automatically since there's only one target (p2Base)
                this.player1.clickCard(this.regionalSympathizers);

                expect(this.p1Base.damage).toBe(3);
                expect(this.p2Base.damage).toBe(3);
                expect(this.regionalSympathizers.exhausted).toBe(true);
            });
        });

        describe('When a unit with the Restore keyword and a gained Restore ability', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'regional-sympathizers', upgrades: ['devotion'] }],
                    },
                    player2: {
                    }
                });
                this.regionalSympathizers = this.player1.findCardByName('regional-sympathizers');
                this.p1Base = this.player1.base;
                this.p2Base = this.player2.base;

                this.noMoreActions();
            });

            it('attacks, base should be healed by the cumulative restore amount', function () {
                this.p1Base.damage = 5;

                // attack resolves automatically since there's only one target (p2Base)
                this.player1.clickCard(this.regionalSympathizers);

                expect(this.p1Base.damage).toBe(1);
                expect(this.p2Base.damage).toBe(4);
                expect(this.regionalSympathizers.exhausted).toBe(true);
            });
        });
    });
});
