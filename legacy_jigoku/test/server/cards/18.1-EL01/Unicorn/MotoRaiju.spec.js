describe('Moto Raiju', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['moto-raiju']
                },
                player2: {
                    inPlay: ['moto-raiju']
                }
            });

            this.raiju = this.player1.findCardByName('moto-raiju');
            this.raiju2 = this.player2.findCardByName('moto-raiju');
            this.p1 = this.player2.findCardByName('shameful-display', 'province 1');
            this.p2 = this.player2.findCardByName('shameful-display', 'province 2');
            this.p3 = this.player2.findCardByName('shameful-display', 'province 3');
            this.p4 = this.player2.findCardByName('shameful-display', 'province 4');
            this.pStronghold = this.player2.findCardByName('shameful-display', 'stronghold province');

            this.p11 = this.player1.findCardByName('shameful-display', 'province 1');
            this.p21 = this.player1.findCardByName('shameful-display', 'province 2');
            this.p31 = this.player1.findCardByName('shameful-display', 'province 3');
            this.p41 = this.player1.findCardByName('shameful-display', 'province 4');
        });

        it('should get a bonus equal to the number of faceup provinces your opponent controls', function () {
            const baseMil = this.raiju.getMilitarySkill();

            this.p1.facedown = false;
            this.p2.facedown = false;
            this.p3.facedown = false;
            this.p4.facedown = false;
            this.pStronghold.facedown = false;

            this.p11.facedown = false;
            this.p21.facedown = false;

            this.noMoreActions();

            this.initiateConflict({
                attackers: [this.raiju],
                defenders: [this.raiju2]
            });

            this.player2.clickCard(this.raiju2);
            expect(this.raiju2.getMilitarySkill()).toBe(baseMil + 2);

            this.player1.clickCard(this.raiju);
            expect(this.raiju.getMilitarySkill()).toBe(baseMil + 5);

            expect(this.getChatLogs(10)).toContain(
                'player2 uses Moto Raiju to give itself +2military until the end of the conflict'
            );
            expect(this.getChatLogs(10)).toContain(
                'player1 uses Moto Raiju to give itself +5military until the end of the conflict'
            );
        });
    });
});
