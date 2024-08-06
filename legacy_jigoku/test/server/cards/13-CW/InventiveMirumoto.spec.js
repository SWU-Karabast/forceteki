describe('Inventive Mirumoto', function() {
    integration(function() {
        describe('Inventive Mirumoto\'s ability', function() {
            beforeEach(function() {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['inventive-mirumoto'],
                        hand: ['ornate-fan'],
                        conflictDiscard: ['finger-of-jade', 'fine-katana', 'adorned-barcha','erudite-prestige', 'mirumoto-daisho']
                    },
                    player2: {
                        conflictDiscard: ['finger-of-jade']
                    }
                });
                this.inventiveMirumoto = this.player1.findCardByName('inventive-mirumoto');
                this.jade = this.player1.findCardByName('finger-of-jade');
                this.fineKatana = this.player1.findCardByName('fine-katana');
                this.ornateFan = this.player1.findCardByName('ornate-fan');
                this.barcha = this.player1.findCardByName('adorned-barcha');
                this.eruditePrestige = this.player1.findCardByName('erudite-prestige');
                this.daisho = this.player1.findCardByName('mirumoto-daisho');
                this.jade2 = this.player2.findCardByName('finger-of-jade');
            });

            it('should do nothing if you don\'t have the water ring', function() {
                expect(this.player1).toHavePrompt('Action Window');
                this.player1.clickCard(this.inventiveMirumoto);
                expect(this.player1).toHavePrompt('Action Window');
            });

            it('should only allow to target attachments and only your discard pile', function() {
                this.player1.claimRing('water');
                this.game.checkGameState(true);

                this.player1.clickCard(this.inventiveMirumoto);

                expect(this.player1).toBeAbleToSelect(this.jade);
                expect(this.player1).toBeAbleToSelect(this.fineKatana);
                expect(this.player1).not.toBeAbleToSelect(this.ornateFan);
                expect(this.player1).not.toBeAbleToSelect(this.jade2);
            });

            it('should not allow for illegal attachments to be equiped', function() {
                this.player1.claimRing('water');
                this.game.checkGameState(true);

                this.player1.clickCard(this.inventiveMirumoto);

                expect(this.player1).not.toBeAbleToSelect(this.barcha);
                expect(this.player1).not.toBeAbleToSelect(this.eruditePrestige);
            });

            it('should make you pay costs for the attachments', function() {
                this.player1.claimRing('water');
                this.game.checkGameState(true);
                const playerFateBefore = this.player1.fate;

                this.player1.clickCard(this.inventiveMirumoto);
                this.player1.clickCard(this.jade);
                expect(this.player1.fate).toBe(playerFateBefore - 1);
                expect(this.jade.parent).toBe(this.inventiveMirumoto);
            });

            it('should make you pay costs for the attachments - 2nd test', function() {
                this.player1.claimRing('water');
                this.game.checkGameState(true);
                const playerFateBefore = this.player1.fate;

                this.player1.clickCard(this.inventiveMirumoto);
                this.player1.clickCard(this.daisho);
                expect(this.player1.fate).toBe(playerFateBefore - 2);
                expect(this.daisho.parent).toBe(this.inventiveMirumoto);
            });
        });
    });
});
