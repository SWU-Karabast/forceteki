describe('Return The Offense', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    honor:10,
                    inPlay: ['border-rider', 'hida-yakamo', 'togashi-mitsu-2'],
                    hand: ['a-new-name', 'a-new-name', 'a-new-name', 'a-new-name', 'a-new-name', 'fan-of-command', 'ornate-fan']
                },
                player2: {
                    honor:14,
                    inPlay: ['kakita-yoshi'],
                    hand: ['return-the-offense', 'fan-of-command', 'mirumoto-s-fury']
                }
            });

            this.mitsu = this.player1.findCardByName('togashi-mitsu-2');
            this.borderRider = this.player1.findCardByName('border-rider');
            this.yakamo = this.player1.findCardByName('hida-yakamo');
            this.fanp1 = this.player1.findCardByName('fan-of-command');

            this.yoshi = this.player2.findCardByName('kakita-yoshi');
            this.fanp2 = this.player2.findCardByName('fan-of-command');
            this.fury = this.player2.findCardByName('mirumoto-s-fury');
            this.returnTheOffense = this.player2.findCardByName('return-the-offense');

            this.player1.playAttachment(this.fanp1, this.borderRider);
            this.player2.playAttachment(this.fanp2, this.yoshi);
            this.player1.playAttachment('ornate-fan', this.borderRider);
        });

        it('chat message', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.borderRider],
                defenders: [this.yoshi],
                type: 'political'
            });

            this.player2.clickCard(this.returnTheOffense);
            this.player2.clickCard(this.yoshi);
            this.player2.clickCard(this.borderRider);
            this.player2.clickPrompt('1');
            this.player1.clickPrompt('1');

            expect(this.getChatLogs(4)).toContain('Kakita Yoshi: 8 vs 5: Border Rider');
            expect(this.getChatLogs(3)).toContain('Duel Effect: Kakita Yoshi does not bow as a result of conflict resolution and Border Rider cannot be readied');
        });

        it('chat message - no loser', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.yakamo],
                defenders: [this.yoshi],
                type: 'political'
            });

            this.player2.clickCard(this.returnTheOffense);
            this.player2.clickCard(this.yoshi);
            this.player2.clickCard(this.yakamo);
            this.player2.clickPrompt('1');
            this.player1.clickPrompt('1');

            expect(this.getChatLogs(4)).toContain('Kakita Yoshi: 8 vs 3: Hida Yakamo');
            expect(this.getChatLogs(3)).toContain('Duel Effect: Kakita Yoshi does not bow as a result of conflict resolution');
        });

        it('should prevent the loser from standing', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.borderRider],
                defenders: [this.yoshi],
                type: 'political'
            });

            this.player2.clickCard(this.fury);
            this.player2.clickCard(this.borderRider);
            expect(this.borderRider.bowed).toBe(true);
            this.player1.pass();

            this.player2.clickCard(this.returnTheOffense);
            this.player2.clickCard(this.yoshi);
            this.player2.clickCard(this.borderRider);
            this.player2.clickPrompt('1');
            this.player1.clickPrompt('1');

            expect(this.player1).toHavePrompt('Conflict Action Window');
            this.player1.clickCard(this.borderRider);
            expect(this.borderRider.bowed).toBe(true);
            expect(this.player1).toHavePrompt('Conflict Action Window');
            this.player1.clickCard(this.fanp1);
            expect(this.player1).toHavePrompt('Conflict Action Window');
            this.player1.pass();
            expect(this.player2).toHavePrompt('Conflict Action Window');
            this.player2.clickCard(this.fanp2);
            expect(this.player2).toHavePrompt('Conflict Action Window');
        });

        it('should prevent the winner from bowing at the end of the conflict', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.borderRider],
                defenders: [this.yoshi],
                type: 'political'
            });

            this.player2.clickCard(this.returnTheOffense);
            this.player2.clickCard(this.yoshi);
            this.player2.clickCard(this.borderRider);
            this.player2.clickPrompt('1');
            this.player1.clickPrompt('1');

            this.noMoreActions();
            expect(this.borderRider.bowed).toBe(true);
            expect(this.yoshi.bowed).toBe(false);
        });

        it('should allow the loser to ready once the conflict has ended', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.borderRider],
                defenders: [this.yoshi],
                type: 'political'
            });

            this.player2.clickCard(this.returnTheOffense);
            this.player2.clickCard(this.yoshi);
            this.player2.clickCard(this.borderRider);
            this.player2.clickPrompt('1');
            this.player1.clickPrompt('1');

            this.noMoreActions();
            expect(this.borderRider.bowed).toBe(true);
            expect(this.yoshi.bowed).toBe(false);
            this.player1.clickCard(this.borderRider);
            expect(this.borderRider.bowed).toBe(false);
        });

        it('nothing should happen on a tie', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.borderRider],
                defenders: [this.yoshi],
                type: 'political'
            });

            this.player2.clickCard(this.fury);
            this.player2.clickCard(this.borderRider);
            expect(this.borderRider.bowed).toBe(true);
            this.player1.pass();

            this.player2.clickCard(this.returnTheOffense);
            this.player2.clickCard(this.yoshi);
            this.player2.clickCard(this.borderRider);
            this.player2.clickPrompt('1');
            this.player1.clickPrompt('4');

            expect(this.getChatLogs(4)).toContain('The duel ends in a draw');
            expect(this.getChatLogs(3)).toContain('The duel has no effect');
        });

        it('reported bug - should be able to stand the loser using the water ring', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.borderRider, this.mitsu],
                defenders: [this.yoshi],
                type: 'military',
                ring: 'water'
            });

            this.player2.clickCard(this.fury);
            this.player2.clickCard(this.borderRider);
            expect(this.borderRider.bowed).toBe(true);
            this.player1.pass();

            this.player2.clickCard(this.returnTheOffense);
            this.player2.clickCard(this.yoshi);
            this.player2.clickCard(this.borderRider);
            this.player2.clickPrompt('1');
            this.player1.clickPrompt('1');

            let i = 0;

            for(i = 0; i < 5; i++) {
                this.player1.playAttachment(this.player1.filterCardsByName('a-new-name')[i], this.mitsu);
                this.player2.pass();
            }

            expect(this.borderRider.bowed).toBe(true);
            this.player1.clickCard(this.mitsu);
            this.player1.clickRing('water');
            expect(this.player1).toHavePrompt('Water Ring');
            expect(this.player1).toBeAbleToSelect(this.borderRider);
            this.player1.clickCard(this.borderRider);
            expect(this.getChatLogs(10)).toContain('player1 resolves the water ring, readying Border Rider');
            expect(this.borderRider.bowed).toBe(false);
        });
    });
});
