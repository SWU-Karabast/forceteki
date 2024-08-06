describe('Kitsuki Chiari', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['isawa-tadaka-2'],
                    hand: ['ornate-fan', 'fine-katana', 'banzai', 'ornate-fan'],
                    conflictDiscard: ['let-go', 'assassination', 'fiery-madness']
                },
                player2: {
                    inPlay: ['kitsuki-chiari', 'kitsuki-yaruma']
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
            this.chiari = this.player2.findCardByName('kitsuki-chiari');
            this.yaruma = this.player2.findCardByName('kitsuki-yaruma');
            this.p1 = this.player2.findCardByName('shameful-display', 'province 1');
            this.p2 = this.player2.findCardByName('shameful-display', 'province 2');
            this.p2.facedown = false;
            this.noMoreActions();
        });

        it('should react when your province is revealed', function () {
            this.initiateConflict({
                attackers: [this.isawaTadaka],
                province: this.p1
            });
            expect(this.player2).toHavePrompt('Triggered Abilities');
            expect(this.player2).toBeAbleToSelect(this.chiari);
        });

        it('should prompt you to name a card', function () {
            this.initiateConflict({
                attackers: [this.isawaTadaka],
                province: this.p1
            });
            this.player2.clickCard(this.chiari);
            expect(this.player2).toHavePrompt('Name a card');
        });

        it('should let you to name a card and then discard all matching cards from a revealed random subset of your opponent\'s hand', function () {
            this.initiateConflict({
                attackers: [this.isawaTadaka],
                province: this.p1
            });
            let hand = this.player1.hand.length;

            this.player2.clickCard(this.chiari);
            expect(this.player2).toHavePrompt('Name a card');
            this.player2.chooseCardInPrompt(this.ornateFan.name, 'card-name');
            this.player2.clickPrompt('Done');

            expect(this.player1.hand.length).toBe(hand - 2);
            expect(this.getChatLogs(10)).toContain(
                'player2 uses Kitsuki Chiari, naming Ornate Fan to look at 4 random cards in player1\'s hand and discard all cards named Ornate Fan'
            );
            expect(this.getChatLogs(10)).toContain(
                'Kitsuki Chiari sees Banzai!, Fine Katana, Ornate Fan and Ornate Fan'
            );
            expect(this.getChatLogs(10)).toContain('player1 discards Ornate Fan and Ornate Fan');
        });

        it('hand has no matching cards', function () {
            this.initiateConflict({
                attackers: [this.isawaTadaka],
                province: this.p1
            });
            let hand = this.player1.hand.length;

            this.player2.clickCard(this.chiari);
            expect(this.player2).toHavePrompt('Name a card');
            this.player2.chooseCardInPrompt(this.letGo.name, 'card-name');
            this.player2.clickPrompt('Done');

            expect(this.player1.hand.length).toBe(hand);
            expect(this.getChatLogs(10)).toContain(
                'player2 uses Kitsuki Chiari, naming Let Go to look at 4 random cards in player1\'s hand and discard all cards named Let Go'
            );
            expect(this.getChatLogs(10)).toContain(
                'Kitsuki Chiari sees Banzai!, Fine Katana, Ornate Fan and Ornate Fan'
            );
            expect(this.getChatLogs(10)).toContain('player1 does not discard anything');
        });

        it('shoud work with less than 4 cards', function () {
            this.initiateConflict({
                attackers: [this.isawaTadaka],
                province: this.p1
            });
            this.player1.moveCard(this.ornateFan, 'conflict disard pile');
            let hand = this.player1.hand.length;

            this.player2.clickCard(this.chiari);
            expect(this.player2).toHavePrompt('Name a card');
            this.player2.chooseCardInPrompt(this.letGo.name, 'card-name');
            this.player2.clickPrompt('Done');

            expect(this.player1.hand.length).toBe(hand);
            expect(this.getChatLogs(10)).toContain(
                'player2 uses Kitsuki Chiari, naming Let Go to look at 4 random cards in player1\'s hand and discard all cards named Let Go'
            );
            expect(this.getChatLogs(10)).toContain('Kitsuki Chiari sees Banzai!, Fine Katana and Ornate Fan');
            expect(this.getChatLogs(10)).toContain('player1 does not discard anything');
        });

        it('should not react when opponent\'s province is revealed', function () {
            this.player1.passConflict();
            this.noMoreActions();

            this.initiateConflict({
                attackers: [this.chiari]
            });
            expect(this.player2).not.toHavePrompt('Triggered Abilities');
        });

        it('no poison attachments', function () {
            this.player1.passConflict();
            this.player1.moveCard(this.madness, 'hand');

            this.player1.clickCard(this.madness);
            expect(this.player1).not.toBeAbleToSelect(this.chiari);
            expect(this.player1).not.toBeAbleToSelect(this.yaruma);
            expect(this.player1).toBeAbleToSelect(this.isawaTadaka);
            this.player1.clickCard(this.chiari);
            expect(this.chiari.attachments).not.toContain(this.madness);
        });

        it('non poison attachments', function () {
            this.player1.passConflict();

            this.player1.clickCard(this.ornateFan);
            expect(this.player1).toBeAbleToSelect(this.chiari);
            expect(this.player1).toBeAbleToSelect(this.yaruma);
            expect(this.player1).toBeAbleToSelect(this.isawaTadaka);
            this.player1.clickCard(this.chiari);
            expect(this.chiari.attachments).toContain(this.ornateFan);
        });
    });
});
