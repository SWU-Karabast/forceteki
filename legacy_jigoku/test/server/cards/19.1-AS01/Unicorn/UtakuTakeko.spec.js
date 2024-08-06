describe('Utaku Takeko', function () {
    integration(function () {
        describe('action ability', function () {
            beforeEach(function () {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: [
                            'utaku-takeko',
                            'moto-youth',
                            'border-rider',
                            'moto-ariq',
                            'akodo-toturi-2',
                            'shinjo-yasamura'
                        ]
                    }
                });

                this.utakuTakeko = this.player1.findCardByName('utaku-takeko');
                this.motoYouth = this.player1.moveCard('moto-youth', 'dynasty deck');
                this.borderRider = this.player1.moveCard('border-rider', 'dynasty deck');
                this.motoAriq = this.player1.moveCard('moto-ariq', 'dynasty deck');
                this.akodoToturi = this.player1.moveCard('akodo-toturi-2', 'dynasty deck');
                this.yasamura = this.player1.moveCard('shinjo-yasamura', 'dynasty deck');
            });

            it('should allow you to pick a 1 glory or higher unicorn character from your dynasty discard pile and play it', function () {
                this.player1.clickCard(this.utakuTakeko);

                expect(this.player1).toHavePrompt('Select a character to play');
                expect(this.player1).toHavePromptButton(this.motoYouth.name); //Unicorn with 1 glory
                expect(this.player1).toHavePromptButton(this.borderRider.name); //Unicorn with 1 glory
                expect(this.player1).not.toHavePromptButton(this.motoAriq.name); //Unicorn with 0 glory
                expect(this.player1).not.toHavePromptButton(this.akodoToturi.name); // not a unicorn
                expect(this.player1).not.toHavePromptButton(this.yasamura.name); // unicorn with 1 glory but unique

                const initialPLayerFate = this.player1.fate;
                this.player1.clickPrompt(this.borderRider.name);
                expect(this.player1).toHavePrompt('Choose additional fate');
                this.player1.clickPrompt('1');

                expect(this.player1.fate).toBe(initialPLayerFate - 3); // 2 fate base + 1 extra fate placed
                expect(this.borderRider.location).toBe('play area');
                expect(this.getChatLogs(5)).toContain('Utaku Takeko recalls a distant relative who is a Border Rider');
            });

            it('should allow you to pick a 1 glory or higher unicorn character from your dynasty discard pile and play it at home during a conflict', function () {
                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.utakuTakeko],
                    defenders: [],
                    type: 'political',
                    ring: 'air'
                });

                this.player2.pass();
                this.player1.clickCard(this.utakuTakeko);

                expect(this.player1).toHavePrompt('Select a character to play');
                expect(this.player1).toHavePromptButton(this.motoYouth.name); //Unicorn with 1 glory
                expect(this.player1).toHavePromptButton(this.borderRider.name); //Unicorn with 1 glory
                expect(this.player1).not.toHavePromptButton(this.motoAriq.name); //Unicorn with 0 glory
                expect(this.player1).not.toHavePromptButton(this.akodoToturi.name); // not a unicorn
                expect(this.player1).not.toHavePromptButton(this.yasamura.name); // unicorn with 1 glory but unique

                const initialPLayerFate = this.player1.fate;
                this.player1.clickPrompt(this.borderRider.name);
                expect(this.player1).toHavePrompt('Choose additional fate');
                this.player1.clickPrompt('1');

                expect(this.player1.fate).toBe(initialPLayerFate - 3); // 2 fate base + 1 extra fate placed
                expect(this.borderRider.location).toBe('play area');
                expect(this.getChatLogs(5)).toContain('Utaku Takeko recalls a distant relative who is a Border Rider');
                expect(this.borderRider.isParticipating()).toBe(false);
            });
        });
    });
});
