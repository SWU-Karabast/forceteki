describe('Patron of the Trading Council', function () {
    integration(function () {
        describe('Static skill bonus', function () {
            beforeEach(function () {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['patron-of-the-trading-council', 'kudaka']
                    },
                    player2: {
                        inPlay: ['mantis-tenkinja']
                    }
                });

                this.patron = this.player1.findCardByName('patron-of-the-trading-council');
                this.kudaka = this.player1.findCardByName('kudaka');
                this.tenkinja = this.player2.findCardByName('mantis-tenkinja');

                this.noMoreActions();
            });

            it('gains +1/+1 while paired with Mantis', function () {
                this.initiateConflict({
                    attackers: [this.patron, this.kudaka],
                    defenders: []
                });

                expect(this.patron.militarySkill).toBe(3);
                expect(this.patron.politicalSkill).toBe(3);
            });

            it('gains +1/+1 while against Mantis', function () {
                this.initiateConflict({
                    attackers: [this.patron],
                    defenders: [this.tenkinja]
                });

                expect(this.patron.militarySkill).toBe(3);
                expect(this.patron.politicalSkill).toBe(3);
            });

            it('does not gain +1/+1 while no mantis is around', function () {
                this.initiateConflict({
                    attackers: [this.patron],
                    defenders: []
                });

                expect(this.patron.militarySkill).toBe(2);
                expect(this.patron.politicalSkill).toBe(2);
            });
        });
    });
});