describe('Shiba\'s Oath', function () {
    integration(function () {
        describe('play restriction', function () {
            beforeEach(function () {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['solemn-scholar', 'serene-warrior'],
                        hand: ['shiba-s-oath']
                    }
                });

                this.solemnScholar = this.player1.findCardByName('solemn-scholar');
                this.sereneWarrior = this.player1.findCardByName('serene-warrior');
                this.shibasOath = this.player1.findCardByName('shiba-s-oath');
            });

            it('should only be able to be played on a bushi', function () {
                this.player1.clickCard(this.shibasOath);
                expect(this.player1).toHavePrompt('Choose a card');
                this.player1.clickCard(this.solemnScholar);
                expect(this.player1).toHavePrompt('Choose a card');

                this.player1.clickCard(this.sereneWarrior);
                expect(this.getChatLogs(5)).toContain('player1 plays Shiba\'s Oath, attaching it to Serene Warrior');
            });
        });

        describe('reaction when enter play', function () {
            beforeEach(function () {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['serene-warrior'],
                        hand: ['shiba-s-oath']
                    }
                });

                this.sereneWarrior = this.player1.findCardByName('serene-warrior');
                this.shibasOath = this.player1.findCardByName('shiba-s-oath');
            });

            it('should honor the attached character', function () {
                this.player1.clickCard(this.shibasOath);
                this.player1.clickCard(this.sereneWarrior);
                this.player1.clickCard(this.shibasOath);
                expect(this.sereneWarrior.isHonored).toBe(true);
                expect(this.getChatLogs(5)).toContain('player1 uses Shiba\'s Oath to honor Serene Warrior');
            });
        });

        describe('Interrupt gained ability', function () {
            beforeEach(function () {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['valiant-oathkeeper', 'solemn-scholar', 'fearless-sailor'],
                        hand: ['shiba-s-oath']
                    },
                    player2: {
                        inPlay: ['doji-kuwanan', 'political-rival'],
                        hand: ['assassination']
                    }
                });

                this.valiantOathkeeper = this.player1.findCardByName('valiant-oathkeeper');
                this.sailor = this.player1.findCardByName('fearless-sailor');
                this.solemnScholar = this.player1.findCardByName('solemn-scholar');
                this.shibasOath = this.player1.findCardByName('shiba-s-oath');
                this.shamefulDisplay = this.player1.findCardByName('shameful-display', 'province 1');

                this.politicalRival = this.player2.findCardByName('political-rival');
                this.kuwanan = this.player2.findCardByName('doji-kuwanan');
                this.assassination = this.player2.findCardByName('assassination');

                this.player1.clickCard(this.shibasOath);
                this.player1.clickCard(this.valiantOathkeeper);
                this.player1.clickCard(this.shibasOath);
            });

            it('cancel events on non-bushi', function () {
                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.valiantOathkeeper, this.solemnScholar, this.sailor],
                    defenders: [this.kuwanan]
                });

                this.player2.clickCard(this.assassination);
                this.player2.clickCard(this.solemnScholar);
                expect(this.player1).toHavePrompt('Any interrupts to the effects of Assassination?');

                this.player1.clickCard(this.valiantOathkeeper);
                expect(this.shibasOath.location).toBe('hand');
                expect(this.getChatLogs(5)).toContain(
                    'player1 uses Valiant Oathkeeper\'s gained ability from Shiba\'s Oath, sacrificing Valiant Oathkeeper to cancel the effects of Assassination and return Shiba\'s Oath to their hand'
                );
            });

            it('does not cancel events on other bushi', function () {
                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.valiantOathkeeper, this.solemnScholar, this.sailor],
                    defenders: [this.kuwanan]
                });

                this.player2.clickCard(this.assassination);
                this.player2.clickCard(this.sailor);
                expect(this.player1).not.toHavePrompt('Any interrupts to the effects of Assassination?');

                this.player1.clickCard(this.valiantOathkeeper);
                expect(this.getChatLogs(5)).not.toContain(
                    'player1 uses Valiant Oathkeeper\'s gained ability from Shiba\'s Oath, sacrificing Valiant Oathkeeper to cancel the effects of Assassination'
                );
            });

            it('cancel character abilities on non-bushi', function () {
                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.valiantOathkeeper, this.solemnScholar, this.sailor],
                    defenders: [this.kuwanan]
                });

                this.player2.clickCard(this.kuwanan);
                this.player2.clickCard(this.solemnScholar);
                expect(this.player1).toHavePrompt('Any interrupts to the effects of Doji Kuwanan?');

                this.player1.clickCard(this.valiantOathkeeper);
                expect(this.shibasOath.location).toBe('hand');
                expect(this.getChatLogs(5)).toContain(
                    'player1 uses Valiant Oathkeeper\'s gained ability from Shiba\'s Oath, sacrificing Valiant Oathkeeper to cancel the effects of Doji Kuwanan and return Shiba\'s Oath to their hand'
                );
            });

            it('does not cancel character abilities on other bushi', function () {
                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.valiantOathkeeper, this.solemnScholar, this.sailor],
                    defenders: [this.kuwanan]
                });

                this.player2.clickCard(this.kuwanan);
                this.player2.clickCard(this.sailor);
                expect(this.player1).not.toHavePrompt('Any interrupts to the effects of Doji Kuwanan?');

                this.player1.clickCard(this.valiantOathkeeper);
                expect(this.getChatLogs(5)).not.toContain(
                    'player1 uses Valiant Oathkeeper\'s gained ability from Shiba\'s Oath, sacrificing Valiant Oathkeeper to cancel the effects of Doji Kuwanan'
                );
            });

            it('cancel character static abilities on non-bushi', function () {
                this.noMoreActions();
                this.player1.clickPrompt('Pass Conflict');
                this.player1.clickPrompt('Yes');

                this.noMoreActions();

                this.player2.clickRing('earth');
                this.player2.clickCard(this.shamefulDisplay);
                this.player2.clickCard(this.politicalRival);
                this.player2.clickPrompt('Initiate Conflict');
                expect(this.player2).toHavePrompt('Choose covert target for Political Rival');

                this.player2.clickCard(this.solemnScholar);
                expect(this.player1).toHavePrompt('Any interrupts to the effects of Political Rival?');

                this.player1.clickCard(this.valiantOathkeeper);
                expect(this.shibasOath.location).toBe('hand');
                expect(this.getChatLogs(5)).toContain(
                    'player1 uses Valiant Oathkeeper\'s gained ability from Shiba\'s Oath, sacrificing Valiant Oathkeeper to cancel the effects of Political Rival and return Shiba\'s Oath to their hand'
                );
            });

            it('does not cancel character static abilities on other bushi', function () {
                this.noMoreActions();
                this.player1.clickPrompt('Pass Conflict');
                this.player1.clickPrompt('Yes');

                this.noMoreActions();

                this.player2.clickRing('earth');
                this.player2.clickCard(this.shamefulDisplay);
                this.player2.clickCard(this.politicalRival);
                this.player2.clickPrompt('Initiate Conflict');
                expect(this.player2).toHavePrompt('Choose covert target for Political Rival');

                this.player2.clickCard(this.sailor);
                expect(this.player1).not.toHavePrompt('Any interrupts to the effects of Political Rival?');

                this.player1.clickCard(this.valiantOathkeeper);
                expect(this.getChatLogs(5)).not.toContain(
                    'player1 uses Valiant Oathkeeper\'s gained ability from Shiba\'s Oath, sacrificing Valiant Oathkeeper to cancel the effects of Political Rival'
                );
            });
        });
    });
});
