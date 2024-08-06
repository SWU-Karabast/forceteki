describe('Serene Ise Zumi', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                fate: 10,
                phase: 'conflict',
                player1: {
                    inPlay: ['doji-challenger'],
                    hand: ['serene-ise-zumi', 'noble-sacrifice', 'let-go']
                }
            });

            this.challenger = this.player1.findCardByName('doji-challenger');
            this.sereneIseZumi = this.player1.findCardByName('serene-ise-zumi');
            this.letGo = this.player1.findCardByName('let-go');
            this.nobleSac = this.player1.findCardByName('noble-sacrifice');
        });
        describe('Serene Ise Zumi as a character', function() {
            it('should cost 3 fate', function() {
                const playerfate = this.player1.fate;
                this.player1.clickCard(this.sereneIseZumi);

                expect(this.player1).toHavePrompt('Serene Ise Zumi');
                expect(this.player1).toHavePromptButton('Play this character');
                expect(this.player1).toHavePromptButton('Play Serene Ise Zumi as an attachment');

                this.player1.clickPrompt('Play this character');
                this.player1.clickPrompt('0');

                expect(this.sereneIseZumi.location).toBe('play area');
                expect(this.sereneIseZumi.type).toBe('character');
                expect(this.player1.fate).toBe(playerfate - 3);
            });

            it('should have sincerity', function() {
                this.player1.clickCard(this.sereneIseZumi);

                expect(this.player1).toHavePrompt('Serene Ise Zumi');
                expect(this.player1).toHavePromptButton('Play this character');
                expect(this.player1).toHavePromptButton('Play Serene Ise Zumi as an attachment');

                this.player1.clickPrompt('Play this character');
                this.player1.clickPrompt('0');

                this.sereneIseZumi.honor();
                this.challenger.dishonor();

                this.player2.pass();
                this.player1.clickCard(this.nobleSac);
                this.player1.clickCard(this.challenger);
                this.player1.clickCard(this.sereneIseZumi);

                expect(this.sereneIseZumi.location).toBe('conflict discard pile');
                expect(this.challenger.location).toBe('dynasty discard pile');

                expect(this.getChatLogs(5)).toContain('player1 draws a card due to Serene Ise Zumi\'s Sincerity');
            });

            it('should have not have the ability to move home during a conflict', function() {
                this.player1.clickCard(this.sereneIseZumi);

                expect(this.player1).toHavePrompt('Serene Ise Zumi');
                expect(this.player1).toHavePromptButton('Play this character');
                expect(this.player1).toHavePromptButton('Play Serene Ise Zumi as an attachment');

                this.player1.clickPrompt('Play this character');
                this.player1.clickPrompt('0');

                this.noMoreActions();

                this.initiateConflict({
                    attackers: [this.sereneIseZumi],
                    defenders: []
                });

                this.player2.pass();
                this.player1.clickCard(this.sereneIseZumi);
                expect(this.sereneIseZumi.isParticipating()).toBe(true);
            });
        });
        describe('Serene Ise Zumi as an attachment', function() {
            it('should cost 1 fate', function() {
                const playerfate = this.player1.fate;
                this.player1.clickCard(this.sereneIseZumi);

                expect(this.player1).toHavePrompt('Serene Ise Zumi');
                expect(this.player1).toHavePromptButton('Play this character');
                expect(this.player1).toHavePromptButton('Play Serene Ise Zumi as an attachment');

                this.player1.clickPrompt('Play Serene Ise Zumi as an attachment');
                this.player1.clickCard(this.challenger);

                expect(this.sereneIseZumi.location).toBe('play area');
                expect(this.sereneIseZumi.type).toBe('attachment');
                expect(this.sereneIseZumi.parent).toBe(this.challenger);
                expect(this.player1.fate).toBe(playerfate - 1);
            });

            it('should not have sincerity', function() {
                this.player1.clickCard(this.sereneIseZumi);

                expect(this.player1).toHavePrompt('Serene Ise Zumi');
                expect(this.player1).toHavePromptButton('Play this character');
                expect(this.player1).toHavePromptButton('Play Serene Ise Zumi as an attachment');

                this.player1.clickPrompt('Play Serene Ise Zumi as an attachment');
                this.player1.clickCard(this.challenger);

                this.player2.pass();
                this.player1.clickCard(this.letGo);
                expect(this.player1).toBeAbleToSelect(this.sereneIseZumi);

                this.player1.clickCard(this.sereneIseZumi);

                expect(this.sereneIseZumi.location).toBe('conflict discard pile');
                expect(this.getChatLogs(10)).not.toContain('player1 draws a card due to Serene Ise Zumi\'s Sincerity');
            });

            it('should give the attached character the ability to move home from a conflict', function() {
                this.player1.clickCard(this.sereneIseZumi);

                expect(this.player1).toHavePrompt('Serene Ise Zumi');
                expect(this.player1).toHavePromptButton('Play this character');
                expect(this.player1).toHavePromptButton('Play Serene Ise Zumi as an attachment');

                this.player1.clickPrompt('Play Serene Ise Zumi as an attachment');
                this.player1.clickCard(this.challenger);

                this.noMoreActions();

                this.initiateConflict({
                    attackers: [this.challenger],
                    defenders: []
                });

                this.player2.pass();
                this.player1.clickCard(this.sereneIseZumi);
                expect(this.challenger.isParticipating()).toBe(false);
            });
        });
    });
});
