describe('Capture the False Eye', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['akodo-toturi'],
                    hand: ['capture-the-false-eye', 'a-perfect-cut']
                },
                player2: {
                    inPlay: ['doji-kuwanan']
                }
            });

            this.toturi = this.player1.findCardByName('akodo-toturi');
            this.captureTheFalseEye = this.player1.findCardByName('capture-the-false-eye');
            this.perfectCut = this.player1.findCardByName('a-perfect-cut');

            this.kuwanan = this.player2.findCardByName('doji-kuwanan');
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.toturi],
                defenders: [this.kuwanan]
            });
            this.player2.pass();
        });

        it('bows the target and makes other events expensive', function () {
            const initialFate = this.player1.fate;

            this.player1.clickCard(this.captureTheFalseEye);
            this.player1.clickCard(this.kuwanan);

            expect(this.kuwanan.bowed).toBe(true);
            expect(this.getChatLogs(5)).toContain(
                "player1 plays Capture the False Eye to bow Doji Kuwanan. For this conflict, player1's events cost 1 more fate - did player1 walk into a trap?"
            );
            expect(this.player1.fate).toBe(initialFate - 1);

            this.player2.pass();
            this.player1.clickCard(this.perfectCut);
            this.player1.clickCard(this.toturi);
            expect(this.player1.fate).toBe(initialFate - 2);
        });
    });
});
