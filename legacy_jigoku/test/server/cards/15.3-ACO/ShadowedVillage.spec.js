describe('Shadowed Village', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['miya-mystic', 'bayushi-manipulator'],
                    hand: ['karmic-twist', 'shadow-steed'],
                    dynastyDiscard: ['shadowed-village', 'daidoji-kageyu']
                },
                player2: {
                    inPlay: ['alibi-artist', 'miya-mystic'],
                    hand: ['assassination', 'consumed-by-five-fires']
                }
            });
            this.miyaMystic = this.player1.findCardByName('miya-mystic');
            this.manipulator = this.player1.findCardByName('bayushi-manipulator');
            this.karmicTwist = this.player1.findCardByName('karmic-twist');
            this.steed = this.player1.findCardByName('shadow-steed');
            this.alibi = this.player2.findCardByName('alibi-artist');
            this.assassination = this.player2.findCardByName('assassination');
            this.fires = this.player2.findCardByName('consumed-by-five-fires');
            this.mystic2 = this.player2.findCardByName('miya-mystic');

            this.miyaMystic.fate = 0;
            this.manipulator.fate = 2;
            this.alibi.fate = 1;
            this.mystic2.fate = 1;

            this.kageyu = this.player1.placeCardInProvince('daidoji-kageyu', 'province 1');
            this.village = this.player1.placeCardInProvince('shadowed-village', 'province 2');
            this.kageyu.facedown = false;
            this.village.facedown = false;
        });

        it('should react to moving fate via card effects', function() {
            this.player1.clickCard(this.karmicTwist);
            this.player1.clickCard(this.manipulator);
            this.player1.clickCard(this.miyaMystic);

            expect(this.miyaMystic.fate).toBe(2);
            expect(this.manipulator.fate).toBe(0);

            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.village);
        });

        it('should draw a card if the character is normal', function() {
            let hand = this.player1.hand.length;
            this.player1.clickCard(this.karmicTwist);
            this.player1.clickCard(this.manipulator);
            this.player1.clickCard(this.miyaMystic);
            this.player1.clickCard(this.village);
            expect(this.player1.hand.length).toBe(hand); //-1 from karmic, +1 from draw
            expect(this.getChatLogs(5)).toContain('player1 uses Shadowed Village to draw a card');
        });

        it('should draw two cards if the character is dishonored', function() {
            let hand = this.player1.hand.length;
            this.manipulator.dishonor();
            this.player1.clickCard(this.karmicTwist);
            this.player1.clickCard(this.manipulator);
            this.player1.clickCard(this.miyaMystic);
            this.player1.clickCard(this.village);
            expect(this.player1.hand.length).toBe(hand + 1); //-1 from karmic, +2 from draw
            expect(this.getChatLogs(5)).toContain('player1 uses Shadowed Village to draw 2 cards');
        });

        it('should draw one card if the character is honored', function() {
            let hand = this.player1.hand.length;
            this.manipulator.honor();
            this.player1.clickCard(this.karmicTwist);
            this.player1.clickCard(this.manipulator);
            this.player1.clickCard(this.miyaMystic);
            this.player1.clickCard(this.village);
            expect(this.player1.hand.length).toBe(hand); //-1 from karmic, +1 from draw
            expect(this.getChatLogs(5)).toContain('player1 uses Shadowed Village to draw a card');
        });

        it('should react to moving fate via disguised', function() {
            this.player1.clickCard(this.kageyu);
            this.player1.clickCard(this.manipulator);
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.village);
        });

        it('disguised - should not pick up the former dishonored status', function() {
            let hand = this.player1.hand.length;
            this.manipulator.dishonor();
            this.game.checkGameState(true);
            this.player1.clickCard(this.kageyu);
            this.player1.clickCard(this.manipulator);
            this.player1.clickCard(this.village);
            expect(this.player1.hand.length).toBe(hand + 1); //+1 from draw
            expect(this.getChatLogs(5)).toContain('player1 uses Shadowed Village to draw a card');
        });

        it('should react to leaving play with fate', function() {
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.manipulator],
                defenders: []
            });
            this.player2.clickCard(this.assassination);
            this.player2.clickCard(this.manipulator);
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.village);
        });

        it('leaving play - should not pick up dishonored status', function() {
            let hand = this.player1.hand.length;
            this.manipulator.dishonor();
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.manipulator],
                defenders: []
            });
            this.player2.clickCard(this.assassination);
            this.player2.clickCard(this.manipulator);
            this.player1.clickCard(this.village);
            expect(this.player1.hand.length).toBe(hand + 1); //+1 from draw
            expect(this.getChatLogs(5)).toContain('player1 uses Shadowed Village to draw a card');
        });

        it('should not react to opponent\'s characters losing fate', function() {
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.manipulator],
                defenders: []
            });
            this.player2.clickCard(this.assassination);
            this.player2.clickCard(this.alibi);
            expect(this.player1).toHavePrompt('Conflict Action Window');
        });

        it('should react to removing fate via maho', function() {
            this.player1.clickCard(this.steed);
            this.player1.clickCard(this.manipulator);
            this.player1.clickCard(this.manipulator);
            this.player1.clickPrompt('1');
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.village);
        });

        it('should react to removing fate via the void ring', function() {
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.manipulator],
                defenders: [],
                ring: 'void'
            });
            this.noMoreActions();
            this.player1.clickCard(this.manipulator);
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.village);
        });

        it('should not react in the fate phase', function() {
            let fate = this.manipulator.fate;
            this.player1.togglePromptedActionWindow('fate', true);
            this.player2.togglePromptedActionWindow('fate', true);
            this.advancePhases('fate');

            this.player1.clickPrompt('Done');
            expect(this.manipulator.fate).toBe(fate - 1);
            expect(this.player1).toHavePrompt('Action Window');

            this.player1.clickCard(this.steed);
            this.player1.clickCard(this.manipulator);
            this.player1.clickCard(this.manipulator);
            this.player1.clickPrompt('1');
            expect(this.player1).not.toHavePrompt('Triggered Abilities');
            expect(this.player2).toHavePrompt('Action Window');
        });

        it('should prompt to choose between which event to react to if  multiple characters have fate removed in one go', function() {
            this.manipulator.dishonor();
            this.manipulator.fate = 4;
            this.miyaMystic.fate = 4;
            this.player1.pass();
            this.player2.clickCard(this.fires);
            this.player2.clickCard(this.manipulator);
            this.player2.clickPrompt('3');
            this.player2.clickCard(this.miyaMystic);
            this.player2.clickPrompt('2');
            expect(this.player1).toBeAbleToSelect(this.village);
            this.player1.clickCard(this.village);
            expect(this.player1).toHavePrompt('Choose an event to respond to');
            expect(this.player1).toHavePromptButton('Fate being moved from Bayushi Manipulator');
            expect(this.player1).toHavePromptButton('Fate being moved from Miya Mystic');
        });

        it('should draw 2 if you pick a dishonored character to react to', function() {
            let hand = this.player1.hand.length;
            this.manipulator.dishonor();
            this.manipulator.fate = 4;
            this.miyaMystic.fate = 4;
            this.player1.pass();
            this.player2.clickCard(this.fires);
            this.player2.clickCard(this.manipulator);
            this.player2.clickPrompt('3');
            this.player2.clickCard(this.miyaMystic);
            this.player2.clickPrompt('2');
            this.player1.clickCard(this.village);
            this.player1.clickPrompt('Fate being moved from Bayushi Manipulator');
            expect(this.player1.hand.length).toBe(hand + 2);
            expect(this.getChatLogs(5)).toContain('player1 uses Shadowed Village to draw 2 cards');
        });

        it('should draw 1 if you pick a non-dishonored character to react to', function() {
            let hand = this.player1.hand.length;
            this.manipulator.dishonor();
            this.manipulator.fate = 4;
            this.miyaMystic.fate = 4;
            this.player1.pass();
            this.player2.clickCard(this.fires);
            this.player2.clickCard(this.manipulator);
            this.player2.clickPrompt('3');
            this.player2.clickCard(this.miyaMystic);
            this.player2.clickPrompt('2');
            this.player1.clickCard(this.village);
            this.player1.clickPrompt('Fate being moved from Miya Mystic');
            expect(this.player1.hand.length).toBe(hand + 1);
            expect(this.getChatLogs(5)).toContain('player1 uses Shadowed Village to draw a card');
        });
    });
});
