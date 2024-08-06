describe('Honest Assessment', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['isawa-tadaka-2'],
                    hand: ['ornate-fan', 'fine-katana', 'banzai', 'ornate-fan'],
                    conflictDiscard: ['let-go', 'assassination', 'fiery-madness']
                },
                player2: {
                    inPlay: ['doji-diplomat', 'doji-challenger'],
                    hand: ['honest-assessment']
                }
            });

            this.fineKatana = this.player1.findCardByName('fine-katana');
            this.ornateFan = this.player1.filterCardsByName('ornate-fan')[0];
            this.ornateFan2 = this.player1.filterCardsByName('ornate-fan')[1];
            this.banzai = this.player1.findCardByName('banzai');
            this.letGo = this.player1.findCardByName('let-go');
            this.assassinate = this.player1.findCardByName('assassination');
            this.madness = this.player1.findCardByName('fiery-madness');

            this.isawaTadaka = this.player1.findCardByName('isawa-tadaka-2');
            this.diplomat = this.player2.findCardByName('doji-diplomat');
            this.challenger = this.player2.findCardByName('doji-challenger');

            this.assessment = this.player2.findCardByName('honest-assessment');
            this.player1.pass();
        });

        it('should attach to a courtier', function() {
            this.player2.clickCard(this.assessment);
            expect(this.player2).toBeAbleToSelect(this.diplomat);
            expect(this.player2).not.toBeAbleToSelect(this.challenger);
            this.player2.clickCard(this.diplomat);
            expect(this.assessment.parent).toBe(this.diplomat);
        });

        it('should react on entering play and prompt you to name a card', function() {
            this.player2.clickCard(this.assessment);
            this.player2.clickCard(this.diplomat);
            expect(this.player2).toHavePrompt('Triggered Abilities');
            expect(this.player2).toBeAbleToSelect(this.assessment);
            this.player2.clickCard(this.assessment);
            expect(this.player2).toHavePrompt('Name a card');
        });

        it('should let you to name a card and then sac itself to discard all matching cards from a revealed random subset of your opponent\'s hand', function() {
            let hand = this.player1.hand.length;
            this.player2.clickCard(this.assessment);
            this.player2.clickCard(this.diplomat);
            this.player2.clickCard(this.assessment);
            expect(this.player2).toHavePrompt('Name a card');
            this.player2.chooseCardInPrompt(this.ornateFan.name, 'card-name');

            expect(this.player1.hand.length).toBe(hand - 2);
            expect(this.getChatLogs(10)).toContain('player2 uses Honest Assessment, naming Ornate Fan to look at 4 random cards in player1\'s hand and discard all cards named Ornate Fan');
            expect(this.getChatLogs(10)).toContain('Honest Assessment sees Banzai!, Fine Katana, Ornate Fan and Ornate Fan');
            expect(this.getChatLogs(10)).toContain('player1 discards Ornate Fan and Ornate Fan');
        });

        it('hand has no matching cards', function() {
            let hand = this.player1.hand.length;
            this.player2.clickCard(this.assessment);
            this.player2.clickCard(this.diplomat);
            this.player2.clickCard(this.assessment);
            expect(this.player2).toHavePrompt('Name a card');
            this.player2.chooseCardInPrompt(this.letGo.name, 'card-name');

            expect(this.player1.hand.length).toBe(hand);
            expect(this.getChatLogs(10)).toContain('player2 uses Honest Assessment, naming Let Go to look at 4 random cards in player1\'s hand and discard all cards named Let Go');
            expect(this.getChatLogs(10)).toContain('Honest Assessment sees Banzai!, Fine Katana, Ornate Fan and Ornate Fan');
            expect(this.getChatLogs(10)).toContain('player1 does not discard anything');
        });

        it('shoud work with less than 4 cards', function() {
            this.player1.moveCard(this.ornateFan, 'conflict disard pile');
            let hand = this.player1.hand.length;
            this.player2.clickCard(this.assessment);
            this.player2.clickCard(this.diplomat);
            this.player2.clickCard(this.assessment);
            expect(this.player2).toHavePrompt('Name a card');
            this.player2.chooseCardInPrompt(this.letGo.name, 'card-name');

            expect(this.player1.hand.length).toBe(hand);
            expect(this.getChatLogs(10)).toContain('player2 uses Honest Assessment, naming Let Go to look at 4 random cards in player1\'s hand and discard all cards named Let Go');
            expect(this.getChatLogs(10)).toContain('Honest Assessment sees Banzai!, Fine Katana and Ornate Fan');
            expect(this.getChatLogs(10)).toContain('player1 does not discard anything');
        });
    });
});
