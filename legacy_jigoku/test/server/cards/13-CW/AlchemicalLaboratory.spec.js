describe('Alchemical Laboratory', function() {
    integration(function() {
        describe('Alchemical Laboratory\'s ability', function() {
            beforeEach(function() {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['doomed-shugenja'],
                        hand: ['fine-katana', 'ancient-master', 'reprieve', 'ornate-fan'],
                        dynastyDiscard: ['alchemical-laboratory']
                    },
                    player2: {
                        inPlay: ['miya-mystic'],
                        hand: ['spyglass']
                    }
                });
                this.shugenja = this.player1.findCardByName('doomed-shugenja');
                this.katana = this.player1.findCardByName('fine-katana');
                this.master = this.player1.findCardByName('ancient-master');
                this.reprieve = this.player1.findCardByName('reprieve');
                this.fan = this.player1.findCardByName('ornate-fan');
                this.mystic = this.player2.findCardByName('miya-mystic');
                this.spyglass = this.player2.findCardByName('spyglass');
                this.laboratory = this.player1.placeCardInProvince('alchemical-laboratory', 'province 1');
                this.laboratory.facedown = false;

                this.player1.playAttachment(this.katana, this.mystic);
                this.player2.playAttachment(this.spyglass, this.mystic);
                this.player1.playAttachment(this.reprieve, this.shugenja);
                this.player2.pass();
                this.player1.playAttachment(this.fan, this.mystic);
                this.player2.pass();
                this.player1.clickCard(this.master);
                this.player1.clickPrompt('Play Ancient Master as an attachment');
                this.player1.clickCard(this.mystic);
            });

            it('if you have the fire ring should give the "ancestral"-keyword to attachments you control on opponent characters', function() {
                this.player1.claimRing('fire');
                this.game.checkGameState(true);
                expect(this.katana.hasKeyword('ancestral')).toBe(true);
                expect(this.master.hasKeyword('ancestral')).toBe(true);
                expect(this.reprieve.hasKeyword('ancestral')).toBe(false);
                expect(this.fan.hasKeyword('ancestral')).toBe(true);
                expect(this.spyglass.hasKeyword('ancestral')).toBe(false);
            });

            it('if you do not have the fire ring, should not give the "ancestral"-keyword to attachments', function() {
                expect(this.katana.hasKeyword('ancestral')).toBe(false);
                expect(this.master.hasKeyword('ancestral')).toBe(false);
                expect(this.reprieve.hasKeyword('ancestral')).toBe(false);
                expect(this.fan.hasKeyword('ancestral')).toBe(false);
                expect(this.spyglass.hasKeyword('ancestral')).toBe(false);
            });

            it('should return other attachments to hand when an opponents character is discarded', function() {
                this.player1.claimRing('fire');
                expect(this.player1.player.hand.size()).toBe(0);
                this.player2.clickCard(this.mystic);
                this.player2.clickCard(this.reprieve);
                expect(this.player1.player.hand.size()).toBe(3);
                expect(this.reprieve.location).toBe('conflict discard pile');
                expect(this.katana.location).toBe('hand');
                expect(this.fan.location).toBe('hand');
                expect(this.master.location).toBe('hand');
                expect(this.spyglass.location).toBe('conflict discard pile');
            });
        });
    });
});
