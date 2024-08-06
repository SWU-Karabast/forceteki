describe('Insightful Gatekeeper', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['insightful-gatekeeper', 'doji-fumiki']
                },
                player2: {
                }
            });

            this.gatekeeper = this.player1.findCardByName('insightful-gatekeeper');
            this.fumiki = this.player1.findCardByName('doji-fumiki');
        });

        it('should not work outside of conflicts', function() {
            this.player2.claimRing('void');
            expect(this.gatekeeper.getMilitarySkill()).toBe(this.gatekeeper.getBaseMilitarySkill());
        });

        it('should give +2 mil when participating when opponent has more rings', function() {
            this.player2.claimRing('void');
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.gatekeeper],
                defenders: [],
                type: 'military'
            });

            expect(this.gatekeeper.getMilitarySkill()).toBe(this.gatekeeper.getBaseMilitarySkill() + 2);
        });

        it('should not give +2 mil when participating when opponent has equal rings', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.gatekeeper],
                defenders: [],
                type: 'military'
            });

            expect(this.gatekeeper.getMilitarySkill()).toBe(this.gatekeeper.getBaseMilitarySkill());
        });

        it('should not give +2 mil when participating when you have more rings', function() {
            this.player1.claimRing('void');
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.gatekeeper],
                defenders: [],
                type: 'military'
            });

            expect(this.gatekeeper.getMilitarySkill()).toBe(this.gatekeeper.getBaseMilitarySkill());
        });

        it('should give +2 mil when not participating', function() {
            this.player2.claimRing('void');
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.fumiki],
                defenders: [],
                type: 'military'
            });

            expect(this.gatekeeper.getMilitarySkill()).toBe(this.gatekeeper.getBaseMilitarySkill());
        });
    });
});
