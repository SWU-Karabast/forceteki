describe('Funeral', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'dynasty',
                player1: {
                    honor: 3,
                    inPlay: ['soshi-illusionist'],
                    hand: ['funeral', 'force-of-the-river', 'assassination', 'banzai'],
                    dynastyDiscard: ['imperial-storehouse', 'favorable-ground']
                },
                player2: {
                    honor: 11,
                    inPlay: ['doji-whisperer'],
                    hand: ['assassination']
                }
            });

            this.duty = this.player1.findCardByName('funeral');
            this.soshiIllusionist = this.player1.findCardByName('soshi-illusionist');
            this.imperialStorehouse = this.player1.placeCardInProvince('imperial-storehouse');
            this.favorableGround = this.player1.placeCardInProvince('favorable-ground', 'province 2');

            this.dojiWhisperer = this.player2.findCardByName('doji-whisperer');
        });

        it('should not trigger when losing due to draw bids', function() {
            this.advancePhases('draw');
            this.player1.clickPrompt('5');
            this.player2.clickPrompt('1');
            expect(this.player1).not.toHavePrompt('Triggered Abilities');
            expect(this.player1).toHavePrompt('Game Won');
        });

        it('should not trigger when losing due paying a cost', function() {
            this.advancePhases('conflict');
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.soshiIllusionist],
                defenders: []
            });
            this.player2.pass();
            this.player1.clickCard('assassination');
            this.player1.clickCard(this.dojiWhisperer);
            expect(this.player1).toHavePrompt('Game Won');
        });

        it('should not trigger when favor not claimed', function() {
            this.advancePhases('conflict');
            this.player1.player.dynastyDeck.each(card => {
                this.player1.player.moveCard(card, 'dynasty discard pile');
            });
            this.imperialStorehouse.facedown = true;
            this.favorableGround.facedown = true;
            this.forceOfTheRiver = this.player1.playAttachment('force-of-the-river', this.soshiIllusionist);
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.soshiIllusionist],
                defenders: []
            });
            this.player2.pass();
            this.player1.clickCard(this.forceOfTheRiver);
            expect(this.imperialStorehouse.location).toBe('removed from game');
            expect(this.favorableGround.location).toBe('removed from game');
            expect(this.player1).not.toHavePrompt('Triggered Abilities');
            expect(this.player1).toHavePrompt('Game Won');
        });

        it('should not trigger when favor military', function() {
            this.player1.player.imperialFavor = 'military';
            this.advancePhases('conflict');
            this.player1.player.dynastyDeck.each(card => {
                this.player1.player.moveCard(card, 'dynasty discard pile');
            });
            this.imperialStorehouse.facedown = true;
            this.favorableGround.facedown = true;
            this.forceOfTheRiver = this.player1.playAttachment('force-of-the-river', this.soshiIllusionist);
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.soshiIllusionist],
                defenders: []
            });
            this.player2.pass();
            this.player1.clickCard(this.forceOfTheRiver);
            expect(this.imperialStorehouse.location).toBe('removed from game');
            expect(this.favorableGround.location).toBe('removed from game');
            expect(this.player1).not.toHavePrompt('Triggered Abilities');
            expect(this.player1).toHavePrompt('Game Won');
        });

        it('should trigger when losing due to running out of dynasty cards and remove self from game', function() {
            this.player2.player.imperialFavor = 'political';
            this.advancePhases('conflict');
            this.player1.player.dynastyDeck.each(card => {
                this.player1.player.moveCard(card, 'dynasty discard pile');
            });
            this.imperialStorehouse.facedown = true;
            this.favorableGround.facedown = true;
            this.forceOfTheRiver = this.player1.playAttachment('force-of-the-river', this.soshiIllusionist);
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.soshiIllusionist],
                defenders: []
            });
            this.player2.pass();
            this.player1.clickCard(this.forceOfTheRiver);
            expect(this.imperialStorehouse.location).toBe('removed from game');
            expect(this.favorableGround.location).toBe('removed from game');
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.duty);
            this.player1.clickCard(this.duty);
            expect(this.player1.honor).toBe(4);
            expect(this.player2.honor).toBe(11);
            expect(this.duty.location).toBe('removed from game');
            expect(this.getChatLogs(5)).toContain('player1 plays Funeral to cancel their honor loss, then gain 1 honor');
            expect(this.getChatLogs(5)).toContain('Funeral is removed from the game due the effects of Funeral');
        });

        it('should trigger when losing due to running out of conflict cards', function() {
            this.player2.player.imperialFavor = 'political';
            this.advancePhases('conflict');
            this.player1.player.conflictDeck.each(card => {
                this.player1.player.moveCard(card, 'conflict discard pile');
            });
            let hand = this.player1.hand.length;
            this.player1.clickCard(this.imperialStorehouse);
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.duty);
            this.player1.clickCard(this.duty);
            expect(this.player1.honor).toBe(4);
            expect(this.player1.hand.length).toBe(hand);
        });

        it('should trigger when losing due to dishonored character leaving play', function() {
            this.player1.player.imperialFavor = 'political';
            this.advancePhases('conflict');
            this.soshiIllusionist.dishonor();
            this.player1.honor = 1;
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.soshiIllusionist],
                defenders: []
            });
            this.player2.clickCard('assassination');
            this.player2.clickCard(this.soshiIllusionist);
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.duty);
            this.player1.clickCard(this.duty);
            expect(this.player1.honor).toBe(2);
            expect(this.player2.honor).toBe(8);
            expect(this.soshiIllusionist.location).toBe('dynasty discard pile');
        });

        it('should trigger when Banzai is kicked, but not allow the second resolution', function() {
            this.player1.player.imperialFavor = 'political';
            this.advancePhases('conflict');
            this.player1.honor = 1;
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.soshiIllusionist],
                defenders: []
            });
            this.player2.pass();
            this.player1.clickCard('banzai');
            this.player1.clickCard(this.soshiIllusionist);
            this.player1.clickPrompt('Lose 1 honor to resolve this ability again');
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.duty);
            this.player1.clickCard(this.duty);
            expect(this.player1.honor).toBe(2);
            expect(this.player2.honor).toBe(11);
            expect(this.player2).toHavePrompt('Conflict Action Window');
            expect(this.soshiIllusionist.militarySkill).toBe(3);
        });
    });
});
