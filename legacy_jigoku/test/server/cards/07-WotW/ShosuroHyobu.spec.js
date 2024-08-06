describe('Shosuro Hyobu', function() {
    integration(function() {
        describe('Shosuro Hyobu\'s ability', function() {
            beforeEach(function() {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['shosuro-hyobu', 'master-whisperer'],
                        hand: ['oracle-of-stone', 'letter-from-the-daimyo'],
                        conflictDiscard: ['spies-at-court']
                    },
                    player2: {
                        inPlay: ['adept-of-the-waves'],
                        hand: ['oracle-of-stone', 'assassination', 'fine-katana', 'ornate-fan'],
                        dynastyDiscard: ['heavy-ballista']
                    }
                });

                this.shosuroHyobu = this.player1.findCardByName('shosuro-hyobu');
                this.masterWhisperer = this.player1.findCardByName('master-whisperer');
                this.stone1 = this.player1.findCardByName('oracle-of-stone');
                this.spies = this.player1.findCardByName('spies-at-court');
                this.letter = this.player1.findCardByName('letter-from-the-daimyo');

                this.adeptOfTheWaves = this.player2.findCardByName('adept-of-the-waves');
                this.oracleOfStone = this.player2.findCardByName('oracle-of-stone');
                this.assassination = this.player2.findCardByName('assassination');
                this.heavyBallista = this.player2.placeCardInProvince('heavy-ballista', 'province 1');
            });

            it('should trigger when opponent discards due to a cost (heavy ballista)', function() {
                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.shosuroHyobu],
                    defenders: []
                });
                this.player2.clickCard(this.heavyBallista);
                this.player2.clickCard(this.shosuroHyobu);
                this.player2.clickCard(this.oracleOfStone);
                expect(this.player1).toHavePrompt('Triggered Abilities');
                expect(this.player1).toBeAbleToSelect(this.shosuroHyobu);
            });

            it('should trigger when opponent discards due to an effect (oracle of stone)', function() {
                this.player1.pass();
                this.player2.clickCard(this.oracleOfStone);
                expect(this.player1).toHavePrompt('Choose 2 cards to discard');
                this.player1.clickCard(this.player1.hand[0]);
                this.player1.clickCard(this.player1.hand[1]);
                this.player1.clickPrompt('Done');
                expect(this.player2).toHavePrompt('Choose 2 cards to discard');
                this.player2.clickCard(this.player2.hand[0]);
                this.player2.clickCard(this.player2.hand[1]);
                this.player2.clickPrompt('Done');
                expect(this.player1).toHavePrompt('Triggered Abilities');
                expect(this.player1).toBeAbleToSelect(this.shosuroHyobu);
            });

            it('should trigger when opponent discards due to an effect (oracle of stone - played by self)', function() {
                this.player1.clickCard(this.stone1);
                expect(this.player1).toHavePrompt('Choose 2 cards to discard');
                this.player1.clickCard(this.player1.hand[0]);
                this.player1.clickCard(this.player1.hand[1]);
                this.player1.clickPrompt('Done');
                expect(this.player2).toHavePrompt('Choose 2 cards to discard');
                this.player2.clickCard(this.player2.hand[0]);
                this.player2.clickCard(this.player2.hand[1]);
                this.player2.clickPrompt('Done');
                expect(this.player1).toHavePrompt('Triggered Abilities');
                expect(this.player1).toBeAbleToSelect(this.shosuroHyobu);
            });

            it('should trigger when opponent discards due to an effect (master whisperer)', function() {
                this.player1.clickCard(this.masterWhisperer);
                this.player1.clickPrompt('player2');
                expect(this.player2).toHavePrompt('Choose 3 cards to discard');
                this.player2.clickCard(this.player2.hand[0]);
                this.player2.clickCard(this.player2.hand[1]);
                this.player2.clickCard(this.player2.hand[2]);
                this.player2.clickPrompt('Done');
                expect(this.player1).toHavePrompt('Triggered Abilities');
                expect(this.player1).toBeAbleToSelect(this.shosuroHyobu);
            });

            it('should trigger when opponent chosen discards', function() {
                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.shosuroHyobu],
                    defenders: [],
                    ring: 'air',
                    type: 'political'
                });
                this.player2.pass();
                this.player1.playAttachment(this.letter, this.shosuroHyobu);
                this.noMoreActions();
                expect(this.player1).toHavePrompt('Triggered Abilities');
                expect(this.player1).toBeAbleToSelect(this.letter);
                this.player1.clickCard(this.letter);
                expect(this.player2).toHavePrompt('Choose 2 cards to discard');
                this.player2.clickCard(this.player2.hand[0]);
                this.player2.clickCard(this.player2.hand[1]);
                this.player2.clickPrompt('Done');
                expect(this.player1).toHavePrompt('Triggered Abilities');
                expect(this.player1).toBeAbleToSelect(this.shosuroHyobu);
            });

            it('should trigger when opponent random discards', function() {
                this.player1.moveCard(this.spies, 'hand');
                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.shosuroHyobu],
                    defenders: [],
                    ring: 'air',
                    type: 'political'
                });
                this.noMoreActions();
                expect(this.player1).toHavePrompt('Triggered Abilities');
                expect(this.player1).toBeAbleToSelect(this.spies);
                this.player1.clickCard(this.spies);
                this.player1.clickCard(this.shosuroHyobu);
                expect(this.player1).toHavePrompt('Triggered Abilities');
                expect(this.player1).toBeAbleToSelect(this.shosuroHyobu);
            });

            it('should not trigger when opponent discards due to earth ring', function() {
                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.shosuroHyobu],
                    defenders: [],
                    ring: 'earth',
                    type: 'political'
                });
                this.noMoreActions();
                expect(this.player1).toHavePrompt('Earth Ring');
                this.player1.clickPrompt('Draw a card and opponent discards');
                expect(this.player1).not.toHavePrompt('Triggered Abilities');
                expect(this.player1).toHavePrompt('Action Window');
            });

            it('should not trigger when opponent discards from provinces', function() {
                this.nextPhase();
                expect(this.game.currentPhase).toBe('fate');
                this.player1.clickPrompt('Done');
                this.player2.clickPrompt('Done');
                this.player1.clickPrompt('Done');
                this.player2.clickCard(this.heavyBallista);
                this.player2.clickPrompt('Done');
                expect(this.heavyBallista.location).toBe('dynasty discard pile');
                expect(this.player1).not.toHavePrompt('Triggered Abilities');
                expect(this.player2).toHavePromptButton('End Round');
            });

            it('should not trigger when opponent discards from play', function() {
                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.shosuroHyobu],
                    defenders: []
                });
                this.player2.clickCard(this.assassination);
                this.player2.clickCard(this.adeptOfTheWaves);
                expect(this.player1).not.toHavePrompt('Triggered Abilities');
                expect(this.player1).toHavePrompt('Conflict Action Window');
            });

            it('should prompt to choose a character to dishonor', function() {
                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.shosuroHyobu],
                    defenders: []
                });
                this.player2.clickCard(this.heavyBallista);
                this.player2.clickCard(this.shosuroHyobu);
                this.player2.clickCard(this.oracleOfStone);
                this.player1.clickCard(this.shosuroHyobu);
                expect(this.player1).toHavePrompt('Choose a character');
                expect(this.player1).toBeAbleToSelect(this.shosuroHyobu);
                expect(this.player1).toBeAbleToSelect(this.adeptOfTheWaves);
            });

            it('should dishonor the chosen character', function() {
                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.shosuroHyobu],
                    defenders: []
                });
                this.player2.clickCard(this.heavyBallista);
                this.player2.clickCard(this.shosuroHyobu);
                this.player2.clickCard(this.oracleOfStone);
                this.player1.clickCard(this.shosuroHyobu);
                expect(this.adeptOfTheWaves.isDishonored).toBe(false);
                this.player1.clickCard(this.adeptOfTheWaves);
                expect(this.adeptOfTheWaves.isDishonored).toBe(true);
                expect(this.getChatLogs(4)).toContain('player1 uses Shosuro Hyobu to dishonor Adept of the Waves');
            });
        });

        describe('Shosuro Hyobu\'s ability - discarding uniques in dynasty', function() {
            beforeEach(function() {
                this.setupTest({
                    phase: 'dynasty',
                    player1: {
                        inPlay: ['shosuro-hyobu']
                    },
                    player2: {
                        inPlay: ['bayushi-kachiko', 'bayushi-shoju'],
                        hand: ['bayushi-kachiko', 'assassination', 'fine-katana', 'ornate-fan'],
                        dynastyDiscard: ['bayushi-shoju']
                    }
                });

                this.shosuroHyobu = this.player1.findCardByName('shosuro-hyobu');
                this.shojuInPlay = this.player2.findCardByName('bayushi-shoju', 'play area');
                this.kachikoInPlay = this.player2.findCardByName('bayushi-kachiko', 'play area');
                this.kachiko = this.player2.findCardByName('bayushi-kachiko', 'hand');
                this.shoju = this.player2.findCardByName('bayushi-shoju', 'dynasty discard pile');
                this.player2.moveCard(this.shoju, 'province 1');
            });

            it('should not trigger when opponent discards a duplicate during dynasty - from province', function() {
                this.player1.pass();
                let fate = this.shojuInPlay.fate;
                this.player2.clickCard(this.shoju);
                expect(this.player1).not.toHavePrompt('Triggered Abilities');
                expect(this.player2).toHavePrompt('Play cards from provinces');
                expect(this.shojuInPlay.fate).toBe(fate + 1);
            });

            it('should not trigger when opponent discards a duplicate during dynasty - from hand', function() {
                this.player1.pass();
                let fate = this.kachikoInPlay.fate;
                this.player2.clickCard(this.kachiko);
                expect(this.player1).not.toHavePrompt('Triggered Abilities');
                expect(this.player2).toHavePrompt('Play cards from provinces');
                expect(this.kachikoInPlay.fate).toBe(fate + 1);
            });
        });
    });
});

