describe('Infiltrator\'s Skill', function() {
    integration(function() {
        describe('Infiltrator\'s Skill\'s ability', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'battlefield-marine', upgrades: ['infiltrators-skill'] }],
                    },
                    player2: {
                        groundArena: [{ card: 'niima-outpost-constables', upgrades: ['shield'] }]
                    }
                });
            });

            it('should ignore sentinel', function () {
                this.player1.clickCard(this.battlefieldMarine);
                expect(this.player1).toBeAbleToSelectExactly([this.niimaOutpostConstables, this.p2Base]);
                // ignore sentinel
                this.player1.clickCard(this.p2Base);
                expect(this.p2Base.damage).toBe(4);
            });

            it('should ignore shield', function () {
                this.player1.clickCard(this.battlefieldMarine);
                expect(this.player1).toBeAbleToSelectExactly([this.niimaOutpostConstables, this.p2Base]);

                // defeat shielded pyke sentinel
                this.player1.clickCard(this.niimaOutpostConstables);
                expect(this.battlefieldMarine.damage).toBe(2);
                expect(this.niimaOutpostConstables.damage).toBe(4);
                expect(this.niimaOutpostConstables.isUpgraded()).toBe(false);
            });
        });
    });
});
