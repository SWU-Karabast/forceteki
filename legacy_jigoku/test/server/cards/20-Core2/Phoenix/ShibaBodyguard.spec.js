describe('Shiba Bodyguard', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['shiba-bodyguard', 'hida-guardian', 'adept-of-the-waves', 'solemn-scholar'],
                    fate: 6
                },
                player2:{
                    inPlay: ['doji-whisperer'],
                }
            });
            this.shibaBodyguard = this.player1.findCardByName('shiba-bodyguard');
            this.solemnScholar = this.player1.findCardByName('solemn-scholar');
            this.hidaGuardian = this.player1.findCardByName('hida-guardian');
            this.hidaGuardian.fate = 1;
            this.adeptOfTheWaves = this.player1.findCardByName('adept-of-the-waves');
            this.adeptOfTheWaves.fate = 1;

            this.dojiWhisperer = this.player2.findCardByName('doji-whisperer');
        });

        it('chooses a non-bushi', function () {
            this.flow.finishConflictPhase();
            expect(this.player1).toHavePrompt('Fate Phase');

            this.player1.clickCard(this.shibaBodyguard);
            expect(this.player1).toHavePrompt('Triggered Abilities');

            this.player1.clickCard(this.shibaBodyguard);
            expect(this.player1).toHavePrompt('Choose a character');
            expect(this.player1).not.toBeAbleToSelect(this.shibaBodyguard);
            expect(this.player1).not.toBeAbleToSelect(this.hidaGuardian);
            expect(this.player1).toBeAbleToSelect(this.adeptOfTheWaves);

            this.player1.clickCard(this.adeptOfTheWaves);
            expect(this.player1.fate).toBe(5);
            expect(this.adeptOfTheWaves.fate).toBe(2);
            expect(this.getChatLogs(5)).toContain(
                "player1 uses Shiba Bodyguard to place a fate from player1's fate pool on Adept of the Waves"
            );
        });

        it('add fate to a non-bushi', function () {
            this.flow.finishConflictPhase();
            expect(this.player1).toHavePrompt('Fate Phase');

            this.player1.clickCard(this.shibaBodyguard);
            this.player1.clickCard(this.shibaBodyguard);
            this.player1.clickCard(this.adeptOfTheWaves);
            expect(this.player1.fate).toBe(5);
            expect(this.adeptOfTheWaves.fate).toBe(2);
            expect(this.getChatLogs(5)).toContain(
                "player1 uses Shiba Bodyguard to place a fate from player1's fate pool on Adept of the Waves"
            );
            expect(this.adeptOfTheWaves.location).toBe('play area');
            expect(this.player1).toHavePrompt('Fate Phase');
        });

        it('add fate to a non-bushi controlled by the opponent', function () {
            this.flow.finishConflictPhase();
            expect(this.player1).toHavePrompt('Fate Phase');

            this.player1.clickCard(this.shibaBodyguard);
            this.player1.clickCard(this.shibaBodyguard);
            this.player1.clickCard(this.dojiWhisperer);
            expect(this.player1.fate).toBe(5);
            expect(this.dojiWhisperer.fate).toBe(1);
            expect(this.getChatLogs(5)).toContain(
                "player1 uses Shiba Bodyguard to place a fate from player1's fate pool on Doji Whisperer"
            );
            expect(this.dojiWhisperer.location).toBe('play area');
            expect(this.player1).toHavePrompt('Fate Phase');
        });

        it('saves a fateless non-bushi', function () {
            this.flow.finishConflictPhase();
            expect(this.player1).toHavePrompt('Fate Phase');

            this.player1.clickCard(this.shibaBodyguard);
            this.player1.clickCard(this.shibaBodyguard);
            expect(this.player1).toHavePrompt('Choose a character');
            this.player1.clickCard(this.solemnScholar);
            expect(this.getChatLogs(5)).toContain(
                "player1 uses Shiba Bodyguard to place a fate from player1's fate pool on Solemn Scholar"
            );

            this.player2.clickPrompt('Done');
            expect(this.player1.fate).toBe(5);
            expect(this.solemnScholar.fate).toBe(0);
            expect(this.solemnScholar.location).toBe('play area');
            expect(this.player1).toHavePrompt('Discard Dynasty Cards');
        });
    });
});