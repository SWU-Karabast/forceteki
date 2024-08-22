describe('Entrenched', function() {
    integration(function() {
        describe('When an upgrade', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['entrenched', 'academy-training', 'resilient', 'foundling'],
                        groundArena: ['wampa'],
                        spaceArena: ['tieln-fighter']
                    },
                    player2: {
                        spaceArena: ['bright-hope#the-last-transport']
                    }
                });

                this.entrenched = this.player1.findCardByName('entrenched');
                this.academyTraining = this.player1.findCardByName('academy-training');
                this.resilient = this.player1.findCardByName('resilient');
                this.wampa = this.player1.findCardByName('wampa');
                this.tieLn = this.player1.findCardByName('tieln-fighter');
                this.brightHope = this.player2.findCardByName('bright-hope#the-last-transport');

                this.noMoreActions();
            });

            it('is played, it should be able to be attached to any ground or space unit and apply a stat bonus to it', function () {
                // upgrade attaches to friendly ground unit
                this.player1.clickCard(this.entrenched);
                expect(this.player1).toBeAbleToSelectExactly([this.wampa, this.tieLn, this.brightHope]);
                this.player1.clickCard(this.wampa);
                expect(this.wampa.upgrades).toContain(this.entrenched);
                expect(this.wampa.power).toBe(7);
                expect(this.wampa.hp).toBe(8);

                this.player2.passAction();

                // upgrade attaches to friendly space unit
                this.player1.clickCard(this.academyTraining);
                expect(this.player1).toBeAbleToSelectExactly([this.wampa, this.tieLn, this.brightHope]);
                this.player1.clickCard(this.tieLn);
                expect(this.tieLn.upgrades).toContain(this.academyTraining);
                expect(this.tieLn.power).toBe(4);
                expect(this.tieLn.hp).toBe(3);

                this.player2.passAction();

                // upgrade attaches to friendly space unit
                this.player1.clickCard(this.resilient);
                expect(this.player1).toBeAbleToSelectExactly([this.wampa, this.tieLn, this.brightHope]);
                this.player1.clickCard(this.brightHope);
                expect(this.brightHope.upgrades).toContain(this.resilient);
                expect(this.brightHope.power).toBe(2);
                expect(this.brightHope.hp).toBe(9);
            });

            it('is attached, it should stack bonuses with other applied upgrades', function () {
                // attach first upgrade
                this.player1.clickCard(this.entrenched);
                expect(this.player1).toBeAbleToSelectExactly([this.wampa, this.tieLn, this.brightHope]);
                this.player1.clickCard(this.wampa);
                expect(this.wampa.upgrades).toContain(this.entrenched);
                expect(this.wampa.power).toBe(7);
                expect(this.wampa.hp).toBe(8);

                this.player2.passAction();

                // attach second upgrade
                this.player1.clickCard(this.academyTraining);
                expect(this.player1).toBeAbleToSelectExactly([this.wampa, this.tieLn, this.brightHope]);
                this.player1.clickCard(this.wampa);
                expect(this.wampa.upgrades).toContain(this.academyTraining);
                expect(this.wampa.upgrades).toContain(this.entrenched);
                expect(this.wampa.power).toBe(9);
                expect(this.wampa.hp).toBe(10);
            });

            it('is attached, its stat bonuses should be correctly applied during combat', function () {
                // attach upgrade
                this.player1.clickCard(this.entrenched);
                expect(this.player1).toBeAbleToSelectExactly([this.wampa, this.tieLn, this.brightHope]);
                this.player1.clickCard(this.tieLn);
                expect(this.tieLn.upgrades).toContain(this.entrenched);
                expect(this.tieLn.power).toBe(5);
                expect(this.tieLn.hp).toBe(4);

                this.player2.passAction();

                // attack unit
                this.player1.clickCard(this.tieLn);
                this.player1.clickCard(this.brightHope);
                expect(this.brightHope.damage).toBe(5);
                expect(this.tieLn.damage).toBe(2);
            });

            it('is attached and the owner is defeated, the upgrade should also be defeated', function () {
                // attach upgrade
                this.player1.clickCard(this.entrenched);
                expect(this.player1).toBeAbleToSelectExactly([this.wampa, this.tieLn, this.brightHope]);
                this.player1.clickCard(this.tieLn);
                expect(this.tieLn.upgrades).toContain(this.entrenched);
                expect(this.tieLn.power).toBe(5);
                expect(this.tieLn.hp).toBe(4);

                this.tieLn.damage = 3;
                this.player2.passAction();

                // attack unit
                this.player1.clickCard(this.tieLn);
                this.player1.clickCard(this.brightHope);
                expect(this.brightHope.damage).toBe(5);
                expect(this.tieLn.location).toBe('discard');
                expect(this.entrenched.location).toBe('discard');
            });
        });
    });
});
