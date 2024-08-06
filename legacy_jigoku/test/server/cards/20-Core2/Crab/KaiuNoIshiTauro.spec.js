describe('Kaiu No Ishi Tauro', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['kaiu-no-ishi-tauro', 'brash-samurai'],
                    conflictDeck: ['fine-katana', 'let-go', 'kikyo', 'court-mask', 'a-new-name']
                },
                player2: {
                    inPlay: []
                }
            });
            this.tauro = this.player1.findCardByName('kaiu-no-ishi-tauro');
            this.brash = this.player1.findCardByName('brash-samurai');

            this.katana = this.player1.findCardByName('fine-katana');
            this.kikyo = this.player1.findCardByName('kikyo');
            this.mask = this.player1.findCardByName('court-mask');
            this.ann = this.player1.findCardByName('a-new-name');
        });

        it('should not prompt the player to return a ring if none are claimed', function () {
            this.player1.clickCard(this.tauro);
            expect(this.player1).not.toHavePrompt('Choose a ring to return');
            expect(this.player1).toHavePrompt('Action Window');
        });

        it('should not prompt the player to select an attachment if the player chooses to cancel ring selection', function () {
            this.player1.claimRing('earth');
            this.player1.clickCard(this.tauro);
            this.player1.clickPrompt('Cancel');
            expect(this.player1).toHavePrompt('Action Window');
        });

        it('should prompt the player to return a ring', function () {
            this.player1.claimRing('earth');
            this.player1.clickCard(this.tauro);
            this.player1.clickCard(this.tauro);
            expect(this.player1).toHavePrompt('Choose a ring to return');
            this.player1.clickRing('air');
            expect(this.player1).toHavePrompt('Choose a ring to return');
            this.player1.clickRing('fire');
            expect(this.player1).toHavePrompt('Choose a ring to return');
            this.player1.clickRing('water');
            expect(this.player1).toHavePrompt('Choose a ring to return');
            this.player1.clickRing('void');
            expect(this.player1).toHavePrompt('Choose a ring to return');
        });

        it('should prompt the player to choose a card', function () {
            this.player1.claimRing('earth');
            this.player1.clickCard(this.tauro);
            this.player1.clickCard(this.tauro);
            this.player1.clickRing('earth');
            expect(this.game.rings.earth.isUnclaimed()).toBe(true);
            expect(this.player1).toHavePrompt('Select an attachment');
        });

        it('should attach the chosen card', function () {
            this.player1.claimRing('earth');
            this.player1.clickCard(this.tauro);
            this.player1.clickCard(this.tauro);
            this.player1.clickRing('earth');
            expect(this.player1).toHavePromptButton('Fine Katana');
            expect(this.player1).not.toHavePromptButton('A New Name');
            expect(this.player1).not.toHavePromptButton('Kikyo');
            expect(this.player1).toHavePromptButton('Court Mask');
            expect(this.player1).not.toHavePromptButton('Let Go');
            this.player1.clickPrompt('Fine Katana');

            expect(this.tauro.attachments).toContain(this.katana);
            expect(this.getChatLogs(5)).toContain('player1 uses Kaiu no Ishi Tauro, returning the Earth Ring to search their deck for an attachment costing 1 or less and attach it to Kaiu no Ishi Tauro');
            expect(this.getChatLogs(5)).toContain('player1 takes Fine Katana and attaches it to Kaiu no Ishi Tauro');
            expect(this.getChatLogs(5)).toContain('player1 is shuffling their conflict deck');
        });

        it('should still shuffle if no card is chosen to attach', function () {
            this.player1.claimRing('earth');
            this.player1.clickCard(this.tauro);
            this.player1.clickCard(this.tauro);
            this.player1.clickRing('earth');
            this.player1.clickPrompt('Take Nothing');
            expect(this.getChatLogs(5)).toContain('player1 uses Kaiu no Ishi Tauro, returning the Earth Ring to search their deck for an attachment costing 1 or less and attach it to Kaiu no Ishi Tauro');
            expect(this.getChatLogs(5)).toContain('player1 takes nothing');
            expect(this.getChatLogs(5)).toContain('player1 is shuffling their conflict deck');
        });

        it('multiple rings', function () {
            this.player1.claimRing('earth');
            this.player1.claimRing('fire');
            this.player1.clickCard(this.tauro);
            this.player1.clickCard(this.tauro);
            this.player1.clickRing('earth');
            this.player1.clickRing('fire');
            expect(this.player1).toHavePromptButton('Fine Katana');
            expect(this.player1).not.toHavePromptButton('A New Name');
            expect(this.player1).toHavePromptButton('Kikyo');
            expect(this.player1).toHavePromptButton('Court Mask');
            expect(this.player1).not.toHavePromptButton('Let Go');
            this.player1.clickPrompt('Kikyo');

            expect(this.tauro.attachments).toContain(this.kikyo);
            expect(this.getChatLogs(5)).toContain('player1 uses Kaiu no Ishi Tauro, returning the Earth Ring and Fire Ring to search their deck for an attachment costing 2 or less and attach it to Kaiu no Ishi Tauro');
            expect(this.getChatLogs(5)).toContain('player1 takes Kikyo and attaches it to Kaiu no Ishi Tauro');
            expect(this.getChatLogs(5)).toContain('player1 is shuffling their conflict deck');
        });

        it('only valid attachments', function () {
            this.player1.claimRing('earth');
            this.player1.claimRing('fire');
            this.player1.clickCard(this.tauro);
            this.player1.clickCard(this.brash);
            this.player1.clickRing('earth');
            this.player1.clickRing('fire');
            expect(this.player1).toHavePromptButton('Fine Katana');
            expect(this.player1).not.toHavePromptButton('A New Name');
            expect(this.player1).not.toHavePromptButton('Kikyo');
            expect(this.player1).toHavePromptButton('Court Mask');
            expect(this.player1).not.toHavePromptButton('Let Go');
            this.player1.clickPrompt('Court Mask');

            expect(this.brash.attachments).toContain(this.mask);
            expect(this.getChatLogs(5)).toContain('player1 uses Kaiu no Ishi Tauro, returning the Earth Ring and Fire Ring to search their deck for an attachment costing 2 or less and attach it to Brash Samurai');
            expect(this.getChatLogs(5)).toContain('player1 takes Court Mask and attaches it to Brash Samurai');
            expect(this.getChatLogs(5)).toContain('player1 is shuffling their conflict deck');
        });
    });
});
