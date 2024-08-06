describe('Temple of the Fivefold Path', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    stronghold: 'temple-of-the-fivefold-path'
                },
                player2: {}
            });
            this.t5p = this.player1.findCardByName('temple-of-the-fivefold-path');

            this.game.rings.air.fate = 2;
            this.game.rings.earth.fate = 1;
            this.game.rings.fire.fate = 0;
            this.game.rings.void.fate = 1;
            this.game.rings.water.fate = 2;
        });

        it('puts fate on a ring', function () {
            this.player1.clickCard(this.t5p);
            this.player1.clickRing('fire');
            expect(this.game.rings.fire.fate).toBe(1);
            expect(this.getChatLogs(3)).toContain(
                'player1 uses Temple of the Fivefold Path, bowing Temple of the Fivefold Path to examine the mysteries of the Fire Ring in search for guidance, placing 1 fate on that ring'
            );
        });

        it('moves fate to a ring', function () {
            this.player1.clickCard(this.t5p);
            expect(this.player1).toHavePrompt('Choose a ring');

            this.player1.clickRing('air');
            expect(this.player1).toHavePrompt('Choose a ring to receive fate');
            this.player1.clickRing('water');
            expect(this.game.rings.water.fate).toBe(3);
            expect(this.game.rings.air.fate).toBe(1);
            expect(this.getChatLogs(3)).toContain(
                'player1 uses Temple of the Fivefold Path, bowing Temple of the Fivefold Path to examine the mysteries of the Air Ring in search for guidance'
            );
            expect(this.getChatLogs(3)).toContain('player1 moves 1 fate from Water Ring to Air Ring');
        });
    });
});