describe('Onibi', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    hand: ['onibi']
                },
                player2: {
                    fate: 2
                }
            });
        });

        it("should allow it's controller to steal a fate", function () {
            this.onibi = this.player1.playCharacterFromHand('onibi');
            expect(this.player1).toHavePrompt('Triggered Abilities');
            this.player1.clickCard(this.onibi);
            expect(this.onibi.fate).toBe(1);
            expect(this.player2.fate).toBe(1);
        });

        it("should not allow it's controller to steal fate if the opponent has no fate", function () {
            this.player2.player.fate = 0;
            this.onibi = this.player1.playCharacterFromHand('onibi');
            expect(this.player1).not.toHavePrompt('Triggered Abilities');
        });
    });
});
