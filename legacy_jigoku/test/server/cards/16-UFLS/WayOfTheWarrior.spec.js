describe('Way of the Warrior', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['togashi-yokuni', 'mirumoto-raitsugu'],
                    hand: ['admit-defeat', 'rout', 'mirumoto-s-fury', 'way-of-the-scorpion']
                },
                player2: {
                    inPlay: ['doji-challenger', 'doji-whisperer'],
                    hand: ['retreat', 'way-of-the-crane', 'way-of-the-warrior']
                }
            });

            this.raitsugu = this.player1.findCardByName('mirumoto-raitsugu');
            this.togashiYokuni = this.player1.findCardByName('togashi-yokuni');
            this.admitDefeat = this.player1.findCardByName('admit-defeat');
            this.rout = this.player1.findCardByName('rout');
            this.mirumotosFury = this.player1.findCardByName('mirumoto-s-fury');
            this.scorp = this.player1.findCardByName('way-of-the-scorpion');

            this.challenger = this.player2.findCardByName('doji-challenger');
            this.whisperer = this.player2.findCardByName('doji-whisperer');
            this.retreat = this.player2.findCardByName('retreat');
            this.crane = this.player2.findCardByName('way-of-the-crane');
            this.warrior = this.player2.findCardByName('way-of-the-warrior');
        });

        it('should not be playable outside of a conflict', function () {
            this.player1.pass();
            expect(this.player2).toHavePrompt('Action Window');
            this.player2.clickCard(this.warrior);
            expect(this.player2).toHavePrompt('Action Window');
        });

        it('shouldbe able to target a participating bushi', function () {
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.togashiYokuni],
                defenders: [this.challenger, this.whisperer]
            });
            this.player2.clickCard(this.warrior);
            expect(this.player2).toBeAbleToSelect(this.togashiYokuni);
            expect(this.player2).toBeAbleToSelect(this.challenger);
            expect(this.player2).not.toBeAbleToSelect(this.whisperer);
            expect(this.player2).not.toBeAbleToSelect(this.raitsugu);
        });

        it('should not be able to be bowed by opponent\'s card effects', function () {
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.togashiYokuni],
                defenders: [this.challenger]
            });
            this.player2.clickCard(this.warrior);
            this.player2.clickCard(this.challenger);
            this.player1.clickCard(this.admitDefeat);
            expect(this.player1).not.toHavePrompt('Admit Defeat');
            expect(this.getChatLogs(5)).toContain('player2 plays Way of the Warrior to ready and prevent opponent\'s card effects from bowing, sending home, or dishonoring Doji Challenger');
        });

        it('should not be able to be sent home by opponent\'s card effects', function () {
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.togashiYokuni],
                defenders: [this.challenger]
            });
            this.player2.clickCard(this.warrior);
            this.player2.clickCard(this.challenger);
            this.player1.clickCard(this.rout);
            expect(this.player1).not.toHavePrompt('Rout');
        });

        it('should not be able to be dishonored by opponent\'s card effects when neutral', function () {
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.togashiYokuni],
                defenders: [this.challenger]
            });
            this.player2.clickCard(this.warrior);
            this.player2.clickCard(this.challenger);
            this.player1.clickCard(this.scorp);
            expect(this.player1).toBeAbleToSelect(this.togashiYokuni);
            expect(this.player1).not.toBeAbleToSelect(this.challenger);
        });

        it('should not be able to be dishonored by opponent\'s card effects when honored', function () {
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.togashiYokuni],
                defenders: [this.challenger]
            });
            this.player2.clickCard(this.crane);
            this.player2.clickCard(this.challenger);
            this.player1.pass();
            this.player2.clickCard(this.warrior);
            this.player2.clickCard(this.challenger);
            this.player1.clickCard(this.scorp);
            expect(this.player1).toBeAbleToSelect(this.togashiYokuni);
            expect(this.player1).not.toBeAbleToSelect(this.challenger);
        });

        it('should be able to be sent home by your own card effects', function () {
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.togashiYokuni],
                defenders: [this.challenger]
            });
            this.player2.clickCard(this.warrior);
            this.player2.clickCard(this.challenger);
            this.player1.pass();
            this.player2.clickCard(this.retreat);
            expect(this.player2).toBeAbleToSelect(this.challenger);
            this.player2.clickCard(this.challenger);
            expect(this.challenger.isParticipating()).toBe(false);
        });

        it('should ready if bowed', function () {
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.togashiYokuni],
                defenders: [this.challenger]
            });
            this.challenger.bow();
            this.player2.clickCard(this.warrior);
            expect(this.challenger.bowed).toBe(true);
            this.player2.clickCard(this.challenger);
            this.player1.clickCard(this.admitDefeat);
            expect(this.challenger.bowed).toBe(false);
        });

    });
});
