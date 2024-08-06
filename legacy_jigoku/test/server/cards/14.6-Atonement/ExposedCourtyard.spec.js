describe('Exposed Courtyard', function() {
    integration(function() {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['kitsu-warrior'],
                    hand: ['banzai']
                },
                player2: {
                    inPlay: ['matsu-tsuko-2'],
                    hand: ['backhanded-compliment', 'way-of-the-lion'],
                    conflictDiscard: ['voice-of-honor', 'soul-beyond-reproach', 'ornate-fan', 'mirumoto-s-fury', 'fine-katana', 'assassination'],
                    dynastyDiscard: ['exposed-courtyard']
                }
            });

            this.warrior = this.player1.findCardByName('kitsu-warrior');
            this.banzai = this.player1.findCardByName('banzai');

            this.tsuko = this.player2.findCardByName('matsu-tsuko-2');
            this.voice = this.player2.findCardByName('voice-of-honor');
            this.soul = this.player2.findCardByName('soul-beyond-reproach');
            this.fan = this.player2.findCardByName('ornate-fan');
            this.fury = this.player2.findCardByName('mirumoto-s-fury');
            this.backhanded = this.player2.findCardByName('backhanded-compliment');
            this.courtyard = this.player2.findCardByName('exposed-courtyard');
            this.lion = this.player2.findCardByName('way-of-the-lion');
            this.katana = this.player2.findCardByName('fine-katana');
            this.assassination = this.player2.findCardByName('assassination');

            this.player2.reduceDeckToNumber('conflict deck', 0);
            this.player2.moveCard(this.assassination, 'conflict deck');
            this.player2.moveCard(this.fan, 'conflict deck');
            this.player2.moveCard(this.fury, 'conflict deck');
            this.player2.moveCard(this.katana, 'conflict deck');
            this.player2.placeCardInProvince(this.courtyard, 'province 1');
            this.courtyard.facedown = false;
        });

        it('should discard 2 cards as a cost', function () {
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.warrior],
                defenders: [this.tsuko]
            });
            this.player2.clickCard(this.courtyard);
            expect(this.player2).toHavePrompt('Choose an event');
            expect(this.katana.location).toBe('conflict discard pile');
            expect(this.fury.location).toBe('conflict discard pile');
            expect(this.fan.location).toBe('conflict deck');
        });

        it('should not work in a pol conflict', function () {
            this.noMoreActions();
            this.initiateConflict({
                type: 'political',
                attackers: [this.warrior],
                defenders: [this.tsuko]
            });
            this.player2.clickCard(this.courtyard);
            expect(this.player2).toHavePrompt('Conflict Action Window');
        });

        it('should let you pick an event in your discard pile', function () {
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.warrior],
                defenders: [this.tsuko]
            });
            this.player2.clickCard(this.courtyard);
            expect(this.getChatLogs(5)).toContain('player2 uses Exposed Courtyard, discarding Fine Katana and Mirumoto\'s Fury to pick an event to make playable this conflict');
            expect(this.player2).toHavePrompt('Choose an event');
            expect(this.player2).toBeAbleToSelect(this.voice);
            expect(this.player2).toBeAbleToSelect(this.soul);
            expect(this.player2).toBeAbleToSelect(this.fury);
            expect(this.player2).not.toBeAbleToSelect(this.katana);
            expect(this.player2).not.toBeAbleToSelect(this.fan);
            expect(this.player2).not.toBeAbleToSelect(this.backhanded);
            expect(this.player2).not.toBeAbleToSelect(this.lion);
            expect(this.player2).not.toBeAbleToSelect(this.assassination);
        });

        it('should let you play the picked event and return it to the bottom of the deck', function () {
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.warrior],
                defenders: [this.tsuko]
            });
            this.player2.clickCard(this.courtyard);
            expect(this.player2).toHavePrompt('Choose an event');
            this.player2.clickCard(this.soul);
            expect(this.getChatLogs(3)).toContain('player2 can play Soul Beyond Reproach this conflict. It will be put on the bottom of the deck if it\'s played this conflict');
            this.player1.pass();
            this.player2.clickCard(this.soul);
            this.player2.clickCard(this.tsuko);
            expect(this.tsuko.isHonored).toBe(true);
            expect(this.getChatLogs(4)).toContain('player2 plays Soul Beyond Reproach to honor Matsu Tsuko, then honor it again');
            expect(this.getChatLogs(4)).toContain('Soul Beyond Reproach returns to the bottom of the deck due to Exposed Courtyard\'s effect');
            expect(this.soul.location).toBe('conflict deck');
        });

        it('should let you play interrupts', function () {
            this.player2.moveCard(this.soul, 'hand');
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.warrior],
                defenders: [this.tsuko]
            });
            this.player2.clickCard(this.courtyard);
            expect(this.player2).toHavePrompt('Choose an event');
            this.player2.clickCard(this.voice);
            expect(this.getChatLogs(3)).toContain('player2 can play Voice of Honor this conflict. It will be put on the bottom of the deck if it\'s played this conflict');
            this.player1.pass();
            this.player2.clickCard(this.soul);
            this.player2.clickCard(this.tsuko);
            expect(this.tsuko.isHonored).toBe(true);
            this.player1.clickCard(this.banzai);
            this.player1.clickCard(this.warrior);
            expect(this.player2).toHavePrompt('Triggered Abilities');
            expect(this.player2).toBeAbleToSelect(this.voice);
            this.player2.clickCard(this.voice);
            expect(this.getChatLogs(4)).toContain('player2 plays Voice of Honor to cancel the effects of Banzai!');
            expect(this.getChatLogs(4)).toContain('Voice of Honor returns to the bottom of the deck due to Exposed Courtyard\'s effect');
            expect(this.voice.location).toBe('conflict deck');
        });

        it('should let you pick an event you just played', function () {
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.warrior],
                defenders: [this.tsuko]
            });
            this.player2.clickCard(this.lion);
            this.player2.clickCard(this.tsuko);
            this.player1.pass();
            this.player2.clickCard(this.courtyard);
            expect(this.player2).toHavePrompt('Choose an event');
            this.player2.clickCard(this.lion);
            expect(this.getChatLogs(3)).toContain('player2 can play Way of the Lion this conflict. It will be put on the bottom of the deck if it\'s played this conflict');
            this.player1.pass();
            this.player2.clickCard(this.lion);
            this.player2.clickCard(this.tsuko);
            expect(this.player1).toHavePrompt('Conflict Action Window');
            expect(this.lion.location).toBe('conflict deck');
        });

        it('if you re-draw the event it should work normally', function () {
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.warrior],
                defenders: [this.tsuko]
            });
            this.player2.clickCard(this.lion);
            this.player2.clickCard(this.tsuko);
            this.player1.pass();
            this.player2.clickCard(this.courtyard);
            expect(this.player2).toHavePrompt('Choose an event');
            this.player2.clickCard(this.lion);
            expect(this.getChatLogs(3)).toContain('player2 can play Way of the Lion this conflict. It will be put on the bottom of the deck if it\'s played this conflict');
            this.player1.pass();
            this.player2.clickCard(this.lion);
            this.player2.clickCard(this.tsuko);
            expect(this.lion.location).toBe('conflict deck');
            this.player2.moveCard(this.lion, 'hand');
            this.player1.pass();
            this.player2.clickCard(this.lion);
            this.player2.clickCard(this.tsuko);
            expect(this.lion.location).toBe('conflict discard pile');
            this.player1.pass();
            this.player2.clickCard(this.lion);
            expect(this.player2).toHavePrompt('Conflict Action Window');
        });
    });
});
