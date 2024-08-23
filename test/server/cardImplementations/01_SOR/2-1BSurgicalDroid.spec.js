describe('2-1B Surgical Droid', function() {
    integration(function() {
        describe('2-1B Surgical Droid\'s healing', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: [
                            { card: '21b-surgical-droid' },
                            { card: 'r2d2#ignoring-protocol', damage: 3 },
                            { card: 'c3po#protocol-droid', damage: 1 }],
                    },
                    player2: {
                        groundArena: [{ card: 'wampa', damage: 2 }]
                    }
                });

                this.surgicalDroid = this.player1.findCardByName('21b-surgical-droid');
                this.r2d2 = this.player1.findCardByName('r2d2#ignoring-protocol');
                this.c3p0 = this.player1.findCardByName('c3po#protocol-droid');

                this.wampa = this.player2.findCardByName('wampa');

                this.p1Base = this.player1.base;
                this.p2Base = this.player2.base;

                this.noMoreActions();
            });

            it('surgical droid should heal c3p0 to full', function () {
                // Attack
                this.player1.clickCard(this.surgicalDroid);
                expect(this.surgicalDroid.location).toBe('ground arena');
                expect(this.player1).toBeAbleToSelectExactly([this.p2Base, this.wampa]);
                this.player1.clickCard(this.p2Base);

                // Healing Target
                expect(this.player1).toBeAbleToSelectExactly([this.r2d2, this.c3p0, this.wampa]);
                this.player1.clickCard(this.c3p0);

                // Confirm Results
                expect(this.surgicalDroid.exhausted).toBe(true);
                expect(this.c3p0.damage).toBe(0);
            });

            it('surgical droid should heal r2d2 to 1', function () {
                // Attack
                this.player1.clickCard(this.surgicalDroid);
                expect(this.surgicalDroid.location).toBe('ground arena');
                expect(this.player1).toBeAbleToSelectExactly([this.p2Base, this.wampa]);
                this.player1.clickCard(this.p2Base);

                // Healing Target
                expect(this.player1).toBeAbleToSelectExactly([this.r2d2, this.c3p0, this.wampa]);
                this.player1.clickCard(this.r2d2);

                // Confirm Results
                expect(this.surgicalDroid.exhausted).toBe(true);
                expect(this.r2d2.damage).toBe(1);
            });

            it('surgical droid should heal enemy unit', function () {
                // Attack
                this.player1.clickCard(this.surgicalDroid);
                expect(this.wampa.damage).toBe(2);
                expect(this.surgicalDroid.location).toBe('ground arena');
                expect(this.player1).toBeAbleToSelectExactly([this.p2Base, this.wampa]);
                this.player1.clickCard(this.p2Base);

                // Healing Target
                expect(this.player1).toBeAbleToSelectExactly([this.r2d2, this.c3p0, this.wampa]);
                this.player1.clickCard(this.wampa);

                // Confirm Results
                expect(this.surgicalDroid.exhausted).toBe(true);
                expect(this.wampa.damage).toBe(0);
            });

            it('surgical droid ability can be passed', function () {
                expect(this.r2d2.damage).toBe(3);
                this.player1.clickCard(this.surgicalDroid);
                this.player1.clickCard(this.p2Base);

                this.player1.clickPrompt('Pass ability');
                expect(this.surgicalDroid.exhausted).toBe(true);
                expect(this.r2d2.damage).toBe(3);
            });
        });
    });
});
