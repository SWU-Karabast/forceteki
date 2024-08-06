describe('Move as One', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['niten-master', 'ancient-master'],
                    hand: ['move-as-one'],
                    conflictDiscard: ['fine-katana', 'hurricane-punch', 'centipede-tattoo', 'mantra-of-fire', 'censure', 'ornate-fan', 'move-as-one', 'hurricane-punch', 'void-fist']
                },
                player2: {
                    inPlay: ['tattooed-wanderer']
                }
            });
            this.nitenMaster = this.player1.findCardByName('niten-master');
            this.ancientMaster = this.player1.findCardByName('ancient-master');
            this.wanderer = this.player2.findCardByName('tattooed-wanderer');
            this.alignment = this.player1.findCardByName('move-as-one', 'hand');
            this.alignment2 = this.player1.findCardByName('move-as-one', 'conflict discard pile');

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

        it('should prompt you to pick a kihos', function() {
            this.initiateConflict({
                attackers: [this.ancientMaster]
            });
            this.player1.clickCard(this.alignment);
            expect(this.player1).toHavePrompt('Select a card to reveal');
            expect(this.player1).toHavePromptButton('Void Fist');
            expect(this.player1).toHavePromptButton('Hurricane Punch (2)');
            expect(this.player1).toHavePromptButton('Move as One');
            expect(this.player1).toHavePromptButton('Mantra of Fire');
            expect(this.player1).toHaveDisabledPromptButton('Ornate Fan');
            expect(this.player1).toHaveDisabledPromptButton('Censure');
            expect(this.player1).toHaveDisabledPromptButton('Centipede Tattoo');
            expect(this.player1).toHavePromptButton('Take nothing');
        });

        it('should add it to your hand', function() {
            let hand = this.player1.hand.length;

            this.initiateConflict({
                attackers: [this.ancientMaster]
            });
            this.player1.clickCard(this.alignment);
            expect(this.player1).toHavePromptButton('Void Fist');
            expect(this.player1).toHavePromptButton('Hurricane Punch (2)');
            expect(this.player1).toHavePromptButton('Move as One');
            expect(this.player1).toHavePromptButton('Mantra of Fire');
            expect(this.player1).toHaveDisabledPromptButton('Ornate Fan');
            expect(this.player1).toHaveDisabledPromptButton('Censure');
            expect(this.player1).toHaveDisabledPromptButton('Centipede Tattoo');
            expect(this.player1).toHavePromptButton('Take nothing');

            this.player1.clickPrompt('Void Fist');

            expect(this.player1.hand.length).toBe(hand); //-1 Ki Alignment, +2 found cards
            expect(this.voidFist.location).toBe('hand');

            expect(this.getChatLogs(5)).toContain('player1 plays Move as One to look at the top eight cards of their deck for a kiho');
            expect(this.getChatLogs(5)).toContain('player1 takes Void Fist');
            expect(this.getChatLogs(5)).toContain('player1 puts 7 cards on the bottom of their conflict deck');
        });

        it('should be max 1 per round', function() {
            this.initiateConflict({
                attackers: [this.ancientMaster]
            });
            this.player1.clickCard(this.alignment);
            expect(this.player1).toHavePrompt('Select a card to reveal');
            expect(this.player1).toHavePromptButton('Void Fist');
            expect(this.player1).toHavePromptButton('Hurricane Punch (2)');
            expect(this.player1).toHavePromptButton('Move as One');
            expect(this.player1).toHavePromptButton('Mantra of Fire');
            expect(this.player1).toHaveDisabledPromptButton('Ornate Fan');
            expect(this.player1).toHaveDisabledPromptButton('Censure');
            expect(this.player1).toHaveDisabledPromptButton('Centipede Tattoo');
            expect(this.player1).toHavePromptButton('Take nothing');

            this.player1.clickPrompt('Hurricane Punch (2)');
            expect(this.player1).not.toHavePrompt('Triggered Abilities');
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
