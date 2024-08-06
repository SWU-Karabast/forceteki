describe('Shrine of Vengeance', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['moto-horde'],
                    provinces: ['pilgrimage', 'manicured-garden']
                },
                player2: {
                    provinces: ['shrine-of-vengeance', 'fertile-fields']
                }
            });
            this.horde = this.player1.findCardByName('moto-horde');
            this.pilgrimage = this.player1.findCardByName('pilgrimage');
            this.manicured = this.player1.findCardByName('manicured-garden');
            this.manicured.facedown = false;

            this.shrineToVengeance = this.player2.findCardByName('shrine-of-vengeance');
            this.fertileFields = this.player2.findCardByName('fertile-fields');

            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                province: this.shrineToVengeance,
                attackers: [this.horde],
                defenders: []
            });
        });

        it('blanks and reveal a province', function () {
            this.noMoreActions();
            expect(this.player2).toHavePrompt('Triggered Abilities');

            this.player2.clickCard(this.shrineToVengeance);
            expect(this.player2).toHavePrompt('Choose a province');
            expect(this.player2).not.toBeAbleToSelect(this.manicured);
            expect(this.player2).toBeAbleToSelect(this.pilgrimage);
            expect(this.player2).toBeAbleToSelect(this.fertileFields);

            this.player2.clickCard(this.pilgrimage);

            expect(this.pilgrimage.isDishonored).toBe(true);
            expect(this.pilgrimage.facedown).toBe(false);

            expect(this.getChatLogs(5)).toContain(
                'player2 uses Shrine of Vengeance to place a dishonored status token on province 1, blanking it'
            );
            expect(this.getChatLogs(5)).toContain('player2 reveals Pilgrimage due to Shrine of Vengeance');
            expect(this.getChatLogs(5)).toContain('player1 has broken Shrine of Vengeance!');
        });
    });
});