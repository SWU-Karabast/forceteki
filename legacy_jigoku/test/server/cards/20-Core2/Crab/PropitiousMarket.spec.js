describe('Propitious Market', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    dynastyDiscard: ['propitious-market'],
                    provinces: ['manicured-garden']
                }
            });

            this.manicured = this.player1.findCardByName('manicured-garden');
            this.propitiousMarket = this.player1.findCardByName('propitious-market');
            this.player1.placeCardInProvince(this.propitiousMarket, 'province 1');
            this.propitiousMarket.facedown = false;
        });

        it('gives fate', function () {
            const initialFate = this.player1.fate;
            this.player1.clickCard(this.propitiousMarket);
            expect(this.player1).toHavePrompt('Sacrifice Propitious Market?');
            expect(this.player1).toHavePromptButton('Yes');
            expect(this.player1).toHavePromptButton('No');

            this.player1.clickPrompt('Yes');

            expect(this.player1.fate).toBe(initialFate + 1);
            expect(this.propitiousMarket.location).toBe('dynasty discard pile');
            expect(this.getChatLogs(5)).toContain('player1 uses Propitious Market to gain 1 fate');
        });

        it('gains strength bonus based on amount of tokens', function () {
            const initialFate = this.player1.fate;
            this.player1.clickCard(this.propitiousMarket);
            expect(this.player1).toHavePrompt('Sacrifice Propitious Market?');
            expect(this.player1).toHavePromptButton('Yes');
            expect(this.player1).toHavePromptButton('No');

            this.player1.clickPrompt('No');

            expect(this.player1.fate).toBe(initialFate);
            expect(this.propitiousMarket.getTokenCount('honor')).toBe(1);
            expect(this.manicured.getStrength()).toBe(5);
            expect(this.getChatLogs(5)).toContain('player1 chooses not to sacrifice Propitious Market');
        });
    });
});
