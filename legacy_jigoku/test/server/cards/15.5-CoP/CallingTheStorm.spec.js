describe('Calling the Storm', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['doji-kuwanan'],
                    hand: ['calling-the-storm', 'fine-katana', 'warm-welcome'],
                    conflictDiscard: [
                        'voice-of-honor',
                        'soul-beyond-reproach',
                        'a-new-name',
                        'ornate-fan',
                        'way-of-the-scorpion'
                    ]
                },
                player2: {
                    inPlay: ['kitsu-motso'],
                    hand: ['mirumoto-s-fury', 'backhanded-compliment']
                }
            });

            this.player1.player.showBid = 1;
            this.player2.player.showBid = 5;

            this.kuwanan = this.player1.findCardByName('doji-kuwanan');
            this.voice = this.player1.findCardByName('voice-of-honor');
            this.soul = this.player1.findCardByName('soul-beyond-reproach');
            this.ann = this.player1.findCardByName('a-new-name');
            this.katana = this.player1.findCardByName('fine-katana');
            this.fan = this.player1.findCardByName('ornate-fan');
            this.fury = this.player2.findCardByName('mirumoto-s-fury');
            this.province = this.player2.findCardByName('shameful-display', 'province 1');
            this.backhanded = this.player2.findCardByName('backhanded-compliment');

            this.motso = this.player2.findCardByName('kitsu-motso');

            this.player1.moveCard(this.fan, 'conflict deck');
            this.player1.moveCard(this.voice, 'conflict deck');
            this.player1.moveCard(this.soul, 'conflict deck');
            this.player1.moveCard(this.ann, 'conflict deck');

            this.storm = this.player1.findCardByName('calling-the-storm');
            this.welcome = this.player1.findCardByName('warm-welcome');
            this.scorpion = this.player1.findCardByName('way-of-the-scorpion');

            this.kuwanan.fate = 10;
            this.motso.fate = 10;
        });

        it('should discard your hand', function () {
            this.player1.clickCard(this.storm);
            expect(this.player1.hand.length).toBe(0);
            expect(this.katana.location).toBe('conflict discard pile');
            expect(this.welcome.location).toBe('conflict discard pile');
        });

        it('should let you look at the top card', function () {
            this.player1.clickCard(this.storm);
            expect(this.player1.player.isTopConflictCardShown(this.player1.player)).toBe(true);
            expect(this.player1.player.isTopConflictCardShown(this.player2.player)).toBe(false);
        });

        it('should expire at the end of the phase', function () {
            this.player1.player.promptedActionWindows.fate = true;
            this.player2.player.promptedActionWindows.fate = true;

            this.player1.clickCard(this.storm);
            expect(this.player1.player.isTopConflictCardShown(this.player1.player)).toBe(true);
            expect(this.player1.player.isTopConflictCardShown(this.player2.player)).toBe(false);
            this.advancePhases('fate');

            expect(this.player1.player.isTopConflictCardShown(this.player1.player)).toBe(false);
            expect(this.player1.player.isTopConflictCardShown(this.player2.player)).toBe(false);
            expect(this.player1).toHavePrompt('Action Window');
            this.player1.clickCard(this.ann);
            expect(this.player1).toHavePrompt('Action Window');
        });

        it('should let you play the top card', function () {
            this.player1.clickCard(this.storm);
            this.player2.pass();

            expect(this.player1).toHavePrompt('Action Window');
            this.player1.clickCard(this.ann);
            this.player1.clickCard(this.kuwanan);
            expect(this.kuwanan.attachments).toContain(this.ann);
            expect(this.player2).toHavePrompt('Action Window');
        });

        it('should let you look at the top card even if you play the top card', function () {
            this.player1.clickCard(this.storm);
            expect(this.player1.player.isTopConflictCardShown(this.player1.player)).toBe(true);
            expect(this.player1.player.isTopConflictCardShown(this.player2.player)).toBe(false);
            this.player2.pass();
            this.player1.clickCard(this.ann);
            this.player1.clickCard(this.kuwanan);
            expect(this.kuwanan.attachments).toContain(this.ann);
            expect(this.player1.player.isTopConflictCardShown(this.player1.player)).toBe(true);
            expect(this.player1.player.isTopConflictCardShown(this.player2.player)).toBe(false);
        });

        it('should not let your opponent play the top card', function () {
            this.player1.clickCard(this.storm);
            this.player2.clickCard(this.ann);
            this.player2.clickCard(this.motso);
            expect(this.motso.attachments).not.toContain(this.ann);
            expect(this.player2).toHavePrompt('Action Window');
        });

        it('should let you play unlimited cards', function () {
            this.player1.clickCard(this.storm);
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.kuwanan],
                defenders: []
            });
            expect(this.player1.player.isTopConflictCardShown(this.player1.player)).toBe(true);
            expect(this.player1.player.isTopConflictCardShown(this.player2.player)).toBe(false);

            this.player2.pass();

            this.player1.clickCard(this.ann);
            this.player1.clickCard(this.kuwanan);
            expect(this.kuwanan.attachments).toContain(this.ann);

            expect(this.player1.player.isTopConflictCardShown(this.player1.player)).toBe(true);
            expect(this.player1.player.isTopConflictCardShown(this.player2.player)).toBe(false);

            this.player2.pass();

            this.player1.clickCard(this.soul);
            this.player1.clickCard(this.kuwanan);
            expect(this.kuwanan.isHonored).toBe(true);

            expect(this.player1.player.isTopConflictCardShown(this.player1.player)).toBe(true);
            expect(this.player1.player.isTopConflictCardShown(this.player2.player)).toBe(false);

            this.player2.clickCard(this.fury);
            this.player2.clickCard(this.kuwanan);

            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.voice);
            this.player1.clickCard(this.voice);

            expect(this.player1.player.isTopConflictCardShown(this.player1.player)).toBe(true);
            expect(this.player1.player.isTopConflictCardShown(this.player2.player)).toBe(false);

            expect(this.player1).toHavePrompt('Conflict Action Window');
            this.player1.clickCard(this.fan);
            this.player1.clickCard(this.kuwanan);
            expect(this.kuwanan.attachments).toContain(this.fan);
        });

        it('should let you play cards that are put back into your deck', function () {
            this.player1.clickCard(this.storm);
            this.noMoreActions();
            this.player1.moveCard(this.welcome, 'hand');
            this.initiateConflict({
                type: 'military',
                attackers: [this.kuwanan],
                defenders: []
            });
            this.player2.pass();
            this.player1.clickCard(this.ann);
            this.player1.clickCard(this.kuwanan);
            this.player2.pass();
            this.player1.clickCard(this.soul);
            this.player1.clickCard(this.kuwanan);
            this.player2.clickCard(this.fury);
            this.player2.clickCard(this.kuwanan);
            this.player1.clickCard(this.voice);
            this.player1.clickCard(this.fan);
            this.player1.clickCard(this.kuwanan);
            this.player2.pass();

            this.player1.reduceDeckToNumber('conflict deck', 0);
            expect(this.player1.conflictDeck.length).toBe(0);
            expect(this.kuwanan.isHonored).toBe(true);
            this.player1.clickCard(this.welcome);
            this.player1.clickCard(this.scorpion);
            this.player1.clickCard(this.kuwanan);
            expect(this.kuwanan.isHonored).toBe(false);
            expect(this.player1.player.isTopConflictCardShown(this.player1.player)).toBe(true);
            expect(this.player1.player.isTopConflictCardShown(this.player2.player)).toBe(false);
            this.player2.pass();
            expect(this.kuwanan.isDishonored).toBe(false);
            expect(this.scorpion.location).toBe('conflict deck');
            expect(this.player1.conflictDeck.length).toBe(1);
            this.player1.clickCard(this.scorpion);
            this.player1.clickCard(this.kuwanan);
            expect(this.kuwanan.isDishonored).toBe(true);
        });

        describe('easy edge cases', function () {
            it('should not let you play a card that is in your discard', function () {
                this.player1.clickCard(this.storm);
                this.noMoreActions();
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.kuwanan],
                    defenders: []
                });
                expect(this.player1.player.isTopConflictCardShown(this.player1.player)).toBe(true);
                expect(this.player1.player.isTopConflictCardShown(this.player2.player)).toBe(false);

                this.player2.pass();

                this.player1.clickCard(this.ann);
                this.player1.clickCard(this.kuwanan);
                expect(this.kuwanan.attachments).toContain(this.ann);

                expect(this.player1.player.isTopConflictCardShown(this.player1.player)).toBe(true);
                expect(this.player1.player.isTopConflictCardShown(this.player2.player)).toBe(false);

                this.player2.pass();

                this.player1.clickCard(this.soul);
                this.player1.clickCard(this.kuwanan);
                expect(this.kuwanan.isHonored).toBe(true);

                expect(this.player1.player.isTopConflictCardShown(this.player1.player)).toBe(true);
                expect(this.player1.player.isTopConflictCardShown(this.player2.player)).toBe(false);

                this.player2.pass();

                expect(this.player1).toHavePrompt('Conflict Action Window');
                this.player1.clickCard(this.soul);
                expect(this.player1).toHavePrompt('Conflict Action Window');
            });

            it('effect should not persist if card moves from the top of the deck', function () {
                this.player1.clickCard(this.storm);
                this.noMoreActions();
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.kuwanan],
                    defenders: []
                });
                expect(this.player1.player.isTopConflictCardShown(this.player1.player)).toBe(true);
                expect(this.player1.player.isTopConflictCardShown(this.player2.player)).toBe(false);

                this.player2.pass();

                this.player1.clickCard(this.ann);
                this.player1.clickCard(this.kuwanan);
                expect(this.kuwanan.attachments).toContain(this.ann);

                expect(this.player1.player.isTopConflictCardShown(this.player1.player)).toBe(true);
                expect(this.player1.player.isTopConflictCardShown(this.player2.player)).toBe(false);

                this.player1.moveCard(this.fan, 'hand');
                this.player1.moveCard(this.fan, 'conflict deck');

                this.player2.pass();
                expect(this.player1).toHavePrompt('Conflict Action Window');
                this.player1.clickCard(this.soul);
                expect(this.player1).toHavePrompt('Conflict Action Window');
            });

            it('should work if your conflict deck is empty', function () {
                this.player1.reduceDeckToNumber('conflict deck', 0);
                this.player1.clickCard(this.storm);
                expect(this.getChatLogs(5)).toContain(
                    'player1 plays Calling the Storm to play cards from their conflict deck this phase'
                );
                this.noMoreActions();
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.kuwanan],
                    defenders: []
                });
                expect(this.player1.player.isTopConflictCardShown(this.player1.player)).toBe(false);
                expect(this.player1.player.isTopConflictCardShown(this.player2.player)).toBe(false);
            });
        });
    });
});
