describe('Arrows from the Woods', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['doji-diplomat', 'brash-samurai', 'isawa-tadaka']
                },
                player2: {
                    inPlay: ['kakita-yoshi', 'doji-challenger', 'adept-of-shadows', 'cautious-scout', 'daidoji-kageyu'],
                    hand: ['arrows-from-the-woods']
                }
            });

            this.brash = this.player1.findCardByName('brash-samurai');
            this.diplomat = this.player1.findCardByName('doji-diplomat');
            this.tadaka = this.player1.findCardByName('isawa-tadaka');

            this.yoshi = this.player2.findCardByName('kakita-yoshi');
            this.challenger = this.player2.findCardByName('doji-challenger');
            this.adept = this.player2.findCardByName('adept-of-shadows');
            this.scout = this.player2.findCardByName('cautious-scout');
            this.kageyu = this.player2.findCardByName('daidoji-kageyu');
            this.arrows = this.player2.findCardByName('arrows-from-the-woods');
        });

        it('gives opponents -2 mil if you control a bushi and a shinobi', function () {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.diplomat, this.tadaka],
                defenders: [this.yoshi, this.adept]
            });
            this.player2.clickCard(this.arrows);
            expect(this.diplomat.getMilitarySkill()).toBe(0);
            expect(this.diplomat.getPoliticalSkill()).toBe(1);
            expect(this.brash.getMilitarySkill()).toBe(2);
            expect(this.brash.getPoliticalSkill()).toBe(1);
            expect(this.tadaka.getMilitarySkill()).toBe(3);
            expect(this.tadaka.getPoliticalSkill()).toBe(3);
            expect(this.yoshi.getMilitarySkill()).toBe(2);
            expect(this.yoshi.getPoliticalSkill()).toBe(6);

            expect(this.getChatLogs(10)).toContain(
                'player2 plays Arrows from the Woods to give player1\'s participating characters -2military'
            );
        });

        it('gives opponents -2 mil if you control a bushi and a scout', function () {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.diplomat, this.tadaka],
                defenders: [this.yoshi, this.challenger, this.scout]
            });
            this.player2.clickCard(this.arrows);
            expect(this.diplomat.getMilitarySkill()).toBe(0);
            expect(this.brash.getMilitarySkill()).toBe(2);
            expect(this.tadaka.getMilitarySkill()).toBe(3);
            expect(this.yoshi.getMilitarySkill()).toBe(2);

            expect(this.getChatLogs(10)).toContain(
                'player2 plays Arrows from the Woods to give player1\'s participating characters -2military'
            );
        });

        it('gives opponents -1 mil if you only have a bushi', function () {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.diplomat, this.brash, this.tadaka],
                defenders: [this.yoshi, this.challenger]
            });
            this.player2.clickCard(this.arrows);
            expect(this.diplomat.getMilitarySkill()).toBe(0);
            expect(this.brash.getMilitarySkill()).toBe(1);
            expect(this.tadaka.getMilitarySkill()).toBe(4);
            expect(this.yoshi.getMilitarySkill()).toBe(2);

            expect(this.getChatLogs(10)).toContain(
                'player2 plays Arrows from the Woods to give player1\'s participating characters -1military'
            );
        });

        it('cannot be used without a bushi', function () {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.diplomat, this.brash, this.tadaka],
                defenders: [this.kageyu]
            });

            expect(this.player2).toHavePrompt('Conflict Action Window');
            this.player2.clickCard(this.arrows);
            expect(this.player2).toHavePrompt('Conflict Action Window');
        });
    });
});
