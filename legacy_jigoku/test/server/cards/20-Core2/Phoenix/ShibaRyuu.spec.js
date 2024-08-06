describe('Shiba Ryuu', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['shiba-ryuu', 'asako-togama']
                },
                player2: {
                    inPlay: ['matsu-berserker', 'akodo-toturi']
                }
            });

            this.shibaRyuu = this.player1.findCardByName('shiba-ryuu');
            this.togama = this.player1.findCardByName('asako-togama');
            this.berserker = this.player2.findCardByName('matsu-berserker');
            this.toturi = this.player2.findCardByName('akodo-toturi');
            this.noMoreActions();
        });

        it('no effect when at home', function () {
            this.initiateConflict({
                type: 'military',
                attackers: [this.togama],
                defenders: [this.berserker, this.toturi]
            });

            this.noMoreActions();

            expect(this.getChatLogs(5)).toContain('player2 won a military conflict 9 vs 2');
        });

        it('makes conflict use both skills when participating', function () {
            this.initiateConflict({
                type: 'military',
                attackers: [this.shibaRyuu, this.togama],
                defenders: [this.berserker, this.toturi]
            });

            this.noMoreActions();

            expect(this.getChatLogs(5)).toContain('player2 won a military conflict 12 vs 11');
        });
    });
});
