describe('Bonds of Blood', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['matsu-tsuko-2', 'akodo-toturi', 'ancient-master'],
                    hand: ['bonds-of-blood']
                },
                player2: {
                    inPlay: ['mirumoto-raitsugu', 'doji-challenger']
                }
            });

            this.matsuTsuko = this.player1.findCardByName('matsu-tsuko-2');
            this.akodoToturi = this.player1.findCardByName('akodo-toturi');
            this.master = this.player1.findCardByName('ancient-master');
            this.blood = this.player1.findCardByName('bonds-of-blood');
            this.matsuTsuko.fate = 10;

            this.mirumotoRaitsugu = this.player2.findCardByName('mirumoto-raitsugu');
            this.challenger = this.player2.findCardByName('doji-challenger');
        });

        it ('should do nothing outside of a conflict', function() {
            expect(this.player1).toHavePrompt('Action Window');
            this.player1.clickCard(this.blood);
            expect(this.player1).toHavePrompt('Action Window');
        });

        it('should prompt you to dishonor a participating character', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.matsuTsuko, this.akodoToturi],
                defenders: [this.mirumotoRaitsugu]
            });

            this.player2.pass();
            this.player1.clickCard(this.blood);
            expect(this.player1).toHavePrompt('Select character to dishonor');
            expect(this.player1).toBeAbleToSelect(this.matsuTsuko);
            expect(this.player1).toBeAbleToSelect(this.akodoToturi);
            expect(this.player1).not.toBeAbleToSelect(this.challenger);
        });

        it('should allow you to send home a character and the dishonored character', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.matsuTsuko, this.akodoToturi],
                defenders: [this.mirumotoRaitsugu]
            });

            this.player2.pass();
            this.player1.clickCard(this.blood);
            this.player1.clickCard(this.akodoToturi);
            this.player1.clickCard(this.matsuTsuko);
            this.player1.clickPrompt('1');

            expect(this.player1).toBeAbleToSelect(this.mirumotoRaitsugu);
            expect(this.player1).toBeAbleToSelect(this.akodoToturi);
            expect(this.player1).toBeAbleToSelect(this.matsuTsuko);
            expect(this.player1).not.toBeAbleToSelect(this.challenger);
            expect(this.player1).not.toBeAbleToSelect(this.master);
            this.player1.clickCard(this.mirumotoRaitsugu);
            expect(this.mirumotoRaitsugu.inConflict).toBe(false);
            expect(this.akodoToturi.inConflict).toBe(false);
            expect(this.getChatLogs(3)).toContain('player1 plays Bonds of Blood, dishonoring Akodo Toturi to send Mirumoto Raitsugu home and send Akodo Toturi home');
        });

        it('should allow you to send home the dishonored character', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.matsuTsuko, this.akodoToturi],
                defenders: [this.mirumotoRaitsugu]
            });

            this.player2.pass();
            this.player1.clickCard(this.blood);
            this.player1.clickCard(this.akodoToturi);
            this.player1.clickCard(this.matsuTsuko);
            this.player1.clickPrompt('1');

            this.player1.clickCard(this.akodoToturi);
            expect(this.akodoToturi.inConflict).toBe(false);
            expect(this.getChatLogs(3)).toContain('player1 plays Bonds of Blood, dishonoring Akodo Toturi to send Akodo Toturi home and send Akodo Toturi home');
        });

        it('should work on defense', function() {
            this.noMoreActions();
            this.player1.passConflict();
            this.noMoreActions();

            this.initiateConflict({
                attackers: [this.mirumotoRaitsugu],
                defenders: [this.matsuTsuko]
            });

            this.player1.clickCard(this.blood);
            this.player1.clickCard(this.matsuTsuko);
            this.player1.clickCard(this.matsuTsuko);
            this.player1.clickPrompt('1');
            this.player1.clickCard(this.mirumotoRaitsugu);
            expect(this.mirumotoRaitsugu.inConflict).toBe(false);
            expect(this.matsuTsuko.inConflict).toBe(false);
            expect(this.getChatLogs(3)).toContain('player1 plays Bonds of Blood, dishonoring Matsu Tsuko to send Mirumoto Raitsugu home and send Matsu Tsuko home');
        });
    });
});
