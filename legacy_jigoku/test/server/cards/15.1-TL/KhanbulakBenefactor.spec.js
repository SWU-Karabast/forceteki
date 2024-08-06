describe('Khanbulak Benefactor', function() {
    integration(function() {
        describe('Dynasty Phase', function() {
            beforeEach(function() {
                this.setupTest({
                    phase: 'dynasty',
                    player1: {
                        dynastyDiscard: ['khanbulak-benefactor']
                    }
                });

                this.khanbulak = this.player1.placeCardInProvince('khanbulak-benefactor', 'province 1');
            });

            it('should draw 2 cards when played from a province - fate', function() {
                this.player1.clickCard(this.khanbulak);
                this.player1.clickPrompt('1');

                expect(this.player1).toHavePrompt('Triggered Abilities');
                expect(this.player1).toBeAbleToSelect(this.khanbulak);

                let hand = this.player1.hand.length;
                this.player1.clickCard(this.khanbulak);
                expect(this.player1.hand.length).toBe(hand + 2);

                expect(this.getChatLogs(3)).toContain('player1 uses Khanbulak Benefactor to draw 2 cards');
            });

            it('should draw 2 cards when played from a province - no fate', function() {
                this.player1.clickCard(this.khanbulak);
                this.player1.clickPrompt('0');

                expect(this.player1).toHavePrompt('Triggered Abilities');
                expect(this.player1).toBeAbleToSelect(this.khanbulak);

                let hand = this.player1.hand.length;
                this.player1.clickCard(this.khanbulak);
                expect(this.player1.hand.length).toBe(hand + 2);

                expect(this.getChatLogs(3)).toContain('player1 uses Khanbulak Benefactor to draw 2 cards');
            });

            it('dire effect - should not cause errors if you buy with 0 fate', function() {
                let hand = this.player1.hand.length;
                this.player1.clickCard(this.khanbulak);
                this.player1.clickPrompt('0');
                this.player1.clickCard(this.khanbulak);
                expect(this.player1.hand.length).toBe(hand + 2);
            });
        });

        describe('Conflict Phase Interactions', function() {
            beforeEach(function() {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        honor: 15,
                        inPlay: ['khanbulak-benefactor', 'border-rider', 'daidoji-uji'],
                        dynastyDiscard: ['khanbulak-benefactor', 'shinjo-kyora'],
                        hand: ['charge', 'steward-of-law', 'fine-katana', 'way-of-the-dragon', 'forebearer-s-echoes', 'way-of-the-crane'],
                        conflictDiscard: ['right-hand-of-the-emperor']
                    },
                    player2: {
                        honor: 10
                    }
                });

                this.khanbulak = this.player1.findCardByName('khanbulak-benefactor', 'play area');
                this.khanbulak2 = this.player1.findCardByName('khanbulak-benefactor', 'dynasty discard pile');
                this.kyora = this.player1.placeCardInProvince('shinjo-kyora', 'province 1');
                this.rider = this.player1.findCardByName('border-rider');
                this.echoes = this.player1.findCardByName('forebearer-s-echoes');
                this.charge = this.player1.findCardByName('charge');
                this.steward = this.player1.findCardByName('steward-of-law');
                this.katana = this.player1.findCardByName('fine-katana');
                this.dragon = this.player1.findCardByName('way-of-the-dragon');

                this.uji = this.player1.findCardByName('daidoji-uji');
                this.crane = this.player1.findCardByName('way-of-the-crane');

                this.rightHand = this.player1.findCardByName('right-hand-of-the-emperor');

                this.khanbulak.fate = 0;

                this.noMoreActions();
            });

            it('dire effect - should not work if not participating', function() {
                const fate = this.player1.fate;

                this.initiateConflict({
                    attackers: [this.rider],
                    defenders: [],
                    type: 'military'
                });

                this.player2.pass();
                this.player1.clickCard(this.dragon);
                this.player1.clickCard(this.rider);
                expect(this.player1.fate).toBe(fate - 2);
                expect(this.player2).toHavePrompt('Conflict Action Window');
            });

            it('dire effect - should not work if not dire', function() {
                const fate = this.player1.fate;
                this.khanbulak.fate = 1;

                this.initiateConflict({
                    attackers: [this.khanbulak],
                    defenders: [],
                    type: 'military'
                });

                this.player2.pass();
                this.player1.clickCard(this.dragon);
                this.player1.clickCard(this.rider);
                expect(this.player1.fate).toBe(fate - 2);
                expect(this.player2).toHavePrompt('Conflict Action Window');
            });

            it('dire effect - should work if participating', function() {
                const fate = this.player1.fate;

                this.initiateConflict({
                    attackers: [this.khanbulak],
                    defenders: [],
                    type: 'military'
                });

                this.player2.pass();
                this.player1.clickCard(this.dragon);
                this.player1.clickCard(this.rider);
                expect(this.player1.fate).toBe(fate - 1);
                expect(this.player2).toHavePrompt('Conflict Action Window');
            });

            it('dire effect - should not cost negative if card costs 0', function() {
                const fate = this.player1.fate;

                this.initiateConflict({
                    attackers: [this.khanbulak],
                    defenders: [],
                    type: 'military'
                });

                this.player2.pass();
                this.player1.clickCard(this.katana);
                this.player1.clickCard(this.rider);
                expect(this.player1.fate).toBe(fate);
                expect(this.player2).toHavePrompt('Conflict Action Window');
            });

            it('dire effect - should work on characters from hand', function() {
                const fate = this.player1.fate;

                this.initiateConflict({
                    attackers: [this.khanbulak],
                    defenders: [],
                    type: 'military'
                });

                this.player2.pass();
                this.player1.clickCard(this.steward);
                this.player1.clickPrompt('0');
                this.player1.clickPrompt('Conflict');
                expect(this.player1.fate).toBe(fate);
                expect(this.player2).toHavePrompt('Conflict Action Window');
            });

            it('dire effect - should work on events (& reaction should work on being put into play)', function() {
                const fate = this.player1.fate;
                const hand = this.player1.hand.length;

                this.initiateConflict({
                    attackers: [this.khanbulak],
                    defenders: [],
                    type: 'military'
                });

                this.player2.pass();
                this.player1.clickCard(this.echoes);
                this.player1.clickCard(this.khanbulak2);
                expect(this.player1.fate).toBe(fate - 1);
                expect(this.player1).toHavePrompt('Triggered Abilities');
                expect(this.player1).toBeAbleToSelect(this.khanbulak2);
                this.player1.clickCard(this.khanbulak2);
                expect(this.player2).toHavePrompt('Conflict Action Window');
                expect(this.player1.hand.length).toBe(hand + 1); //-1 from echoes, +2 from draw
            });

            it('dire effect - should stack', function() {
                const fate = this.player1.fate;

                this.initiateConflict({
                    attackers: [this.khanbulak],
                    defenders: [],
                    type: 'military'
                });

                this.player2.pass();
                this.player1.clickCard(this.echoes);
                this.player1.clickCard(this.khanbulak2);
                expect(this.player1.fate).toBe(fate - 1);
                this.player1.clickCard(this.khanbulak2);
                this.player2.pass();
                this.player1.clickCard(this.dragon);
                this.player1.clickCard(this.khanbulak);
                expect(this.player1.fate).toBe(fate - 1); //2 fate reduction
            });

            it('dire effect - should work on cards played as if from hand', function() {
                const fate = this.player1.fate;

                this.player1.placeCardInProvince(this.khanbulak2, 'province 2');

                this.initiateConflict({
                    attackers: [this.khanbulak],
                    defenders: [],
                    type: 'military'
                });

                this.player2.pass();
                this.player1.clickCard(this.crane);
                this.player1.clickCard(this.uji);
                this.player2.pass();
                this.player1.clickCard(this.khanbulak2);
                this.player1.clickPrompt('0');
                this.player1.clickPrompt('Conflict');
                expect(this.player1.fate).toBe(fate - 3);
                this.player1.clickCard(this.khanbulak2);
                expect(this.player2).toHavePrompt('Conflict Action Window');
            });

            it('dire effect - should not work on cards not played as if from hand (Dynasty Card)', function() {
                const fate = this.player1.fate;

                this.initiateConflict({
                    attackers: [this.khanbulak],
                    defenders: [],
                    type: 'military'
                });

                this.player2.pass();
                this.player1.clickCard(this.kyora);
                this.player1.clickCard(this.rider);
                expect(this.player1.fate).toBe(fate - 2);
                expect(this.player2).toHavePrompt('Conflict Action Window');
            });

            it('dire effect - should not work on cards not played as if from hand (Conflict Card)', function() {
                const fate = this.player1.fate;
                this.uji.bowed = true;

                this.initiateConflict({
                    attackers: [this.khanbulak],
                    defenders: [],
                    type: 'military'
                });

                this.player2.pass();
                this.player1.clickCard(this.rightHand);
                this.player1.clickCard(this.uji);
                this.player1.clickPrompt('Done');
                expect(this.player1.fate).toBe(fate - 3);
                expect(this.player2).toHavePrompt('Conflict Action Window');
            });
        });
    });
});
