describe('Ki Alignment', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['niten-master', 'ancient-master'],
                    hand: ['ki-alignment'],
                    conflictDiscard: ['fine-katana', 'hurricane-punch', 'centipede-tattoo', 'mantra-of-fire', 'censure', 'ornate-fan', 'ki-alignment', 'hurricane-punch', 'void-fist']
                },
                player2: {
                    inPlay: ['tattooed-wanderer']
                }
            });
            this.nitenMaster = this.player1.findCardByName('niten-master');
            this.ancientMaster = this.player1.findCardByName('ancient-master');
            this.wanderer = this.player2.findCardByName('tattooed-wanderer');
            this.alignment = this.player1.findCardByName('ki-alignment', 'hand');
            this.alignment2 = this.player1.findCardByName('ki-alignment', 'conflict discard pile');

            this.voidFist = this.player1.findCardByName('void-fist');
            this.HP1 = this.player1.filterCardsByName('hurricane-punch')[0];
            this.HP2 = this.player1.filterCardsByName('hurricane-punch')[1];

            this.player1.reduceDeckToNumber('conflict deck', 0);
            this.player1.player.conflictDiscardPile.each(a => this.player1.moveCard(a, 'conflict deck'));
            this.noMoreActions();
        });

        it('should trigger its reaction if you attack with a monk', function() {
            this.initiateConflict({
                attackers: [this.ancientMaster]
            });
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.alignment);
        });

        it('should prompt you to pick two kihos', function() {
            this.initiateConflict({
                attackers: [this.ancientMaster]
            });
            this.player1.clickCard(this.alignment);
            expect(this.player1).toHavePrompt('Select up to 2 cards to reveal');
            expect(this.player1).toHavePromptButton('Void Fist');
            expect(this.player1).toHavePromptButton('Hurricane Punch (2)');
            expect(this.player1).toHavePromptButton('Ki Alignment');
            expect(this.player1).toHavePromptButton('Mantra of Fire');
            expect(this.player1).toHaveDisabledPromptButton('Ornate Fan');
            expect(this.player1).toHaveDisabledPromptButton('Censure');
            expect(this.player1).toHaveDisabledPromptButton('Centipede Tattoo');
            expect(this.player1).toHavePromptButton('Take nothing');
        });

        it('should prompt you to pick two kihos with different names and add them to your hand', function() {
            let hand = this.player1.hand.length;

            this.initiateConflict({
                attackers: [this.ancientMaster]
            });
            this.player1.clickCard(this.alignment);
            expect(this.player1).toHavePrompt('Select up to 2 cards to reveal');
            expect(this.player1).toHavePromptButton('Void Fist');
            expect(this.player1).toHavePromptButton('Hurricane Punch (2)');
            expect(this.player1).toHavePromptButton('Ki Alignment');
            expect(this.player1).toHavePromptButton('Mantra of Fire');
            expect(this.player1).toHaveDisabledPromptButton('Ornate Fan');
            expect(this.player1).toHaveDisabledPromptButton('Censure');
            expect(this.player1).toHaveDisabledPromptButton('Centipede Tattoo');
            expect(this.player1).toHavePromptButton('Take nothing');

            this.player1.clickPrompt('Hurricane Punch (2)');

            expect(this.player1).toHavePromptButton('Void Fist');
            expect(this.player1).toHaveDisabledPromptButton('Hurricane Punch');
            this.player1.clickPrompt('Void Fist');

            expect(this.player1.hand.length).toBe(hand + 1); //-1 Ki Alignment, +2 found cards
            expect(this.voidFist.location).toBe('hand');
            expect(this.HP1.location === 'hand' || this.HP2.location === 'hand').toBe(true);

            expect(this.getChatLogs(5)).toContain('player1 plays Ki Alignment to look at the top eight cards of their deck for up to two kihos');
            expect(this.getChatLogs(5)).toContain('player1 takes Hurricane Punch and Void Fist');
            expect(this.getChatLogs(5)).toContain('player1 is shuffling their conflict deck');
        });

        it('should be able to trigger a grabbed Ki Alignment', function() {
            this.initiateConflict({
                attackers: [this.ancientMaster]
            });
            this.player1.clickCard(this.alignment);
            expect(this.player1).toHavePrompt('Select up to 2 cards to reveal');
            expect(this.player1).toHavePromptButton('Void Fist');
            expect(this.player1).toHavePromptButton('Hurricane Punch (2)');
            expect(this.player1).toHavePromptButton('Ki Alignment');
            expect(this.player1).toHavePromptButton('Mantra of Fire');
            expect(this.player1).toHaveDisabledPromptButton('Ornate Fan');
            expect(this.player1).toHaveDisabledPromptButton('Censure');
            expect(this.player1).toHaveDisabledPromptButton('Centipede Tattoo');
            expect(this.player1).toHavePromptButton('Take nothing');

            this.player1.clickPrompt('Hurricane Punch (2)');
            this.player1.clickPrompt('Ki Alignment');

            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.alignment2);
            this.player1.clickCard(this.alignment2);
            expect(this.player1).toHavePrompt('Select up to 2 cards to reveal');
        });

        it('should not trigger its reaction if you attack without a monk', function() {
            this.initiateConflict({
                attackers: [this.nitenMaster]
            });
            expect(this.player1).not.toHavePrompt('Triggered Abilities');
        });

        it('should not trigger its reaction if your opponent defends with a monk', function() {
            this.initiateConflict({
                attackers: [this.nitenMaster],
                defenders: [this.wanderer]
            });
            expect(this.player1).not.toHavePrompt('Triggered Abilities');
        });

        it('should not trigger its reaction if your opponent attacks with a monk and you defend without one', function() {
            this.player1.passConflict();
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.wanderer],
                defenders: [this.nitenMaster]
            });
            expect(this.player1).not.toHavePrompt('Triggered Abilities');
        });

        it('should trigger its reaction if you defend with a monk', function() {
            this.player1.passConflict();
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.wanderer],
                defenders: [this.ancientMaster]
            });
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.alignment);
        });
    });
});
