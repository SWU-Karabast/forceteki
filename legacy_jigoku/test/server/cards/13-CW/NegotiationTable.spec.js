describe('Negotiation Table', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    fate: 5,
                    inPlay: ['kakita-yoshi', 'doji-fumiki', 'maker-of-keepsakes'],
                    dynastyDiscard: ['negotiation-table']
                },
                player2: {
                    fate: 5,
                    inPlay: ['doji-whisperer', 'doji-challenger'],
                    dynastyDiscard: ['negotiation-table']
                }
            });

            this.yoshi = this.player1.findCardByName('kakita-yoshi');
            this.fumiki = this.player1.findCardByName('doji-fumiki');
            this.keepsakes = this.player1.findCardByName('maker-of-keepsakes');
            this.dojiWhisperer = this.player2.findCardByName('doji-whisperer');
            this.challenger = this.player2.findCardByName('doji-challenger');
            this.table1 = this.player1.placeCardInProvince('negotiation-table', 'province 1');
            this.table2 = this.player2.placeCardInProvince('negotiation-table', 'province 1');

            this.table1.facedown = false;
            this.table2.facedown = false;

            this.yoshi.bowed = true;
            this.fumiki.bowed = true;
            this.challenger.bowed = true;
        });

        it('should prompt opponent to make a choice', function() {
            this.player1.clickCard(this.table1);
            expect(this.player2).toHavePrompt('Negotiation Table');
            expect(this.player2).toHavePromptButton('Draw 1 card');
            expect(this.player2).toHavePromptButton('Choose and ready a character');
            expect(this.player2).toHavePromptButton('Gain 1 fate');
            expect(this.player2).toHavePromptButton('Done');
        });

        it('should prompt opponent to make a choice', function() {
            this.player1.pass();
            this.player2.clickCard(this.table2);
            expect(this.player1).toHavePrompt('Negotiation Table');
            expect(this.player1).toHavePromptButton('Draw 1 card');
            expect(this.player1).toHavePromptButton('Choose and ready a character');
            expect(this.player1).toHavePromptButton('Gain 1 fate');
            expect(this.player1).toHavePromptButton('Done');
        });

        it('should do choice - drawing cards', function() {
            let p1hand = this.player1.hand.length;
            let p2hand = this.player2.hand.length;
            let p1fate = this.player1.fate;
            let p2fate = this.player2.fate;
            this.player1.clickCard(this.table1);
            expect(this.getChatLogs(1)).toContain('player1 uses Negotiation Table');
            this.player2.clickPrompt('Draw 1 card');
            expect(this.player1.hand.length).toBe(p1hand + 1);
            expect(this.player2.hand.length).toBe(p2hand + 1);
            expect(this.player1.fate).toBe(p1fate);
            expect(this.player2.fate).toBe(p2fate);
            expect(this.getChatLogs(1)).toContain('player2 chooses to have each player draw a card');
        });

        it('should do choice - gaining fate', function() {
            let p1hand = this.player1.hand.length;
            let p2hand = this.player2.hand.length;
            let p1fate = this.player1.fate;
            let p2fate = this.player2.fate;
            this.player1.clickCard(this.table1);
            expect(this.getChatLogs(1)).toContain('player1 uses Negotiation Table');
            this.player2.clickPrompt('Gain 1 fate');
            expect(this.player1.fate).toBe(p1fate + 1);
            expect(this.player2.fate).toBe(p2fate + 1);
            expect(this.player1.hand.length).toBe(p1hand);
            expect(this.player2.hand.length).toBe(p2hand);
            expect(this.getChatLogs(1)).toContain('player2 chooses to have each player gain a fate');
        });

        it('should do choice - readying a character', function() {
            this.player1.clickCard(this.table1);
            expect(this.getChatLogs(1)).toContain('player1 uses Negotiation Table');
            this.player2.clickPrompt('Choose and ready a character');
            expect(this.getChatLogs(1)).toContain('player2 chooses to have each player ready a character');
            expect(this.player2).toHavePrompt('Choose a character');
            expect(this.player2).toBeAbleToSelect(this.yoshi);
            expect(this.player2).toBeAbleToSelect(this.fumiki);
            expect(this.player2).toBeAbleToSelect(this.challenger);
            expect(this.player2).not.toBeAbleToSelect(this.keepsakes);
            expect(this.player2).not.toBeAbleToSelect(this.dojiWhisperer);

            this.player2.clickCard(this.yoshi);
            expect(this.getChatLogs(1)).toContain('player2 chooses to ready Kakita Yoshi');
            expect(this.yoshi.bowed).toBe(false);

            expect(this.player1).toHavePrompt('Choose a character');
            expect(this.player1).not.toBeAbleToSelect(this.yoshi);
            expect(this.player1).toBeAbleToSelect(this.fumiki);
            expect(this.player1).toBeAbleToSelect(this.challenger);
            expect(this.player1).not.toBeAbleToSelect(this.keepsakes);
            expect(this.player1).not.toBeAbleToSelect(this.dojiWhisperer);
            this.player1.clickCard(this.fumiki);
            expect(this.getChatLogs(1)).toContain('player1 chooses to ready Doji Fumiki');
            expect(this.fumiki.bowed).toBe(false);
        });

        it('should do choice - done', function() {
            let p1hand = this.player1.hand.length;
            let p2hand = this.player2.hand.length;
            let p1fate = this.player1.fate;
            let p2fate = this.player2.fate;
            this.player1.clickCard(this.table1);
            expect(this.getChatLogs(1)).toContain('player1 uses Negotiation Table');
            this.player2.clickPrompt('Done');
            expect(this.player1.fate).toBe(p1fate);
            expect(this.player2.fate).toBe(p2fate);
            expect(this.player1.hand.length).toBe(p1hand);
            expect(this.player2.hand.length).toBe(p2hand);
            expect(this.getChatLogs(1)).toContain('player2 chooses not to do an action');
        });

        it('chaining cases - should not let you pick the same case', function() {
            this.player1.clickCard(this.table1);
            expect(this.getChatLogs(1)).toContain('player1 uses Negotiation Table');
            this.player2.clickPrompt('Draw 1 card');
            expect(this.getChatLogs(1)).toContain('player2 chooses to have each player draw a card');

            expect(this.player2).toHavePrompt('Negotiation Table');
            expect(this.player2).not.toHavePromptButton('Draw 1 card');
            expect(this.player2).toHavePromptButton('Choose and ready a character');
            expect(this.player2).toHavePromptButton('Gain 1 fate');
            expect(this.player2).toHavePromptButton('Done');
        });

        it('chaining cases - chaining all cases', function() {
            this.player1.clickCard(this.table1);
            expect(this.getChatLogs(1)).toContain('player1 uses Negotiation Table');
            this.player2.clickPrompt('Draw 1 card');
            expect(this.getChatLogs(1)).toContain('player2 chooses to have each player draw a card');

            expect(this.player2).toHavePrompt('Negotiation Table');
            expect(this.player2).not.toHavePromptButton('Draw 1 card');
            expect(this.player2).toHavePromptButton('Choose and ready a character');
            expect(this.player2).toHavePromptButton('Gain 1 fate');
            expect(this.player2).toHavePromptButton('Done');

            this.player2.clickPrompt('Gain 1 fate');
            expect(this.getChatLogs(1)).toContain('player2 chooses to have each player gain a fate');

            expect(this.player2).toHavePrompt('Negotiation Table');
            expect(this.player2).not.toHavePromptButton('Draw 1 card');
            expect(this.player2).toHavePromptButton('Choose and ready a character');
            expect(this.player2).not.toHavePromptButton('Gain 1 fate');
            expect(this.player2).toHavePromptButton('Done');

            this.player2.clickPrompt('Choose and ready a character');
            expect(this.getChatLogs(1)).toContain('player2 chooses to have each player ready a character');
            expect(this.player2).toHavePrompt('Choose a character');
            expect(this.player2).toBeAbleToSelect(this.yoshi);
            expect(this.player2).toBeAbleToSelect(this.fumiki);
            expect(this.player2).toBeAbleToSelect(this.challenger);
            expect(this.player2).not.toBeAbleToSelect(this.keepsakes);
            expect(this.player2).not.toBeAbleToSelect(this.dojiWhisperer);

            this.player2.clickCard(this.yoshi);
            expect(this.getChatLogs(1)).toContain('player2 chooses to ready Kakita Yoshi');
            expect(this.yoshi.bowed).toBe(false);

            expect(this.player1).toHavePrompt('Choose a character');
            expect(this.player1).not.toBeAbleToSelect(this.yoshi);
            expect(this.player1).toBeAbleToSelect(this.fumiki);
            expect(this.player1).toBeAbleToSelect(this.challenger);
            expect(this.player1).not.toBeAbleToSelect(this.keepsakes);
            expect(this.player1).not.toBeAbleToSelect(this.dojiWhisperer);
            this.player1.clickCard(this.fumiki);
            expect(this.getChatLogs(1)).toContain('player1 chooses to ready Doji Fumiki');
            expect(this.fumiki.bowed).toBe(false);

            expect(this.player2).toHavePrompt('Negotiation Table');
            expect(this.player2).not.toHavePromptButton('Draw 1 card');
            expect(this.player2).not.toHavePromptButton('Choose and ready a character');
            expect(this.player2).not.toHavePromptButton('Gain 1 fate');
            expect(this.player2).toHavePromptButton('Done');

            this.player2.clickPrompt('Done');
            expect(this.getChatLogs(1)).toContain('player2 chooses not to do an action');
        });

        it('should not make you choose a character to ready if there are no bowed characters', function() {
            this.yoshi.bowed = false;
            this.fumiki.bowed = false;
            this.challenger.bowed = false;
            this.game.checkGameState(true);
            this.player1.clickCard(this.table1);
            expect(this.player2).toHavePrompt('Negotiation Table');
            expect(this.player2).toHavePromptButton('Draw 1 card');
            expect(this.player2).toHavePromptButton('Choose and ready a character');
            expect(this.player2).toHavePromptButton('Gain 1 fate');
            expect(this.player2).toHavePromptButton('Done');

            this.player2.clickPrompt('Choose and ready a character');
            expect(this.getChatLogs(1)).toContain('player2 chooses to have each player ready a character');
            expect(this.player2).not.toHavePrompt('Choose a character');
            expect(this.player2).toHavePrompt('Negotiation Table');
            expect(this.player2).not.toHavePromptButton('Choose and ready a character');
        });

        it('should be able to ready the only bowed character and then not lock up the other player', function() {
            this.fumiki.bowed = false;
            this.challenger.bowed = false;
            this.game.checkGameState(true);
            this.player1.clickCard(this.table1);
            expect(this.player2).toHavePrompt('Negotiation Table');
            expect(this.player2).toHavePromptButton('Draw 1 card');
            expect(this.player2).toHavePromptButton('Choose and ready a character');
            expect(this.player2).toHavePromptButton('Gain 1 fate');
            expect(this.player2).toHavePromptButton('Done');

            this.player2.clickPrompt('Choose and ready a character');
            expect(this.getChatLogs(1)).toContain('player2 chooses to have each player ready a character');
            expect(this.player2).toHavePrompt('Choose a character');
            expect(this.player2).toBeAbleToSelect(this.yoshi);
            this.player2.clickCard(this.yoshi);
            expect(this.player2).toHavePrompt('Negotiation Table');
            expect(this.player2).not.toHavePromptButton('Choose and ready a character');
        });
    });
});
