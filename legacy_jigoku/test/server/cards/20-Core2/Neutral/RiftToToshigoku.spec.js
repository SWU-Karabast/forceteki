xdescribe('Rift to Toshigoku', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['aggressive-moto', 'utaku-tetsuko']
                },
                player2: {
                    inPlay: ['togashi-initiate'],
                    provinces: ['rift-to-toshigoku']
                }
            });

            this.aggressiveMoto = this.player1.findCardByName('aggressive-moto');
            this.tetsuko = this.player1.findCardByName('utaku-tetsuko');
            this.initiate = this.player2.findCardByName('togashi-initiate');
            this.riftToToshigoku = this.player2.findCardByName('rift-to-toshigoku', 'province 1');
        });

        it('a lot of stuff', function () {
            this.aggressiveMoto.fate = 1;

            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.aggressiveMoto],
                province: this.riftToToshigoku,
                type: 'military',
                ring: 'air'
            });

            expect(this.player2).toHavePrompt('Any reactions?');

            this.player2.clickCard(this.riftToToshigoku);
            this.player1.clickPrompt('No'); // Don't discard the card in the province

            expect(this.player1).toBeAbleToSelect(this.aggressiveMoto);
            expect(this.player1).not.toBeAbleToSelect(this.tetsuko);
            expect(this.player1).not.toBeAbleToSelect(this.initiate);

            this.player1.clickCard(this.aggressiveMoto);
            expect(this.aggressiveMoto.fate).toBe(0);

            // this.player2.clickPrompt('Done'); // No defenders

            expect(this.player1.claimedRings.includes('air')).toBe(false);
            expect(this.player2).toHavePrompt('Action Window');

            // expect(this.getChatLogs(5)).toContain('asdasd');
        });
    });
});
