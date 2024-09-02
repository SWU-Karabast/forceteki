describe('2-1B Surgical Droid', function() {
    integration(function() {
        describe('2-1B Surgical Droid\'s ability', function() {
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
            });

            it('should heal a target with 1 damage to full', function () {
                // Attack
                this.player1.clickCard(this._21bSurgicalDroid);
                expect(this._21bSurgicalDroid).toBeInLocation('ground arena');
                expect(this.player1).toBeAbleToSelectExactly([this.p2Base, this.wampa]);
                this.player1.clickCard(this.p2Base);

                // Healing Target
                expect(this.player1).toBeAbleToSelectExactly([this.r2d2, this.c3po, this.wampa]);
                this.player1.clickCard(this.c3po);

                // Confirm Results
                expect(this._21bSurgicalDroid.exhausted).toBe(true);
                expect(this.c3po.damage).toBe(0);
            });

            it('should heal 2 damage from a unit', function () {
                // Attack
                this.player1.clickCard(this._21bSurgicalDroid);
                expect(this._21bSurgicalDroid).toBeInLocation('ground arena');
                expect(this.player1).toBeAbleToSelectExactly([this.p2Base, this.wampa]);
                this.player1.clickCard(this.p2Base);

                // Healing Target
                expect(this.player1).toBeAbleToSelectExactly([this.r2d2, this.c3po, this.wampa]);
                this.player1.clickCard(this.r2d2);

                // Confirm Results
                expect(this._21bSurgicalDroid.exhausted).toBe(true);
                expect(this.r2d2.damage).toBe(1);
            });

            it('should be able to heal an enemy unit', function () {
                // Attack
                this.player1.clickCard(this._21bSurgicalDroid);
                expect(this.wampa.damage).toBe(2);
                expect(this._21bSurgicalDroid).toBeInLocation('ground arena');
                expect(this.player1).toBeAbleToSelectExactly([this.p2Base, this.wampa]);
                this.player1.clickCard(this.p2Base);

                // Healing Target
                expect(this.player1).toBeAbleToSelectExactly([this.r2d2, this.c3po, this.wampa]);
                this.player1.clickCard(this.wampa);

                // Confirm Results
                expect(this._21bSurgicalDroid.exhausted).toBe(true);
                expect(this.wampa.damage).toBe(0);
            });

            it('should be able to be passed', function () {
                expect(this.r2d2.damage).toBe(3);
                this.player1.clickCard(this._21bSurgicalDroid);
                this.player1.clickCard(this.p2Base);

                this.player1.clickPrompt('Pass ability');
                expect(this._21bSurgicalDroid.exhausted).toBe(true);
                expect(this.r2d2.damage).toBe(3);
            });
        });
    });
});
