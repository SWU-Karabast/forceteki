describe('Educated Heimin', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    fate: 20,
                    hand: ['educated-heimin'],
                    dynastyDiscard: ['akodo-zentaro', 'matsu-berserker', 'doji-whisperer', 'moto-chagatai', 'samurai-of-integrity', 'akodo-toturi'],
                    inPlay: ['doji-kuwanan', 'kakita-yoshi'],
                    provinces: ['manicured-garden', 'city-of-the-rich-frog', 'kakudaira']
                },
                player2: {
                    inPlay: ['naive-student'],
                    dynastyDiscard: ['bustling-academy'],
                    provinces: ['fertile-fields'],
                    hand: ['sabotage']
                }
            });

            this.matsuBerseker = this.player1.findCardByName('matsu-berserker');
            this.whisperer = this.player1.findCardByName('doji-whisperer');
            this.zentaro = this.player1.findCardByName('akodo-zentaro');
            this.chagatai = this.player1.findCardByName('moto-chagatai');
            this.samuraiOfIntegrity = this.player1.findCardByName('samurai-of-integrity');
            this.akodoToturi = this.player1.findCardByName('akodo-toturi');
            this.kuwanan = this.player1.findCardByName('doji-kuwanan');
            this.heimin = this.player1.findCardByName('educated-heimin');

            this.academy = this.player2.findCardByName('bustling-academy');
            this.player2.findCardByName('sabotage');

            this.garden = this.player1.findCardByName('manicured-garden');
            this.frog = this.player1.findCardByName('city-of-the-rich-frog');
            this.eminient = this.player1.findCardByName('kakudaira');
            this.fields = this.player2.findCardByName('fertile-fields');

            this.player2.placeCardInProvince(this.academy, 'province 1');
        });

        it('should be able to played on a province you control', function() {
            this.player1.clickCard(this.heimin);
            expect(this.player1).toBeAbleToSelect(this.garden);
            expect(this.player1).toBeAbleToSelect(this.eminient);
            expect(this.player1).toBeAbleToSelect(this.frog);
            expect(this.player1).not.toBeAbleToSelect(this.fields);
            this.player1.clickCard(this.garden);
            expect(this.heimin.parent).toBe(this.garden);
        });

        it('should let you pick cards to refill (province is facedown) and work with refill faceup effects', function() {
            this.player1.placeCardInProvince(this.kuwanan, this.garden.location);
            this.player1.playAttachment(this.heimin, this.garden);

            this.player1.reduceDeckToNumber('dynasty deck', 0);
            this.player1.moveCard(this.matsuBerseker, 'dynasty deck');
            this.player1.moveCard(this.whisperer, 'dynasty deck');
            this.player1.moveCard(this.zentaro, 'dynasty deck');
            this.player1.moveCard(this.chagatai, 'dynasty deck');
            this.player1.moveCard(this.samuraiOfIntegrity, 'dynasty deck');
            this.player1.moveCard(this.akodoToturi, 'dynasty deck');

            this.player2.clickCard(this.academy);
            let cards = this.player1.player.getDynastyCardsInProvince(this.garden.location);
            cards.forEach(card => {
                if(card !== this.kuwanan) {
                    this.player1.moveCard(card, 'dynasty discard pile');
                }
            });
            expect(this.player1.player.getDynastyCardsInProvince(this.garden.location).length).toBe(1);
            this.player2.clickCard(this.kuwanan);

            expect(this.player1).toHavePrompt('Choose a card to refill the province with');
            expect(this.player1).toHavePromptButton('Akodo Toturi');
            expect(this.player1).toHavePromptButton('Samurai of Integrity');
            expect(this.player1).toHavePromptButton('Moto Chagatai');
            expect(this.player1).toHavePromptButton('Akodo Zentarō');

            this.player1.clickPrompt('Moto Chagatai');
            expect(this.chagatai.location).toBe(this.garden.location);
            expect(this.chagatai.facedown).toBe(false);
            expect(this.getChatLogs(1)).toContain('player1 chooses a card to put into a facedown province and discards Akodo Toturi, Samurai of Integrity and Akodo Zentarō from the constant effect of Educated Heimin');
            expect(this.akodoToturi.location).toBe('dynasty discard pile');
            expect(this.samuraiOfIntegrity.location).toBe('dynasty discard pile');
            expect(this.zentaro.location).toBe('dynasty discard pile');
            expect(this.player1).toHavePrompt('Action Window');
        });

        it('should let you pick cards to refill (province is faceup) and work with refill faceup effects', function() {
            this.player1.placeCardInProvince(this.kuwanan, this.eminient.location);
            this.player1.playAttachment(this.heimin, this.eminient);

            this.player1.reduceDeckToNumber('dynasty deck', 0);
            this.player1.moveCard(this.matsuBerseker, 'dynasty deck');
            this.player1.moveCard(this.whisperer, 'dynasty deck');
            this.player1.moveCard(this.zentaro, 'dynasty deck');
            this.player1.moveCard(this.chagatai, 'dynasty deck');
            this.player1.moveCard(this.samuraiOfIntegrity, 'dynasty deck');
            this.player1.moveCard(this.akodoToturi, 'dynasty deck');

            this.player2.clickCard(this.academy);
            let cards = this.player1.player.getDynastyCardsInProvince(this.eminient.location);
            cards.forEach(card => {
                if(card !== this.kuwanan) {
                    this.player1.moveCard(card, 'dynasty discard pile');
                }
            });
            this.player2.clickCard(this.kuwanan);

            expect(this.player1).toHavePrompt('Choose a card to refill the province with');
            expect(this.player1).toHavePromptButton('Akodo Toturi');
            expect(this.player1).toHavePromptButton('Samurai of Integrity');
            expect(this.player1).not.toHavePromptButton('Moto Chagatai');
            expect(this.player1).not.toHavePromptButton('Akodo Zentarō');

            this.player1.clickPrompt('Akodo Toturi');
            expect(this.akodoToturi.location).toBe(this.eminient.location);
            expect(this.akodoToturi.facedown).toBe(false);
            expect(this.getChatLogs(1)).toContain('player1 chooses a card to put into Kakudaira and discards Samurai of Integrity from the constant effect of Educated Heimin');
            expect(this.samuraiOfIntegrity.location).toBe('dynasty discard pile');
        });

        it('should let you pick cards to refill (rich frog)', function() {
            this.player1.placeCardInProvince(this.kuwanan, this.frog.location);
            this.player1.playAttachment(this.heimin, this.frog);

            this.player1.reduceDeckToNumber('dynasty deck', 0);
            this.player1.moveCard(this.matsuBerseker, 'dynasty deck');
            this.player1.moveCard(this.whisperer, 'dynasty deck');
            this.player1.moveCard(this.zentaro, 'dynasty deck');
            this.player1.moveCard(this.chagatai, 'dynasty deck');
            this.player1.moveCard(this.samuraiOfIntegrity, 'dynasty deck');
            this.player1.moveCard(this.akodoToturi, 'dynasty deck');

            this.player2.clickCard(this.academy);
            let cards = this.player1.player.getDynastyCardsInProvince(this.frog.location);
            cards.forEach(card => {
                if(card !== this.kuwanan) {
                    this.player1.moveCard(card, 'dynasty discard pile');
                }
            });
            this.player2.clickCard(this.kuwanan);

            expect(this.player1).toHavePrompt('Choose a card to refill the province with');
            expect(this.player1).toHavePromptButton('Akodo Toturi');
            expect(this.player1).toHavePromptButton('Samurai of Integrity');
            expect(this.player1).not.toHavePromptButton('Moto Chagatai');
            expect(this.player1).not.toHavePromptButton('Akodo Zentarō');

            this.player1.clickPrompt('Akodo Toturi');
            expect(this.akodoToturi.location).toBe(this.frog.location);
            expect(this.getChatLogs(1)).toContain('player1 chooses a card to put into City of the Rich Frog and discards Samurai of Integrity from the constant effect of Educated Heimin');
            expect(this.samuraiOfIntegrity.location).toBe('dynasty discard pile');

            expect(this.player1).toHavePrompt('Choose a card to refill the province with');
            expect(this.player1).toHavePromptButton('Moto Chagatai');
            expect(this.player1).toHavePromptButton('Akodo Zentarō');
            this.player1.clickPrompt('Moto Chagatai');
            expect(this.chagatai.location).toBe(this.frog.location);
            expect(this.getChatLogs(1)).toContain('player1 chooses a card to put into City of the Rich Frog and discards Akodo Zentarō from the constant effect of Educated Heimin');
            expect(this.zentaro.location).toBe('dynasty discard pile');

            expect(this.player1).toHavePrompt('Choose a card to refill the province with');
            expect(this.player1).toHavePromptButton('Doji Whisperer');
            expect(this.player1).toHavePromptButton('Matsu Berserker');
            this.player1.clickPrompt('Matsu Berserker');
            expect(this.matsuBerseker.location).toBe(this.frog.location);
            expect(this.getChatLogs(1)).toContain('player1 chooses a card to put into City of the Rich Frog and discards Doji Whisperer from the constant effect of Educated Heimin');
            expect(this.whisperer.location).toBe('dynasty discard pile');

            expect(this.player1).toHavePrompt('Action Window');
            expect(this.akodoToturi.facedown).toBe(false);
            expect(this.chagatai.facedown).toBe(false);
            expect(this.matsuBerseker.facedown).toBe(false);
        });

        it('should let you pick cards to refill (province is facedown) and work without refill faceup effects', function() {
            this.player1.placeCardInProvince(this.kuwanan, this.garden.location);
            this.player1.playAttachment(this.heimin, this.garden);

            this.player1.reduceDeckToNumber('dynasty deck', 0);
            this.player1.moveCard(this.matsuBerseker, 'dynasty deck');
            this.player1.moveCard(this.whisperer, 'dynasty deck');
            this.player1.moveCard(this.zentaro, 'dynasty deck');
            this.player1.moveCard(this.chagatai, 'dynasty deck');
            this.player1.moveCard(this.samuraiOfIntegrity, 'dynasty deck');
            this.player1.moveCard(this.akodoToturi, 'dynasty deck');

            this.noMoreActions();
            this.initiateConflict({
                attackers: ['kakita-yoshi'],
                defenders: [],
                type: 'military'
            });

            this.player2.clickCard('sabotage');
            let cards = this.player1.player.getDynastyCardsInProvince(this.garden.location);
            cards.forEach(card => {
                if(card !== this.kuwanan) {
                    this.player1.moveCard(card, 'dynasty discard pile');
                }
            });
            this.player2.clickCard(this.kuwanan);

            expect(this.player1).toHavePrompt('Choose a card to refill the province with');
            expect(this.player1).toHavePromptButton('Akodo Toturi');
            expect(this.player1).toHavePromptButton('Samurai of Integrity');
            expect(this.player1).toHavePromptButton('Moto Chagatai');
            expect(this.player1).toHavePromptButton('Akodo Zentarō');

            this.player1.clickPrompt('Moto Chagatai');
            expect(this.chagatai.location).toBe(this.garden.location);
            expect(this.chagatai.facedown).toBe(true);
            expect(this.getChatLogs(10)).toContain('player1 chooses a card to put into a facedown province and discards Akodo Toturi, Samurai of Integrity and Akodo Zentarō from the constant effect of Educated Heimin');
            expect(this.akodoToturi.location).toBe('dynasty discard pile');
            expect(this.samuraiOfIntegrity.location).toBe('dynasty discard pile');
            expect(this.zentaro.location).toBe('dynasty discard pile');
            expect(this.player1).toHavePrompt('Conflict Action Window');
        });
    });
});
