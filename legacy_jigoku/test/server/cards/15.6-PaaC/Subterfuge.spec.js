describe('Subterfuge', function() {
    integration(function() {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['ikoma-prodigy'],
                    hand: ['regal-bearing'],
                    conflictDiscard: ['fine-katana', 'ornate-fan', 'honored-blade', 'sharpen-the-mind'],
                    dynastyDiscard: ['imperial-storehouse'],
                    honor: 12
                },
                player2: {
                    inPlay: ['master-whisperer'],
                    hand: ['subterfuge'],
                    honor: 9
                }
            });

            this.player1.player.showBid = 5;
            this.player2.player.showBid = 5;

            this.ikomaProdigy = this.player1.findCardByName('ikoma-prodigy');
            this.regalBearing = this.player1.findCardByName('regal-bearing');

            this.fineKatana = this.player1.findCardByName('fine-katana');
            this.ornateFan = this.player1.findCardByName('ornate-fan');
            this.honoredBlade = this.player1.findCardByName('honored-blade');
            this.sharpenTheMind = this.player1.findCardByName('sharpen-the-mind');
            this.storehouse = this.player1.findCardByName('imperial-storehouse');

            this.player1.moveCard(this.fineKatana, 'conflict deck');
            this.player1.moveCard(this.ornateFan, 'conflict deck');
            this.player1.moveCard(this.sharpenTheMind, 'conflict deck');
            this.player1.moveCard(this.honoredBlade, 'conflict deck');
            this.player1.placeCardInProvince(this.storehouse, 'province 1');
            this.storehouse.facedown = false;

            this.whisperer = this.player2.findCardByName('master-whisperer');
            this.subterfuge = this.player2.findCardByName('subterfuge');
        });

        it('discard the first three cards drawn when more than 3 are drawn', function () {
            this.noMoreActions();
            this.initiateConflict({
                type: 'political',
                attackers: [this.ikomaProdigy],
                defenders: [this.whisperer]
            });

            const playerHandSize = this.player1.hand.length - 1; //Playing RB
            this.player2.pass();
            this.player1.clickCard(this.regalBearing);

            expect(this.player2).toHavePrompt('Triggered Abilities');
            expect(this.player2).toBeAbleToSelect(this.subterfuge);
            this.player2.clickCard(this.subterfuge);
            expect(this.player1.hand.length).toBe(playerHandSize + 1);
            expect(this.honoredBlade.location).toBe('conflict discard pile');
            expect(this.ornateFan.location).toBe('conflict discard pile');
            expect(this.sharpenTheMind.location).toBe('conflict discard pile');
            expect(this.fineKatana.location).toBe('hand');
            expect(this.getChatLogs(10)).toContain('player1 plays Regal Bearing to set their bid dial to 1 and draw 4 cards.');
            expect(this.getChatLogs(10)).toContain('player2 plays Subterfuge to prevent 3 cards from being drawn, discarding them instead');
            expect(this.getChatLogs(10)).toContain('player1 discards Honored Blade, Sharpen the Mind and Ornate Fan');
            expect(this.getChatLogs(10)).toContain('player1 draws 1 card');
        });

        it('discard all cards if 3 are drawn', function () {
            this.noMoreActions();
            this.initiateConflict({
                type: 'political',
                attackers: [this.ikomaProdigy],
                defenders: [this.whisperer]
            });

            this.player2.clickCard(this.whisperer);
            this.player2.clickPrompt('player1');

            expect(this.player2).toHavePrompt('Triggered Abilities');
            expect(this.player2).toBeAbleToSelect(this.subterfuge);
            this.player2.clickCard(this.subterfuge);
            expect(this.player1.hand.length).toBe(0);
            expect(this.honoredBlade.location).toBe('conflict discard pile');
            expect(this.ornateFan.location).toBe('conflict discard pile');
            expect(this.sharpenTheMind.location).toBe('conflict discard pile');
            expect(this.getChatLogs(10)).toContain('player2 uses Master Whisperer to make player1 discard 1 cards and draw 3 cards');
            expect(this.getChatLogs(10)).toContain('player2 plays Subterfuge to prevent 3 cards from being drawn, discarding them instead');
            expect(this.getChatLogs(10)).toContain('player1 discards Honored Blade, Sharpen the Mind and Ornate Fan');
        });

        it('discard less cards if less than 3 are drawn', function () {
            const playerHandSize = this.player1.hand.length;
            this.player1.clickCard(this.storehouse);
            expect(this.player2).toHavePrompt('Triggered Abilities');
            expect(this.player2).toBeAbleToSelect(this.subterfuge);
            this.player2.clickCard(this.subterfuge);
            expect(this.player1.hand.length).toBe(playerHandSize);
            expect(this.honoredBlade.location).toBe('conflict discard pile');
            expect(this.ornateFan.location).toBe('conflict deck');
            expect(this.sharpenTheMind.location).toBe('conflict deck');
            expect(this.getChatLogs(10)).toContain('player1 uses Imperial Storehouse, sacrificing Imperial Storehouse to draw 1 card');
            expect(this.getChatLogs(10)).toContain('player2 plays Subterfuge to prevent 1 card from being drawn, discarding it instead');
            expect(this.getChatLogs(10)).toContain('player1 discards Honored Blade');
        });

        it('should not be playable if you are more honorable', function () {
            this.player1.honor = 10;
            this.player2.honor = 15;
            const playerHandSize = this.player1.hand.length;
            this.player1.clickCard(this.storehouse);
            expect(this.player2).not.toHavePrompt('Triggered Abilities');
            expect(this.player1.hand.length).toBe(playerHandSize + 1);
            expect(this.honoredBlade.location).toBe('hand');
            expect(this.getChatLogs(10)).toContain('player1 uses Imperial Storehouse, sacrificing Imperial Storehouse to draw 1 card');
        });

        it('should not be playable if you are equally honorable', function () {
            this.player1.honor = 15;
            this.player2.honor = 15;
            const playerHandSize = this.player1.hand.length;
            this.player1.clickCard(this.storehouse);
            expect(this.player2).not.toHavePrompt('Triggered Abilities');
            expect(this.player1.hand.length).toBe(playerHandSize + 1);
            expect(this.honoredBlade.location).toBe('hand');
            expect(this.getChatLogs(10)).toContain('player1 uses Imperial Storehouse, sacrificing Imperial Storehouse to draw 1 card');
        });
    });
});
