describe('Diplomatic Hall', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['eager-scout'],
                    hand: ['way-of-the-crab', 'let-go'],
                    conflictDiscard: ['assassination', 'fine-katana'],
                    dynastyDiscard: ['iron-mine', 'doji-challenger', 'diplomatic-hall']
                },
                player2: {
                    conflictDiscard: ['ornate-fan'],
                    dynastyDiscard: ['imperial-storehouse']
                }
            });
            this.hall = this.player1.placeCardInProvince('diplomatic-hall');
            this.hall.facedown = false;
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

        it('should draw during a pol conflict', function() {
            this.noMoreActions();
            this.initiateConflict({
                type: 'political',
                attackers: [this.scout],
                defenders: []
            });
            this.player2.pass();
            let hand = this.player1.hand.length;
            let hand2 = this.player2.hand.length;
            this.player1.clickCard(this.hall);
            expect(this.player1).toHavePromptButton('player1');
            expect(this.player1).toHavePromptButton('player2');
            this.player1.clickPrompt('player1');
            expect(this.player1.hand.length).toBe(hand + 1);
            expect(this.player2.hand.length).toBe(hand2);
            expect(this.getChatLogs(5)).toContain('player1 uses Diplomatic Hall to have player1 draw a card');
        });

        it('should draw during a pol conflict - opponent', function() {
            this.noMoreActions();
            this.initiateConflict({
                type: 'political',
                attackers: [this.scout],
                defenders: []
            });
            this.player2.pass();
            let hand = this.player1.hand.length;
            let hand2 = this.player2.hand.length;
            this.player1.clickCard(this.hall);
            expect(this.player1).toHavePromptButton('player1');
            expect(this.player1).toHavePromptButton('player2');
            this.player1.clickPrompt('player2');
            expect(this.player1.hand.length).toBe(hand);
            expect(this.player2.hand.length).toBe(hand2 + 1);
            expect(this.getChatLogs(5)).toContain('player1 uses Diplomatic Hall to have player2 draw a card');
        });

        it('should not draw during a mil conflict', function() {
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.scout],
                defenders: []
            });
            this.player2.pass();
            expect(this.player1).toHavePrompt('Conflict Action Window');
            this.player1.clickCard(this.hall);
            expect(this.player1).toHavePrompt('Conflict Action Window');
        });

        it('should not draw outside of a conflict', function() {
            expect(this.player1).toHavePrompt('Action Window');
            this.player1.clickCard(this.hall);
            expect(this.player1).toHavePrompt('Action Window');
        });
    });
});
