describe('Counsel from Yume-do', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    hand: ['counsel-from-yume-do'],
                    conflictDiscard: ['a-perfect-cut', 'court-games', 'fine-katana'],
                    inPlay: ['adept-of-the-waves', 'solemn-scholar']
                },
                player2: {
                    conflictDiscard: ['warm-welcome']
                }
            });

            this.counselFromYumeDo = this.player1.findCardByName('counsel-from-yume-do');
            this.adept = this.player1.findCardByName('adept-of-the-waves');
            this.solemn = this.player1.findCardByName('solemn-scholar');
            this.aPerfectCut = this.player1.findCardByName('a-perfect-cut');
            this.courtGames = this.player1.findCardByName('court-games');
            this.fineKatana = this.player1.findCardByName('fine-katana');
            this.warmWelcomeP2 = this.player2.findCardByName('warm-welcome');
        });

        it('without affinity, shuffles cards back into deck', function () {
            this.player1.moveCard(this.adept, 'dynasty discard pile');

            this.player1.clickCard(this.counselFromYumeDo);
            expect(this.player1).toHavePrompt('Choose up to 3 conflict cards');
            expect(this.player1).toBeAbleToSelect(this.aPerfectCut);
            expect(this.player1).toBeAbleToSelect(this.courtGames);
            expect(this.player1).toBeAbleToSelect(this.fineKatana);
            expect(this.player1).not.toBeAbleToSelect(this.warmWelcomeP2);

            this.player1.clickCard(this.aPerfectCut);
            this.player1.clickCard(this.courtGames);
            this.player1.clickCard(this.fineKatana);
            this.player1.clickPrompt('Done');

            expect(this.aPerfectCut.location).toBe('conflict deck');
            expect(this.courtGames.location).toBe('conflict deck');
            expect(this.fineKatana.location).toBe('conflict deck');
            expect(this.getChatLogs(5)).toContain(
                "player1 plays Counsel from Yume-do to shuffle A Perfect Cut, Court Games and Fine Katana into its owner's deck"
            );
            expect(this.getChatLogs(5)).toContain('player1 is shuffling their conflict deck');
            expect(this.player1.hand.length).toBe(0);
        });

        it('with affinity, also draw a card', function () {
            this.player1.clickCard(this.counselFromYumeDo);
            this.player1.clickCard(this.aPerfectCut);
            this.player1.clickCard(this.courtGames);
            this.player1.clickCard(this.fineKatana);
            this.player1.clickPrompt('Done');
            expect(this.player1.hand.length).toBe(1);
            expect(this.getChatLogs(5)).toContain('player1 channels their water affinity to draw a card');
        });
    });
});