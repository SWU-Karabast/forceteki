describe('Village Doshin', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['mirumoto-raitsugu'],
                    hand: ['fine-katana', 'dragon-s-fang', 'dragon-s-claw', 'village-doshin']
                },
                player2: {
                    inPlay: ['keeper-initiate'],
                    dynastyDiscard: ['chukan-nobue'],
                    hand: ['let-go', 'clarity-of-purpose', 'against-the-waves']
                }
            });

            this.raitsugu = this.player1.findCardByName('mirumoto-raitsugu');

            this.dragonsClaw = this.player1.findCardByName('dragon-s-claw');
            this.dragonsFang = this.player1.findCardByName('dragon-s-fang');
            this.fineKatana = this.player1.findCardByName('fine-katana');
            this.villageDoshin = this.player1.findCardByName('village-doshin');

            this.keeperInitiate = this.player2.findCardByName('keeper-initiate');
            this.chukanNobue = this.player2.findCardByName('chukan-nobue');
            this.letGo = this.player2.findCardByName('let-go');
            this.clarity = this.player2.findCardByName('clarity-of-purpose');
            this.againstTheWaves = this.player2.findCardByName('against-the-waves');
        });

        it('should trigger when an attachment is target', function () {
            this.player1.clickCard(this.fineKatana);
            this.player1.clickCard(this.raitsugu);

            this.player2.clickCard(this.letGo);
            this.player2.clickCard(this.fineKatana);

            expect(this.player1).toHavePrompt('Triggered Abilities');
        });

        it('saves the attachment if the opponent refuses to pay the added cost', function () {
            this.player1.clickCard(this.fineKatana);
            this.player1.clickCard(this.raitsugu);

            this.player2.clickCard(this.letGo);
            this.player2.clickCard(this.fineKatana);

            this.player1.clickCard(this.villageDoshin);
            expect(this.player2).toHavePrompt('Select one');
            expect(this.player2).toHavePromptButton('Discard 2 random cards from hand');
            expect(this.player2).toHavePromptButton('Let the effect be canceled');

            this.player2.clickPrompt('Let the effect be canceled');
            expect(this.villageDoshin.location).toBe('conflict discard pile');
            expect(this.letGo.location).toBe('conflict discard pile');
            expect(this.fineKatana.location).toBe('play area');
            expect(this.getChatLogs(5)).toContain(
                'player1 uses Village Dōshin, discarding Village Dōshin to protect Fine Katana'
            );
            expect(this.getChatLogs(5)).toContain(
                'player2 refuses to discard 2 cards. The effects of Let Go are canceled.'
            );
        });

        it('saves the attachment if the opponent does not have fate to pay the added cost', function () {
            this.player1.moveCard(this.againstTheWaves, 'conflict discard pile');

            this.player1.clickCard(this.fineKatana);
            this.player1.clickCard(this.raitsugu);

            this.player2.clickCard(this.letGo);
            this.player2.clickCard(this.fineKatana);

            this.player1.clickCard(this.villageDoshin);
            expect(this.player2).not.toHavePrompt('Select one');
            expect(this.villageDoshin.location).toBe('conflict discard pile');
            expect(this.letGo.location).toBe('conflict discard pile');
            expect(this.fineKatana.location).toBe('play area');
            expect(this.getChatLogs(5)).toContain(
                'player1 uses Village Dōshin, discarding Village Dōshin to protect Fine Katana'
            );
        });

        it('saves the attachment if the opponent cannot pay the added cost', function () {
            this.player2.moveCard(this.chukanNobue, 'play area');

            this.player1.clickCard(this.fineKatana);
            this.player1.clickCard(this.raitsugu);

            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.raitsugu],
                defenders: []
            });

            this.player2.clickCard(this.letGo);
            this.player2.clickCard(this.fineKatana);

            this.player1.clickCard(this.villageDoshin);
            expect(this.player2.fate).toBeGreaterThanOrEqual(1);
            expect(this.player2).not.toHavePrompt('Select one');
            expect(this.villageDoshin.location).toBe('conflict discard pile');
            expect(this.letGo.location).toBe('conflict discard pile');
            expect(this.fineKatana.location).toBe('play area');
            expect(this.getChatLogs(5)).toContain(
                'player1 uses Village Dōshin, discarding Village Dōshin to protect Fine Katana'
            );
        });

        it('does not save the attachment if the opponent pays the added cost', function () {
            this.player1.clickCard(this.dragonsClaw);
            this.player1.clickCard(this.raitsugu);

            this.player2.clickCard(this.letGo);
            this.player2.clickCard(this.dragonsClaw);

            this.player1.clickCard(this.villageDoshin);
            expect(this.player2).toHavePrompt('Select one');
            expect(this.player2).toHavePromptButton('Discard 2 random cards from hand');
            expect(this.player2).toHavePromptButton('Let the effect be canceled');

            this.player2.clickPrompt('Discard 2 random cards from hand');
            expect(this.villageDoshin.location).toBe('conflict discard pile');
            expect(this.letGo.location).toBe('conflict discard pile');
            expect(this.dragonsClaw.location).toBe('conflict discard pile');
            expect(this.againstTheWaves.location).toBe('conflict discard pile');
            expect(this.clarity.location).toBe('conflict discard pile');
            expect(this.getChatLogs(5)).toContain(
                'player1 uses Village Dōshin, discarding Village Dōshin to protect Dragon\'s Claw'
            );
            expect(this.getChatLogs(5)).toContain('player2 distracts the Dōshin.');
        });

        it('does not save attachments on characters controlled by another player', function () {
            this.player1.clickCard(this.dragonsClaw);
            this.player1.clickCard(this.keeperInitiate);

            this.player2.clickCard(this.letGo);
            this.player2.clickCard(this.dragonsClaw);

            expect(this.player1).not.toHavePrompt('Triggered Abilities');
        });
    });
});
