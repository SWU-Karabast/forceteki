describe('Iaijutsu Sensei', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    fate: 20,
                    inPlay: ['iaijutsu-sensei', 'brash-samurai'],
                    hand: ['fine-katana', 'kakita-blade']
                },
                player2: {
                    inPlay: ['kakita-toshimoko']
                }
            });

            this.sensei = this.player1.findCardByName('iaijutsu-sensei');
            this.brash = this.player1.findCardByName('brash-samurai');
            this.katana = this.player1.findCardByName('fine-katana');
            this.blade = this.player1.findCardByName('kakita-blade');
            this.toshimoko = this.player2.findCardByName('kakita-toshimoko');
        });

        it('should get +1/+1 if it has a single weapon', function () {
            let baseMil = this.sensei.getMilitarySkill();
            let basePol = this.sensei.getPoliticalSkill();

            this.player1.playAttachment(this.katana, this.sensei);
            expect(this.sensei.getMilitarySkill()).toBe(baseMil + 3);
            expect(this.sensei.getPoliticalSkill()).toBe(basePol + 1);

            this.player2.pass();
            this.player1.playAttachment(this.blade, this.sensei);
            expect(this.sensei.getMilitarySkill()).toBe(baseMil + 4);
            expect(this.sensei.getPoliticalSkill()).toBe(basePol + 0);
        });

        it('should not give +1/+1 to other characters', function () {
            let baseMil = this.toshimoko.getMilitarySkill();
            let basePol = this.toshimoko.getPoliticalSkill();

            this.player1.playAttachment(this.katana, this.toshimoko);
            expect(this.toshimoko.getMilitarySkill()).toBe(baseMil + 2);
            expect(this.toshimoko.getPoliticalSkill()).toBe(basePol + 0);
        });

        it('duel should prevent contribution from loser', function () {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.sensei, this.brash],
                defenders: [this.toshimoko]
            });

            this.player2.pass();
            this.player1.clickCard(this.sensei);
            this.player1.clickCard(this.toshimoko);

            expect(this.player1).toHavePrompt('Honor Bid');
            this.player1.clickPrompt('5');
            this.player2.clickPrompt('1');

            expect(this.getChatLogs(10)).toContain(
                'Duel Effect: prevent Kakita Toshimoko from contributing to resolution of this conflict'
            );
            expect(this.getChatLogs(10)).toContain('Military Air conflict - Attacker: 6 Defender: 0');
        });

        it('duel should prevent contribution from loser', function () {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.sensei, this.brash],
                defenders: [this.toshimoko]
            });

            this.player2.pass();
            this.player1.clickCard(this.sensei);
            this.player1.clickCard(this.toshimoko);

            expect(this.player1).toHavePrompt('Honor Bid');
            this.player1.clickPrompt('1');
            this.player2.clickPrompt('4');

            expect(this.getChatLogs(10)).toContain(
                'Duel Effect: prevent Iaijutsu Sensei from contributing to resolution of this conflict'
            );
            expect(this.getChatLogs(10)).toContain('Military Air conflict - Attacker: 2 Defender: 4');
        });
    });
});
