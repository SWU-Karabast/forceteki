describe('Scholar of Old Rempet', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['scholar-of-old-rempet', 'adept-of-the-waves'],
                    hand: ['banzai', 'unleash-the-djinn', 'against-the-waves']
                },
                player2: {
                    inPlay: ['mirumoto-raitsugu', 'doomed-shugenja', 'togashi-initiate'],
                    hand: ['court-games']
                }
            });
            this.rempet = this.player1.findCardByName('scholar-of-old-rempet');
            this.adeptOfTheWaves = this.player1.findCardByName('adept-of-the-waves');
            this.banzai = this.player1.findCardByName('banzai');
            this.unleashTheDjinn = this.player1.findCardByName('unleash-the-djinn');
            this.atw = this.player1.findCardByName('against-the-waves');

            this.mirumotoRaitsugu = this.player2.findCardByName('mirumoto-raitsugu');
            this.doomedShugenja = this.player2.findCardByName('doomed-shugenja');
            this.togashiInitiate = this.player2.findCardByName('togashi-initiate');
            this.courtGames = this.player2.findCardByName('court-games');
        });

        it('should not be able to be triggered outside of a conflict', function() {
            expect(this.player1).toHavePrompt('Action Window');
            this.player1.clickCard(this.rempet);
            expect(this.player1).toHavePrompt('Action Window');
        });

        it('should be able to be triggered even if not participating', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.adeptOfTheWaves],
                defenders: [this.mirumotoRaitsugu, this.doomedShugenja],
                type: 'political'
            });
            this.player2.pass();
            expect(this.player1).toHavePrompt('Conflict Action Window');
            this.player1.clickCard(this.rempet);
            expect(this.player1).toHavePrompt('Scholar of Old Rempet');
        });

        it('it should prompt to target a non-unique character', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.rempet],
                defenders: [this.mirumotoRaitsugu, this.doomedShugenja],
                type: 'military'
            });
            this.player2.pass();
            this.player1.clickCard(this.rempet);
            expect(this.player1).toHavePrompt('Scholar of Old Rempet');
            expect(this.player1).not.toBeAbleToSelect(this.mirumotoRaitsugu);
            expect(this.player1).toBeAbleToSelect(this.doomedShugenja);
            expect(this.player1).toBeAbleToSelect(this.togashiInitiate);
            expect(this.player1).toBeAbleToSelect(this.rempet);
            expect(this.player1).toBeAbleToSelect(this.adeptOfTheWaves);
        });

        it('the target should become immune to events', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.rempet, this.adeptOfTheWaves],
                defenders: [this.mirumotoRaitsugu, this.doomedShugenja],
                type: 'political'
            });
            this.player2.pass();
            this.player1.clickCard(this.rempet);
            this.player1.clickCard(this.rempet);
            this.player2.pass();

            // cannot be targeted by player's events
            this.player1.clickCard(this.banzai);
            expect(this.player1).toHavePrompt('Choose a character');
            expect(this.player1).not.toBeAbleToSelect(this.rempet);
            expect(this.player1).toBeAbleToSelect(this.adeptOfTheWaves);
            expect(this.player1).toBeAbleToSelect(this.mirumotoRaitsugu);
            expect(this.player1).toBeAbleToSelect(this.doomedShugenja);
            this.player1.clickCard(this.adeptOfTheWaves);
            this.player1.clickPrompt('Done');

            // cannot be targeted by opponent's events
            this.player2.clickCard(this.courtGames);
            this.player2.clickPrompt('Dishonor an opposing character');
            expect(this.player1).toHavePrompt('Choose a character');
            expect(this.player1).not.toBeAbleToSelect(this.rempet);
            expect(this.player1).toBeAbleToSelect(this.adeptOfTheWaves);
            this.player1.clickCard(this.adeptOfTheWaves);

            // unaffected by non-targeted effects from events
            this.player1.clickCard(this.unleashTheDjinn);
            expect(this.rempet.getPoliticalSkill()).toBe(0);
            expect(this.adeptOfTheWaves.getPoliticalSkill()).toBe(3);
        });

        it('immunity should expire at the end of the conflict', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.rempet, this.adeptOfTheWaves],
                defenders: [this.mirumotoRaitsugu, this.doomedShugenja],
                type: 'political'
            });
            this.player2.pass();
            this.player1.clickCard(this.rempet);
            this.player1.clickCard(this.rempet);

            this.noMoreActions();
            expect(this.rempet.bowed).toBe(true);
            this.player1.clickCard(this.atw);
            expect(this.player1).toBeAbleToSelect(this.rempet);
            this.player1.clickCard(this.rempet);
            expect(this.rempet.bowed).toBe(false);
        });

        it('chat messages', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.rempet, this.adeptOfTheWaves],
                defenders: [this.mirumotoRaitsugu, this.doomedShugenja],
                type: 'political'
            });
            this.player2.pass();
            this.player1.clickCard(this.rempet);
            this.player1.clickCard(this.rempet);

            expect(this.getChatLogs(10)).toContain('player1 uses Scholar of Old Rempet, losing 1 honor to make Scholar of Old Rempet immune to events');
        });
    });
});
