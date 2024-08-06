describe('Firebrand', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['firebrand', 'isawa-tadaka']
                },
                player2: {
                    inPlay: ['solemn-scholar', 'kitsu-motso']
                }
            });

            this.firebrand = this.player1.findCardByName('firebrand');
            this.isawaTadaka = this.player1.findCardByName('isawa-tadaka');

            this.solemnScholar = this.player2.findCardByName('solemn-scholar');
            this.kitsuMotso = this.player2.findCardByName('kitsu-motso');
        });

        it('should return the fire ring and resolve the fire ring effect', function() {
            this.player1.claimRing('earth');
            this.player1.claimRing('fire');
            this.game.checkGameState(true);
            this.player1.clickCard(this.firebrand);
            expect(this.player1).not.toBeAbleToSelectRing('air');
            expect(this.player1).not.toBeAbleToSelectRing('earth');
            expect(this.player1).toBeAbleToSelectRing('fire');
            expect(this.player1).not.toBeAbleToSelectRing('void');
            expect(this.player1).not.toBeAbleToSelectRing('water');
            this.player1.clickRing('fire');

            expect(this.player1).toHavePrompt('Fire Ring');
            expect(this.player1).toHavePrompt('Choose character to honor or dishonor');

            this.player1.clickCard(this.isawaTadaka);
            this.player1.clickPrompt('Honor Isawa Tadaka');
            expect(this.isawaTadaka.isHonored).toBe(true);

            expect(this.getChatLogs(5)).toContain('player1 uses Firebrand, returning the Fire Ring to resolve the Fire Ring effect');
            expect(this.getChatLogs(5)).toContain('player1 resolves the fire ring, honoring Isawa Tadaka');
        });

        it('should not work if you don\'t have the fire ring claimed', function() {
            this.player1.claimRing('earth');
            this.game.checkGameState(true);
            expect(this.player1).toHavePrompt('Action Window');
            this.player1.clickCard(this.firebrand);
            expect(this.player1).toHavePrompt('Action Window');
        });

        it('should not work if opponent has the fire ring claimed', function() {
            this.player2.claimRing('fire');
            this.game.checkGameState(true);
            expect(this.player1).toHavePrompt('Action Window');
            this.player1.clickCard(this.firebrand);
            expect(this.player1).toHavePrompt('Action Window');
        });
    });
});
