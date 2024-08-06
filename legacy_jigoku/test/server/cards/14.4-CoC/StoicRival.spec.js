describe('Stoic Rival', function() {
    integration(function() {
        describe('Stoic Rival\'s ability', function() {
            beforeEach(function() {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['stoic-rival'],
                        hand: ['adopted-kin','ornate-fan','let-go']
                    },
                    player2: {
                        inPlay: ['shiba-tsukune', 'otomo-courtier','miya-mystic'],
                        hand:['ornate-fan','ornate-fan','outwit']
                    }
                });
                this.noMoreActions();
                this.initiateConflict({
                    type: 'political',
                    attackers: ['stoic-rival'],
                    defenders: ['shiba-tsukune','otomo-courtier']
                });
                this.otomoCourtier = this.player2.findCardByName('otomo-courtier');
                this.shibaTsukune = this.player2.findCardByName('shiba-tsukune');
                this.miyaMystic = this.player2.findCardByName('miya-mystic');
                this.stoicRival = this.player1.findCardByName('stoic-rival');
                this.player2.playAttachment('ornate-fan','shiba-tsukune');
                this.player1.playAttachment('adopted-kin','stoic-rival');
            });


            it('should allow bowing cards with fewer attachments', function() {
                this.player2.pass();
                this.stoicRival = this.player1.clickCard(this.stoicRival);
                expect(this.player1).toHavePrompt('Stoic Rival');
                expect(this.player1).toBeAbleToSelect(this.otomoCourtier);
            });

            it('should not bow cards with same number of attachments', function() {
                this.player2.pass();
                this.stoicRival = this.player1.clickCard(this.stoicRival);
                expect(this.player1).toHavePrompt('Stoic Rival');
                expect(this.player1).not.toBeAbleToSelect(this.shibaTsukune);
            });

            it('should not bow cards with more attachments', function() {
                this.player2.playAttachment('ornate-fan','shiba-tsukune');
                this.stoicRival = this.player1.clickCard(this.stoicRival);
                expect(this.player1).toHavePrompt('Stoic Rival');
                expect(this.player1).not.toBeAbleToSelect(this.shibaTsukune);
            });

            it('should allow allow bowing cards with an attachment but still fewer', function() {
                this.player2.pass();
                this.player1.playAttachment('ornate-fan', this.stoicRival);
                this.player2.pass();
                this.player1.clickCard(this.stoicRival);
                expect(this.player1).toHavePrompt('Stoic Rival');
                expect(this.player1).toBeAbleToSelect(this.shibaTsukune);
            });

            it('should dishonor the target', function() {
                this.player2.pass();
                this.player1.clickCard(this.stoicRival);
                this.player1.clickCard(this.otomoCourtier);
                expect(this.otomoCourtier.isDishonored).toBe(true);
                expect(this.otomoCourtier.inConflict).toBe(true);
            });

            it('should not be able to target characters not participating', function() {
                this.player2.pass();
                this.player1.clickCard(this.stoicRival);
                expect(this.player1).toHavePrompt('Stoic Rival');
                expect(this.player1).not.toBeAbleToSelect(this.miyaMystic);
            });

            it('should not be able to use while not participating', function() {
                this.player2.clickCard('outwit');
                this.player2.clickCard(this.stoicRival);
                expect(this.stoicRival.inConflict).toBe(false);
                this.player1.clickCard(this.stoicRival);
                expect(this.player1).toHavePrompt('Conflict Action Window');
            });
        });
    });
});
