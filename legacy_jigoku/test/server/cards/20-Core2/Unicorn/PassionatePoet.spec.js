describe('Passionate Poet', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['doji-diplomat', 'brash-samurai', 'isawa-tadaka']
                },
                player2: {
                    inPlay: ['passionate-poet']
                }
            });

            this.brash = this.player1.findCardByName('brash-samurai');
            this.diplomat = this.player1.findCardByName('doji-diplomat');
            this.tadaka = this.player1.findCardByName('isawa-tadaka');

            this.passionatePoet = this.player2.findCardByName('passionate-poet');
        });

        it('gives opponents -1 mil', function () {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.diplomat, this.tadaka, this.brash],
                defenders: [this.passionatePoet]
            });

            this.player2.clickCard(this.passionatePoet);
            expect(this.diplomat.getMilitarySkill()).toBe(0);
            expect(this.diplomat.getPoliticalSkill()).toBe(0);
            expect(this.brash.getMilitarySkill()).toBe(1);
            expect(this.brash.getPoliticalSkill()).toBe(0);
            expect(this.tadaka.getMilitarySkill()).toBe(4);
            expect(this.tadaka.getPoliticalSkill()).toBe(2);
            expect(this.passionatePoet.getMilitarySkill()).toBe(2);
            expect(this.passionatePoet.getPoliticalSkill()).toBe(2);

            expect(this.getChatLogs(10)).toContain(
                'player2 uses Passionate Poet to give all participating enemies -1military/-1political until the end of the conflict'
            );
        });
    });
});
