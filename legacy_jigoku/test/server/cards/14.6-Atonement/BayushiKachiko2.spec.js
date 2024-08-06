describe('Bayushi Kachiko 2', function() {
    integration(function() {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['bayushi-kachiko-2', 'kitsu-warrior']
                },
                player2: {
                    inPlay: ['kakita-yoshi'],
                    hand: ['mirumoto-s-fury', 'backhanded-compliment', 'way-of-the-crane'],
                    conflictDiscard: ['voice-of-honor', 'soul-beyond-reproach', 'ornate-fan', 'court-games', 'spreading-the-darkness', 'scouted-terrain', 'chasing-the-sun']
                }
            });

            this.yoshi = this.player2.findCardByName('kakita-yoshi');
            this.crane = this.player2.findCardByName('way-of-the-crane');
            this.warrior = this.player1.findCardByName('kitsu-warrior');
            this.kachiko = this.player1.findCardByName('bayushi-kachiko-2');
            this.voice = this.player2.findCardByName('voice-of-honor');
            this.soul = this.player2.findCardByName('soul-beyond-reproach');
            this.fan = this.player2.findCardByName('ornate-fan');
            this.courtGames = this.player2.findCardByName('court-games');
            this.fury = this.player2.findCardByName('mirumoto-s-fury');
            this.backhanded = this.player2.findCardByName('backhanded-compliment');
            this.spreading = this.player2.findCardByName('spreading-the-darkness');
            this.scouted = this.player2.findCardByName('scouted-terrain');
            this.chasing = this.player2.findCardByName('chasing-the-sun');

            this.p2_1 = this.player2.findCardByName('shameful-display', 'province 1');
            this.p2_2 = this.player2.findCardByName('shameful-display', 'province 2');
            this.p2_3 = this.player2.findCardByName('shameful-display', 'province 3');
            this.p2_4 = this.player2.findCardByName('shameful-display', 'province 4');
            this.p2_Stronghold = this.player2.findCardByName('shameful-display', 'stronghold province');
        });

        describe('Playing from opponent\'s conflict deck', function() {
            it('should let you play while participating in a pol conflict and remove from game', function () {
                this.noMoreActions();
                this.initiateConflict({
                    type: 'political',
                    attackers: [this.kachiko, this.warrior],
                    defenders: []
                });
                this.player2.pass();
                expect(this.player1).toHavePrompt('Conflict Action Window');
                this.player1.clickCard(this.soul);
                this.player1.clickCard(this.kachiko);
                expect(this.kachiko.isHonored).toBe(true);
                expect(this.player2).toHavePrompt('Conflict Action Window');
                expect(this.getChatLogs(5)).toContain('player1 plays a card from their opponent\'s conflict discard pile due to the ability of Bayushi Kachiko (2 uses remaining)');
                expect(this.getChatLogs(5)).toContain('Soul Beyond Reproach is removed from the game due to the ability of Bayushi Kachiko');
                expect(this.soul.location).toBe('removed from game');
            });

            it('should not let opponent play while participating in a pol conflict', function () {
                this.noMoreActions();
                this.initiateConflict({
                    type: 'political',
                    attackers: [this.kachiko, this.warrior],
                    defenders: []
                });
                this.player2.clickCard(this.soul);
                this.player2.clickCard(this.yoshi);
                expect(this.yoshi.isHonored).toBe(false);
                expect(this.player2).toHavePrompt('Conflict Action Window');
            });

            it('should not let you play non-events', function () {
                this.noMoreActions();
                this.initiateConflict({
                    type: 'political',
                    attackers: [this.kachiko, this.warrior],
                    defenders: []
                });
                this.player2.pass();
                expect(this.player1).toHavePrompt('Conflict Action Window');
                this.player1.clickCard(this.fan);
                this.player1.clickCard(this.kachiko);
                expect(this.player1).toHavePrompt('Conflict Action Window');
            });

            it('should let you play interrupts', function () {
                this.noMoreActions();
                this.initiateConflict({
                    type: 'political',
                    attackers: [this.kachiko, this.warrior],
                    defenders: []
                });
                this.player2.pass();
                expect(this.player1).toHavePrompt('Conflict Action Window');
                this.player1.clickCard(this.soul);
                this.player1.clickCard(this.kachiko);
                expect(this.kachiko.isHonored).toBe(true);
                this.player2.clickCard(this.fury);
                this.player2.clickCard(this.kachiko);
                expect(this.player1).toHavePrompt('Triggered Abilities');
                expect(this.player1).toBeAbleToSelect(this.voice);
                this.player1.clickCard(this.voice);
                expect(this.getChatLogs(10)).toContain('player1 plays Voice of Honor to cancel the effects of Mirumoto\'s Fury');
            });

            it('should let you play newly discarded events', function () {
                this.noMoreActions();
                this.initiateConflict({
                    type: 'political',
                    attackers: [this.kachiko, this.warrior],
                    defenders: []
                });
                this.player2.pass();
                expect(this.player1).toHavePrompt('Conflict Action Window');
                this.player1.clickCard(this.soul);
                this.player1.clickCard(this.kachiko);
                expect(this.kachiko.isHonored).toBe(true);
                this.player2.clickCard(this.fury);
                this.player2.clickCard(this.kachiko);
                expect(this.player1).toHavePrompt('Triggered Abilities');
                this.player1.clickCard(this.voice);
                expect(this.kachiko.bowed).toBe(false);
                this.player1.clickCard(this.fury);
                this.player1.clickCard(this.kachiko);
                expect(this.kachiko.bowed).toBe(true);
            });

            it('should remove from game even if event is cancelled', function () {
                this.player2.moveCard(this.voice, 'hand');
                this.noMoreActions();
                this.initiateConflict({
                    type: 'political',
                    attackers: [this.kachiko, this.warrior],
                    defenders: []
                });
                this.player2.clickCard(this.crane);
                this.player2.clickCard(this.yoshi);
                expect(this.player1).toHavePrompt('Conflict Action Window');
                this.player1.clickCard(this.soul);
                this.player1.clickCard(this.kachiko);
                expect(this.player2).toHavePrompt('Triggered Abilities');
                expect(this.player2).toBeAbleToSelect(this.voice);
                this.player2.clickCard(this.voice);
                expect(this.kachiko.isHonored).toBe(false);
                expect(this.player2).toHavePrompt('Conflict Action Window');
                expect(this.getChatLogs(5)).toContain('player1 plays a card from their opponent\'s conflict discard pile due to the ability of Bayushi Kachiko (2 uses remaining)');
                expect(this.getChatLogs(5)).toContain('Soul Beyond Reproach is removed from the game due to the ability of Bayushi Kachiko');
                expect(this.soul.location).toBe('removed from game');
                expect(this.voice.location).toBe('conflict discard pile');
            });

            it('should not let you play the event from removed from game', function () {
                this.player2.moveCard(this.voice, 'hand');
                this.noMoreActions();
                this.initiateConflict({
                    type: 'political',
                    attackers: [this.kachiko, this.warrior],
                    defenders: []
                });
                this.player2.pass();
                expect(this.player1).toHavePrompt('Conflict Action Window');
                this.player1.clickCard(this.soul);
                this.player1.clickCard(this.kachiko);
                expect(this.kachiko.isHonored).toBe(true);
                this.player2.pass();
                expect(this.player1).toHavePrompt('Conflict Action Window');
                this.player1.clickCard(this.soul);
                this.player1.clickCard(this.warrior);
                expect(this.warrior.isHonored).toBe(false);
                expect(this.player1).toHavePrompt('Conflict Action Window');
            });

            it('should not let you play while participating in a mil conflict', function () {
                this.noMoreActions();
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.kachiko, this.warrior],
                    defenders: []
                });
                this.player2.pass();
                expect(this.player1).toHavePrompt('Conflict Action Window');
                this.player1.clickCard(this.soul);
                expect(this.player1).toHavePrompt('Conflict Action Window');
                expect(this.soul.location).toBe('conflict discard pile');
            });

            it('should not let you play while not participating in a pol conflict', function () {
                this.noMoreActions();
                this.initiateConflict({
                    type: 'political',
                    attackers: [this.warrior],
                    defenders: []
                });
                this.player2.pass();
                expect(this.player1).toHavePrompt('Conflict Action Window');
                this.player1.clickCard(this.soul);
                expect(this.player1).toHavePrompt('Conflict Action Window');
                expect(this.soul.location).toBe('conflict discard pile');
            });

            it('should not let you play cards once the conflict ends', function () {
                this.noMoreActions();
                this.initiateConflict({
                    type: 'political',
                    attackers: [this.kachiko],
                    defenders: [this.yoshi]
                });
                this.noMoreActions();
                this.player1.clickPrompt('Don\'t Resolve');
                expect(this.player1).toHavePrompt('Action Window');
                this.kachiko.honor();
                this.player1.clickCard(this.soul);
                expect(this.player1).toHavePrompt('Action Window');
                this.player1.pass();
                expect(this.kachiko.isHonored).toBe(true);
                this.player2.clickCard(this.crane);
                this.player2.clickCard(this.yoshi);
                expect(this.player1).not.toHavePrompt('Triggered Abilities');
                expect(this.player1).not.toBeAbleToSelect(this.voice);
                expect(this.yoshi.isHonored).toBe(true);
            });
        });

        describe('Max 3 cards', function() {
            it('should only let you play three cards', function () {
                this.noMoreActions();
                this.initiateConflict({
                    type: 'political',
                    attackers: [this.kachiko, this.warrior],
                    defenders: []
                });
                this.player2.pass();
                expect(this.player1).toHavePrompt('Conflict Action Window');
                this.player1.clickCard(this.soul);
                this.player1.clickCard(this.kachiko);
                expect(this.kachiko.isHonored).toBe(true);
                this.player2.clickCard(this.fury);
                this.player2.clickCard(this.kachiko);
                expect(this.player1).toHavePrompt('Triggered Abilities');
                this.player1.clickCard(this.voice);
                this.player1.clickCard(this.fury);
                this.player1.clickCard(this.kachiko);
                expect(this.kachiko.bowed).toBe(true);
                this.player2.pass();
                expect(this.player1).toHavePrompt('Conflict Action Window');
                this.player1.clickCard(this.courtGames);
                expect(this.player1).toHavePrompt('Conflict Action Window');
            });
        });

        it('chat messages', function () {
            this.noMoreActions();
            this.initiateConflict({
                type: 'political',
                attackers: [this.kachiko, this.warrior],
                defenders: []
            });
            this.player2.pass();
            this.player1.clickCard(this.soul);
            this.player1.clickCard(this.kachiko);
            expect(this.getChatLogs(15)).toContain('player1 plays Soul Beyond Reproach from their opponent\'s conflict discard pile');
            expect(this.getChatLogs(5)).toContain('player1 plays a card from their opponent\'s conflict discard pile due to the ability of Bayushi Kachiko (2 uses remaining)');
            expect(this.getChatLogs(5)).toContain('Soul Beyond Reproach is removed from the game due to the ability of Bayushi Kachiko');

            this.player2.clickCard(this.fury);
            this.player2.clickCard(this.kachiko);
            this.player1.clickCard(this.voice);
            expect(this.getChatLogs(15)).toContain('player1 plays Voice of Honor from their opponent\'s conflict discard pile');
            expect(this.getChatLogs(5)).toContain('player1 plays a card from their opponent\'s conflict discard pile due to the ability of Bayushi Kachiko (1 use remaining)');
            expect(this.getChatLogs(5)).toContain('Voice of Honor is removed from the game due to the ability of Bayushi Kachiko');

            this.player1.clickCard(this.fury);
            this.player1.clickCard(this.kachiko);
            expect(this.getChatLogs(15)).toContain('player1 plays Mirumoto\'s Fury from their opponent\'s conflict discard pile');
            expect(this.getChatLogs(5)).toContain('player1 plays a card from their opponent\'s conflict discard pile due to the ability of Bayushi Kachiko (0 uses remaining)');
            expect(this.getChatLogs(5)).toContain('Mirumoto\'s Fury is removed from the game due to the ability of Bayushi Kachiko');
        });

        describe('Reported Bugs', function() {
            it('Spreading the Darkness', function () {
                this.noMoreActions();
                this.initiateConflict({
                    type: 'political',
                    attackers: [this.kachiko, this.warrior],
                    defenders: []
                });
                this.player2.pass();
                this.player1.clickCard(this.spreading);
                this.player1.clickCard(this.kachiko);
                expect(this.spreading.location).toBe('removed from game');
                this.player2.clickCard(this.fury);
                expect(this.player2).toBeAbleToSelect(this.warrior);
                expect(this.player2).not.toBeAbleToSelect(this.kachiko);
            });

            it('Scouted Terrain', function () {
                this.p2_1.facedown = false;
                this.p2_2.facedown = false;
                this.p2_3.facedown = false;
                this.p2_4.facedown = false;
                this.p2_Stronghold.facedown = false;

                this.noMoreActions();
                this.initiateConflict({
                    type: 'political',
                    attackers: [this.kachiko, this.warrior],
                    defenders: []
                });
                this.player2.pass();
                this.player1.clickCard(this.scouted);
                expect(this.scouted.location).toBe('removed from game');
                this.player2.pass();
                this.player1.clickCard(this.chasing);
                expect(this.player1).toBeAbleToSelect(this.p2_4);
                expect(this.player1).toBeAbleToSelect(this.p2_Stronghold);
            });
        });
    });
});
