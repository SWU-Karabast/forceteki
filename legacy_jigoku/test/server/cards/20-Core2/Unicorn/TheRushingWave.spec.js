describe('The Rushing Wave', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['adept-of-the-waves', 'miya-mystic'],
                    hand: ['the-rushing-wave']
                },
                player2: {
                    provinces: ['manicured-garden', 'pilgrimage', 'fertile-fields', 'entrenched-position']
                }
            });

            this.adept = this.player1.findCardByName('adept-of-the-waves');
            this.mystic = this.player1.findCardByName('miya-mystic');
            this.theRushingWave = this.player1.findCardByName('the-rushing-wave');

            this.pilgrimage = this.player2.findCardByName('pilgrimage');
            this.manicuredGarden = this.player2.findCardByName('manicured-garden');
            this.manicuredGarden.facedown = false;
        });

        it('should set the province strength to 0', function () {
            this.player1.clickCard(this.theRushingWave);
            expect(this.player1).toHavePrompt('Choose a province');
            this.player1.clickCard(this.pilgrimage);
            expect(this.pilgrimage.getStrength()).toBe(0);
            expect(this.getChatLogs(5)).toContain(
                "player1 plays The Rushing Wave to set province 2's strength to 0 until the end of the phase"
            );
            expect(this.getChatLogs(5)).toContain(
                'player1 channels their water affinity to also set the strength of Manicured Garden and province 3 to 0'
            );
        });
    });
});