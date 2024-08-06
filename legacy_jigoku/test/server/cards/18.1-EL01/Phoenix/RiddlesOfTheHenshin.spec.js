describe('Riddles of the Henshin', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['ancient-master', 'asako-azunami', 'togashi-initiate'],
                    hand: ['riddles-of-the-henshin']
                },
                player2: {
                    inPlay: ['doji-whisperer', 'brash-samurai'],
                    hand: []
                }
            });
            this.master = this.player1.findCardByName('ancient-master');
            this.initiate = this.player1.findCardByName('togashi-initiate');
            this.azunami = this.player1.findCardByName('asako-azunami');
            this.brash = this.player2.findCardByName('brash-samurai');
            this.whisperer = this.player2.findCardByName('doji-whisperer');
            this.riddles = this.player1.findCardByName('riddles-of-the-henshin');
        });

        it('should prompt you to pick claimed rings', function () {
            this.player1.claimRing('air');
            this.player1.claimRing('fire');
            this.player1.claimRing('earth');
            this.player1.claimRing('void');

            this.player1.clickCard(this.riddles);
            expect(this.player1).toHavePrompt('Choose the first ring to resolve');
            expect(this.player1).toBeAbleToSelectRing('air');
            expect(this.player1).toBeAbleToSelectRing('earth');
            expect(this.player1).toBeAbleToSelectRing('fire');
            expect(this.player1).toBeAbleToSelectRing('void');
            expect(this.player1).not.toBeAbleToSelectRing('water');

            this.player1.clickRing('fire');

            expect(this.player1).toHavePrompt('Choose the second ring to resolve');
            expect(this.player1).toBeAbleToSelectRing('air');
            expect(this.player1).toBeAbleToSelectRing('earth');
            expect(this.player1).not.toBeAbleToSelectRing('fire');
            expect(this.player1).toBeAbleToSelectRing('void');
            expect(this.player1).not.toBeAbleToSelectRing('water');
            expect(this.player1).toHavePromptButton('Done');

            this.player1.clickRing('air');

            expect(this.player1).toHavePrompt('Fire Ring');
            this.player1.clickCard(this.brash);
            this.player1.clickPrompt('Dishonor Brash Samurai');
            expect(this.player1).toHavePrompt('Air Ring');
            this.player1.clickPrompt('Gain 2 Honor');
            expect(this.getChatLogs(5)).toContain('player1 plays Riddles of the Henshin to resolve ring effects');
            expect(this.getChatLogs(5)).toContain('player1 resolves Fire Ring and Air Ring');
            expect(this.getChatLogs(5)).toContain('player1 resolves the fire ring, dishonoring Brash Samurai');
            expect(this.getChatLogs(5)).toContain('player1 resolves the air ring, gaining 2 honor');

            expect(this.player2).toHavePrompt('Action Window');
        });

        it('should resolve if you cancel mid-prompt', function () {
            this.player1.claimRing('air');
            this.player1.claimRing('fire');
            this.player1.claimRing('earth');
            this.player1.claimRing('void');

            this.player1.clickCard(this.riddles);
            expect(this.player1).toHavePrompt('Choose the first ring to resolve');
            expect(this.player1).toBeAbleToSelectRing('air');
            expect(this.player1).toBeAbleToSelectRing('earth');
            expect(this.player1).toBeAbleToSelectRing('fire');
            expect(this.player1).toBeAbleToSelectRing('void');
            expect(this.player1).not.toBeAbleToSelectRing('water');

            this.player1.clickRing('fire');

            expect(this.player1).toBeAbleToSelectRing('air');
            expect(this.player1).toBeAbleToSelectRing('earth');
            expect(this.player1).not.toBeAbleToSelectRing('fire');
            expect(this.player1).toBeAbleToSelectRing('void');
            expect(this.player1).not.toBeAbleToSelectRing('water');
            expect(this.player1).toHavePromptButton('Done');

            this.player1.clickPrompt('Done');

            expect(this.player1).toHavePrompt('Fire Ring');
            this.player1.clickCard(this.brash);
            this.player1.clickPrompt('Dishonor Brash Samurai');
            expect(this.getChatLogs(5)).toContain('player1 plays Riddles of the Henshin to resolve ring effects');
            expect(this.getChatLogs(5)).toContain('player1 resolves Fire Ring');
            expect(this.getChatLogs(5)).toContain('player1 resolves the fire ring, dishonoring Brash Samurai');

            expect(this.player2).toHavePrompt('Action Window');
        });

        it('should allow ring replacement effects', function () {
            this.player1.claimRing('water');
            this.player1.clickCard(this.riddles);
            this.player1.clickRing('water');
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.azunami);
            this.player1.clickCard(this.azunami);
            expect(this.player1).toHavePrompt('Asako Azunami');
        });

        it('should not be playable if you have no claimed rings', function () {
            expect(this.player1).toHavePrompt('Action Window');
            this.player1.clickCard(this.riddles);
            expect(this.player1).toHavePrompt('Action Window');
        });
    });
});