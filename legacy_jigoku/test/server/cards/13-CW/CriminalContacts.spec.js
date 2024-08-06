describe('Called to War', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    honor: 10,
                    inPlay: ['matsu-berserker', 'ikoma-prodigy'],
                    hand: ['criminal-contacts']
                },
                player2: {
                    honor: 10,
                    inPlay: ['solemn-scholar', 'shiba-tsukune', 'righteous-magistrate']
                }
            });

            this.matsuBerserker = this.player1.findCardByName('matsu-berserker');
            this.ikomaProdigy = this.player1.findCardByName('ikoma-prodigy');
            this.contacts = this.player1.findCardByName('criminal-contacts');

            this.solemnScholar = this.player2.findCardByName('solemn-scholar');
            this.shibaTsukune = this.player2.findCardByName('shiba-tsukune');
            this.magistrate = this.player2.findCardByName('righteous-magistrate');

            this.player1.player.showBid = 5;
            this.player2.player.showBid = 1;

            this.matsuBerserker.fate = 1;
            this.shibaTsukune.fate = 1;
        });

        it('should allow each player to choose a character with fate', function() {
            this.player1.clickCard(this.contacts);
            expect(this.player1).toHavePrompt('Choose a character');
            expect(this.player1).toBeAbleToSelect(this.matsuBerserker);
            expect(this.player1).not.toBeAbleToSelect(this.ikomaProdigy);
            expect(this.player1).toBeAbleToSelect(this.shibaTsukune);
            expect(this.player1).not.toBeAbleToSelect(this.solemnScholar);
            this.player1.clickCard(this.matsuBerserker);
            expect(this.player2).toHavePrompt('Give an honor to your opponent?');
            expect(this.player2).toHavePromptButton('Yes');
            expect(this.player2).toHavePromptButton('No');
            this.player2.clickPrompt('Yes');
            expect(this.getChatLogs(1)).toContain('player2 chooses to give player1 1 honor');

            expect(this.player2).toHavePrompt('Choose a character');
            expect(this.player2).toBeAbleToSelect(this.matsuBerserker);
            expect(this.player2).not.toBeAbleToSelect(this.ikomaProdigy);
            expect(this.player2).toBeAbleToSelect(this.shibaTsukune);
            expect(this.player2).not.toBeAbleToSelect(this.solemnScholar);
            this.player2.clickCard(this.shibaTsukune);
            expect(this.getChatLogs(1)).toContain('player1 plays Criminal Contacts to discard a fate from Matsu Berserker.  player2 gives player1 1 honor to discard a fate from Shiba Tsukune');

            expect(this.matsuBerserker.fate).toBe(0);
            expect(this.shibaTsukune.fate).toBe(0);

            expect(this.player1.honor).toBe(11);
            expect(this.player2.honor).toBe(9);
        });

        it('should allow each player to choose the same character even if it only has 1 fate', function() {
            this.player1.clickCard(this.contacts);
            this.player1.clickCard(this.matsuBerserker);
            this.player2.clickPrompt('Yes');
            this.player2.clickCard(this.matsuBerserker);
            expect(this.getChatLogs(1)).toContain('player1 plays Criminal Contacts to discard a fate from Matsu Berserker.  player2 gives player1 1 honor to discard a fate from Matsu Berserker');

            expect(this.matsuBerserker.fate).toBe(0);

            expect(this.player1.honor).toBe(11);
            expect(this.player2.honor).toBe(9);
        });

        it('should allow opponent to choose not to select a character', function() {
            this.player1.clickCard(this.contacts);
            expect(this.player1).toHavePrompt('Choose a character');
            expect(this.player1).toBeAbleToSelect(this.matsuBerserker);
            expect(this.player1).not.toBeAbleToSelect(this.ikomaProdigy);
            this.player1.clickCard(this.matsuBerserker);
            expect(this.player2).toHavePrompt('Give an honor to your opponent?');
            expect(this.player2).toHavePromptButton('Yes');
            expect(this.player2).toHavePromptButton('No');
            this.player2.clickPrompt('No');
            expect(this.getChatLogs(1)).toContain('player1 plays Criminal Contacts to discard a fate from Matsu Berserker');

            expect(this.matsuBerserker.fate).toBe(0);
            expect(this.shibaTsukune.fate).toBe(1);

            expect(this.player1.honor).toBe(10);
            expect(this.player2.honor).toBe(10);

            expect(this.player2).toHavePrompt('Action Window');
        });

        it('should not allow choosing a character if you cannot give the honor', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.matsuBerserker],
                defenders: [this.magistrate],
                type: 'military'
            });

            this.player2.pass();
            this.player1.clickCard(this.contacts);
            expect(this.player1).toHavePrompt('Choose a character');
            expect(this.player1).toBeAbleToSelect(this.matsuBerserker);
            expect(this.player1).not.toBeAbleToSelect(this.ikomaProdigy);
            this.player1.clickCard(this.matsuBerserker);
            expect(this.getChatLogs(3)).toContain('player1 plays Criminal Contacts to discard a fate from Matsu Berserker');

            expect(this.matsuBerserker.fate).toBe(0);
            expect(this.shibaTsukune.fate).toBe(1);

            expect(this.player1.honor).toBe(10);
            expect(this.player2.honor).toBe(10);

            expect(this.player2).toHavePrompt('Conflict Action Window');
        });

        it('should not work if no characters have fate', function() {
            this.shibaTsukune.fate = 0;
            this.matsuBerserker.fate = 0;
            expect(this.player1).toHavePrompt('Action Window');
            this.player1.clickCard(this.contacts);
            expect(this.player1).toHavePrompt('Action Window');
        });

        it('should not work if dial is not higher', function() {
            this.player1.player.showBid = 5;
            this.player2.player.showBid = 5;
            expect(this.player1).toHavePrompt('Action Window');
            this.player1.clickCard(this.contacts);
            expect(this.player1).toHavePrompt('Action Window');
        });
    });
});
