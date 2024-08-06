describe('Wrathstorm Dancer', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['wrathstorm-dancer', 'hida-yakamo', 'bayushi-manipulator']
                },
                player2: {
                    inPlay: ['crisis-breaker', 'hantei-sotorii'],
                }
            });

            this.dancer = this.player1.findCardByName('wrathstorm-dancer');
            this.yakamo = this.player1.findCardByName('hida-yakamo');
            this.manipulator = this.player1.findCardByName('bayushi-manipulator');

            this.breaker = this.player2.findCardByName('crisis-breaker');
            this.sotorii = this.player2.findCardByName('hantei-sotorii');

        });

        it('Should get +3 if you control another Berserker', function () {
            let baseMil = this.dancer.getMilitarySkill();

            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.dancer, this.yakamo],
                defenders: [this.sotorii]
            });

            expect(this.dancer.getMilitarySkill()).toBe(baseMil + 3);
        });

        it('Should get +3 if your opponent controls an Berserker', function () {
            let baseMil = this.dancer.getMilitarySkill();

            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.dancer, this.manipulator],
                defenders: [this.breaker]
            });

            expect(this.dancer.getMilitarySkill()).toBe(baseMil + 3);
        });

        it('Should not get +3 if no other Berserkers', function () {
            let baseMil = this.dancer.getMilitarySkill();

            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.dancer, this.manipulator],
                defenders: [this.sotorii]
            });

            expect(this.dancer.getMilitarySkill()).toBe(baseMil);
        });
    });
});
