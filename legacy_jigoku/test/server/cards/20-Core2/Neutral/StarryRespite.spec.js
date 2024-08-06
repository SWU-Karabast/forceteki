describe('Starry Respite', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['aggressive-moto', 'worldly-shiotome', 'utaku-tetsuko']
                },
                player2: {
                    inPlay: ['togashi-initiate', 'togashi-yokuni'],
                    provinces: ['starry-respite']
                }
            });

            this.aggressiveMoto = this.player1.findCardByName('aggressive-moto');
            this.wordlyShiotome = this.player1.findCardByName('worldly-shiotome');
            this.tetsuko = this.player1.findCardByName('utaku-tetsuko');

            this.initiate = this.player2.findCardByName('togashi-initiate');
            this.yokuni = this.player2.findCardByName('togashi-yokuni');

            this.starryRespite = this.player2.findCardByName('starry-respite', 'province 1');
        });

        it('honors a participating character', function () {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.aggressiveMoto],
                defenders: [this.yokuni],
                province: this.starryRespite
            });

            this.player2.clickCard(this.starryRespite);
            expect(this.player2).toBeAbleToSelect(this.aggressiveMoto);
            expect(this.player2).toBeAbleToSelect(this.yokuni);
            expect(this.player2).not.toBeAbleToSelect(this.wordlyShiotome);
            expect(this.player2).not.toBeAbleToSelect(this.initiate);
            expect(this.player2).not.toBeAbleToSelect(this.tetsuko);

            this.player2.clickCard(this.yokuni);
            expect(this.yokuni.isHonored).toBe(true);
            expect(this.getChatLogs(3)).toContain('player2 uses Starry Respite to honor Togashi Yokuni');
        });
    });
});
