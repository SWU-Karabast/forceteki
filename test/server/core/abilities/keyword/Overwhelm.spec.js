describe('Overwhelm keyword', function() {
    integration(function() {
        describe('When a unit with the Overwhelm keyword attacks,', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['wampa']
                    },
                    player2: {
                        groundArena: [
                            'partisan-insurgent',
                            'specforce-soldier',
                            { card: 'battlefield-marine', upgrades: ['shield'] }
                        ]
                    }
                });
            });

            it('it deals any excess damage to the target\'s base', function () {
                // CASE 1: overwhelm damage applies
                this.player1.clickCard(this.wampa);
                this.player1.clickCard(this.specforceSoldier);
                expect(this.p2Base.damage).toBe(2);
                expect(this.wampa.damage).toBe(2);
                expect(this.wampa.exhausted).toBe(true);

                this.player2.passAction();
                this.wampa.damage = 0;
                this.wampa.exhausted = false;
                this.p2Base.damage = 0;

                // CASE 2: shield prevents overwhelm
                this.player1.clickCard(this.wampa);
                this.player1.clickCard(this.battlefieldMarine);
                expect(this.p2Base.damage).toBe(0);
                expect(this.battlefieldMarine.damage).toBe(0);
                expect(this.battlefieldMarine.upgraded).toBe(false);
                expect(this.wampa.damage).toBe(3);
                expect(this.wampa.exhausted).toBe(true);

                this.wampa.damage = 0;

                // CASE 3: overwhelm doesn't work when the unit is defending
                this.player2.clickCard(this.battlefieldMarine);
                this.player2.clickCard(this.wampa);
                expect(this.wampa.damage).toBe(3);
                expect(this.battlefieldMarine).toBeInLocation('discard');
                expect(this.p2Base.damage).toBe(0);
                expect(this.p1Base.damage).toBe(0);

                this.wampa.damage = 0;
                this.wampa.exhausted = false;

                // CASE 4: no overwhelm damage if attacking base
                this.player1.clickCard(this.wampa);
                this.player1.clickCard(this.p2Base);
                expect(this.p2Base.damage).toBe(4);

                this.player2.passAction();
                this.wampa.exhausted = false;
                this.p2Base.damage = 0;

                // CASE 5: no overwhelm damage if unit's hp is not exceeded
                this.player1.clickCard(this.wampa);
                this.player1.clickCard(this.partisanInsurgent);
                expect(this.p2Base.damage).toBe(0);
            });
        });
    });
});
