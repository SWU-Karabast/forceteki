describe('The Scorpion Clan Coup', function() {
    integration(function() {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['doji-kuwanan', 'kakita-yoshi']
                },
                player2: {
                    inPlay: ['doji-challenger'],
                    dynastyDiscard: ['bayushi-kachiko-2'],
                    provinces: ['the-scorpion-clan-coup']
                }
            });

            this.yoshi = this.player1.findCardByName('kakita-yoshi');
            this.kuwanan = this.player1.findCardByName('doji-kuwanan');

            this.challenger = this.player2.findCardByName('doji-challenger');
            this.kachiko = this.player2.findCardByName('bayushi-kachiko-2');

            this.p1 = this.player2.findCardByName('the-scorpion-clan-coup');
            this.p2 = this.player2.findCardByName('shameful-display', 'province 2');
            this.p3 = this.player2.findCardByName('shameful-display', 'province 3');
            this.p4 = this.player2.findCardByName('shameful-display', 'province 4');

            this.player1p1 = this.player1.findCardByName('shameful-display', 'province 1');
        });

        it('should give opponent\'s participating characters -1/-1 during a conflict at itself if you have an imperial card', function () {
            this.player2.moveCard(this.kachiko, 'play area');

            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.kuwanan],
                defenders: [this.challenger],
                province: this.p1
            });

            expect(this.kuwanan.getMilitarySkill()).toBe(5 - 1);
            expect(this.kuwanan.getPoliticalSkill()).toBe(4 - 1);

            expect(this.challenger.getMilitarySkill()).toBe(3);
            expect(this.challenger.getPoliticalSkill()).toBe(3);

            expect(this.yoshi.getMilitarySkill()).toBe(2);
            expect(this.yoshi.getPoliticalSkill()).toBe(6);
        });

        it('should not work if you don\'t have an imperial card', function () {
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.kuwanan],
                defenders: [this.challenger],
                province: this.p1
            });

            expect(this.kuwanan.getMilitarySkill()).toBe(5);
            expect(this.kuwanan.getPoliticalSkill()).toBe(4);

            expect(this.challenger.getMilitarySkill()).toBe(3);
            expect(this.challenger.getPoliticalSkill()).toBe(3);

            expect(this.yoshi.getMilitarySkill()).toBe(2);
            expect(this.yoshi.getPoliticalSkill()).toBe(6);
        });

        it('should work during a conflict at another province if faceup', function () {
            this.p1.facedown = false;
            this.player2.moveCard(this.kachiko, 'play area');

            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.kuwanan],
                defenders: [this.challenger],
                province: this.p2
            });

            expect(this.kuwanan.getMilitarySkill()).toBe(5 - 1);
            expect(this.kuwanan.getPoliticalSkill()).toBe(4 - 1);

            expect(this.challenger.getMilitarySkill()).toBe(3);
            expect(this.challenger.getPoliticalSkill()).toBe(3);

            expect(this.yoshi.getMilitarySkill()).toBe(2);
            expect(this.yoshi.getPoliticalSkill()).toBe(6);
        });

        it('should not work if facedown', function () {
            this.p1.facedown = true;
            this.player2.moveCard(this.kachiko, 'play area');

            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.kuwanan],
                defenders: [this.challenger],
                province: this.p2
            });

            expect(this.kuwanan.getMilitarySkill()).toBe(5);
            expect(this.kuwanan.getPoliticalSkill()).toBe(4);

            expect(this.challenger.getMilitarySkill()).toBe(3);
            expect(this.challenger.getPoliticalSkill()).toBe(3);

            expect(this.yoshi.getMilitarySkill()).toBe(2);
            expect(this.yoshi.getPoliticalSkill()).toBe(6);
        });

        it('should not work on attack', function () {
            this.player2.moveCard(this.kachiko, 'play area');
            this.noMoreActions();
            this.player1.passConflict();

            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.kachiko],
                defenders: [this.kuwanan],
                province: this.player1p1
            });

            expect(this.kuwanan.getMilitarySkill()).toBe(5);
            expect(this.kuwanan.getPoliticalSkill()).toBe(4);
        });
    });
});
