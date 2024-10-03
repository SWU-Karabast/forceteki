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
                        groundArena: ['pyke-sentinel']
                    }
                });
            });

            it('should ignore sentinel', function () {
                this.player1.clickCard(this.battlefieldMarine);
                expect(this.player1).toBeAbleToSelectExactly([this.pykeSentinel, this.p2Base]);
            });
        });
    });
});
