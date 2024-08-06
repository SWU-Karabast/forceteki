describe('Cunning Confidant', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['cunning-confidant', 'doji-fumiki']
                },
                player2: {
                }
            });

            this.confidant = this.player1.findCardByName('cunning-confidant');
            this.fumiki = this.player1.findCardByName('doji-fumiki');
        });

        it('should not work outside of conflicts', function() {
            this.player2.claimRing('void');
            expect(this.confidant.getPoliticalSkill()).toBe(this.confidant.getBasePoliticalSkill());
        });

        it('should give +2 pol when participating when opponent has more rings', function() {
            this.player2.claimRing('void');
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.confidant],
                defenders: [],
                type: 'military'
            });

            expect(this.confidant.getPoliticalSkill()).toBe(this.confidant.getBasePoliticalSkill() + 2);
        });

        it('should not give +2 pol when participating when opponent has equal rings', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.confidant],
                defenders: [],
                type: 'military'
            });

            expect(this.confidant.getPoliticalSkill()).toBe(this.confidant.getBasePoliticalSkill());
        });

        it('should not give +2 pol when participating when you have more rings', function() {
            this.player1.claimRing('void');
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.confidant],
                defenders: [],
                type: 'military'
            });

            expect(this.confidant.getPoliticalSkill()).toBe(this.confidant.getBasePoliticalSkill());
        });

        it('should give +2 pol when not participating', function() {
            this.player2.claimRing('void');
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.fumiki],
                defenders: [],
                type: 'military'
            });

            expect(this.confidant.getPoliticalSkill()).toBe(this.confidant.getBasePoliticalSkill());
        });
    });
});
