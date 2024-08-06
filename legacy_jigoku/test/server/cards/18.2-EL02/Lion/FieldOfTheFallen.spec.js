describe('Field of the Fallen', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['eager-scout'],
                    hand: ['way-of-the-crab', 'let-go'],
                    conflictDiscard: ['assassination', 'fine-katana'],
                    dynastyDiscard: ['iron-mine', 'doji-challenger', 'field-of-the-fallen']
                },
                player2: {
                    conflictDiscard: ['ornate-fan'],
                    dynastyDiscard: ['imperial-storehouse']
                }
            });
            this.courtyard = this.player1.placeCardInProvince('field-of-the-fallen');
            this.courtyard.facedown = false;
            this.scout = this.player1.findCardByName('eager-scout');

            this.crab = this.player1.findCardByName('way-of-the-crab');
            this.letGo = this.player1.findCardByName('let-go');

            this.assassination = this.player1.findCardByName('assassination');
            this.katana = this.player1.findCardByName('fine-katana');

            this.mine = this.player1.findCardByName('iron-mine');
            this.challenger = this.player1.findCardByName('doji-challenger');

            this.fan = this.player2.findCardByName('ornate-fan');
            this.storehouse = this.player2.findCardByName('imperial-storehouse');
        });

        it('should discard to draw and nothing else (less honorable)', function() {
            this.player1.honor = 10;
            this.player2.honor = 12;

            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.scout],
                defenders: []
            });
            this.player2.pass();
            this.player1.clickCard(this.courtyard);
            let hand = this.player1.hand.length;
            expect(this.player1).toBeAbleToSelect(this.crab);
            expect(this.player1).toBeAbleToSelect(this.letGo);
            this.player1.clickCard(this.crab);
            expect(this.player1.hand.length).toBe(hand);
            expect(this.getChatLogs(5)).toContain('player1 uses Field of the Fallen, discarding Way of the Crab to draw 1 card');
        });

        it('should discard to draw and nothing else (equally honorable)', function() {
            this.player1.honor = 10;
            this.player2.honor = 10;

            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.scout],
                defenders: []
            });
            this.player2.pass();
            this.player1.clickCard(this.courtyard);
            let hand = this.player1.hand.length;
            expect(this.player1).toBeAbleToSelect(this.crab);
            expect(this.player1).toBeAbleToSelect(this.letGo);
            this.player1.clickCard(this.crab);
            expect(this.player1.hand.length).toBe(hand);
            expect(this.getChatLogs(5)).toContain('player1 uses Field of the Fallen, discarding Way of the Crab to draw 1 card');
        });

        it('should discard to draw and put a card on the bottom of a deck', function() {
            this.player1.honor = 12;
            this.player2.honor = 10;

            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.scout],
                defenders: []
            });
            this.player2.pass();
            this.player1.clickCard(this.courtyard);
            let hand = this.player1.hand.length;
            expect(this.player1).toBeAbleToSelect(this.crab);
            expect(this.player1).toBeAbleToSelect(this.letGo);
            this.player1.clickCard(this.crab);
            expect(this.player1.hand.length).toBe(hand);
            expect(this.player1).toHavePrompt('Select a card to place on the bottom of a deck');
            expect(this.player1).toBeAbleToSelect(this.mine);
            expect(this.player1).toBeAbleToSelect(this.challenger);
            expect(this.player1).toBeAbleToSelect(this.katana);
            expect(this.player1).toBeAbleToSelect(this.assassination);
            expect(this.player1).toBeAbleToSelect(this.fan);
            expect(this.player1).toBeAbleToSelect(this.storehouse);

            this.player1.clickCard(this.fan);
            expect(this.fan.location).toBe('conflict deck');
            expect(this.player2.conflictDeck[this.player2.conflictDeck.length - 1]).toBe(this.fan);

            expect(this.getChatLogs(5)).toContain('player1 uses Field of the Fallen, discarding Way of the Crab to draw 1 card');
            expect(this.getChatLogs(5)).toContain('player1 places Ornate Fan on the bottom of player2\'s conflict deck');
        });

        it('should discard to draw and put a card on the bottom of a deck - dynasty card', function() {
            this.player1.honor = 12;
            this.player2.honor = 10;

            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.scout],
                defenders: []
            });
            this.player2.pass();
            this.player1.clickCard(this.courtyard);
            this.player1.clickCard(this.crab);
            this.player1.clickCard(this.mine);
            expect(this.mine.location).toBe('dynasty deck');
            expect(this.player1.dynastyDeck[this.player1.dynastyDeck.length - 1]).toBe(this.mine);

            expect(this.getChatLogs(5)).toContain('player1 uses Field of the Fallen, discarding Way of the Crab to draw 1 card');
            expect(this.getChatLogs(5)).toContain('player1 places Iron Mine on the bottom of player1\'s dynasty deck');
        });
    });
});
