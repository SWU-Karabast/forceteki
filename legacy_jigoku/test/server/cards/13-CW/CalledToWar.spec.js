describe('Called to War', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    honor: 10,
                    inPlay: ['matsu-berserker', 'ikoma-prodigy'],
                    hand: ['called-to-war']
                },
                player2: {
                    honor: 10,
                    inPlay: ['solemn-scholar', 'shiba-tsukune', 'righteous-magistrate']
                }
            });

            this.matsuBerserker = this.player1.findCardByName('matsu-berserker');
            this.ikomaProdigy = this.player1.findCardByName('ikoma-prodigy');
            this.calledToWar = this.player1.findCardByName('called-to-war');

            this.solemnScholar = this.player2.findCardByName('solemn-scholar');
            this.shibaTsukune = this.player2.findCardByName('shiba-tsukune');
            this.magistrate = this.player2.findCardByName('righteous-magistrate');
        });

        it('should allow each player to choose a bushi', function() {
            this.player1.clickCard(this.calledToWar);
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

            expect(this.player2).toBeAbleToSelect(this.matsuBerserker);
            expect(this.player2).not.toBeAbleToSelect(this.ikomaProdigy);
            expect(this.player2).toBeAbleToSelect(this.shibaTsukune);
            expect(this.player2).not.toBeAbleToSelect(this.solemnScholar);
            this.player2.clickCard(this.shibaTsukune);
            expect(this.getChatLogs(1)).toContain('player1 plays Called to War to place a fate on Matsu Berserker.  player2 gives player1 1 honor to place a fate on Shiba Tsukune');

            expect(this.matsuBerserker.fate).toBe(1);
            expect(this.shibaTsukune.fate).toBe(1);

            expect(this.player1.honor).toBe(11);
            expect(this.player2.honor).toBe(9);
        });

        it('should allow opponent to choose not to select a bushi', function() {
            this.player1.clickCard(this.calledToWar);
            expect(this.player1).toHavePrompt('Choose a character');
            expect(this.player1).toBeAbleToSelect(this.matsuBerserker);
            expect(this.player1).not.toBeAbleToSelect(this.ikomaProdigy);
            this.player1.clickCard(this.matsuBerserker);

            expect(this.player2).toHavePrompt('Give an honor to your opponent?');
            expect(this.player2).toHavePromptButton('Yes');
            expect(this.player2).toHavePromptButton('No');
            this.player2.clickPrompt('No');

            expect(this.player2).toHavePrompt('Action Window');
            expect(this.getChatLogs(1)).toContain('player1 plays Called to War to place a fate on Matsu Berserker');

            expect(this.matsuBerserker.fate).toBe(1);
            expect(this.shibaTsukune.fate).toBe(0);

            expect(this.player1.honor).toBe(10);
            expect(this.player2.honor).toBe(10);
        });

        it('should not allow choosing a bushi if you cannot give the honor', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.matsuBerserker],
                defenders: [this.magistrate],
                type: 'military'
            });

            this.player2.pass();
            this.player1.clickCard(this.calledToWar);
            expect(this.player1).toHavePrompt('Choose a character');
            expect(this.player1).toBeAbleToSelect(this.matsuBerserker);
            expect(this.player1).not.toBeAbleToSelect(this.ikomaProdigy);
            this.player1.clickCard(this.matsuBerserker);
            expect(this.getChatLogs(3)).toContain('player1 plays Called to War to place a fate on Matsu Berserker');

            expect(this.matsuBerserker.fate).toBe(1);
            expect(this.shibaTsukune.fate).toBe(0);

            expect(this.player1.honor).toBe(10);
            expect(this.player2.honor).toBe(10);
        });

        it('should work if opponent has no bushi', function() {
            this.player2.moveCard(this.shibaTsukune, 'dynasty discard pile');
            this.player1.clickCard(this.calledToWar);
            expect(this.player1).toHavePrompt('Choose a character');
            expect(this.player1).toBeAbleToSelect(this.matsuBerserker);
            this.player1.clickCard(this.matsuBerserker);
            expect(this.player2).toHavePrompt('Give an honor to your opponent?');
            expect(this.player2).toHavePromptButton('Yes');
            expect(this.player2).toHavePromptButton('No');
            this.player2.clickPrompt('No');
            expect(this.getChatLogs(1)).toContain('player1 plays Called to War to place a fate on Matsu Berserker');

            expect(this.matsuBerserker.fate).toBe(1);
            expect(this.player1.honor).toBe(10);
            expect(this.player2.honor).toBe(10);
        });

        it('should not work if neither player has a bushi', function() {
            this.player2.moveCard(this.shibaTsukune, 'dynasty discard pile');
            this.player1.moveCard(this.matsuBerserker, 'dynasty discard pile');
            expect(this.player1).toHavePrompt('Action Window');
            this.player1.clickCard(this.calledToWar);
            expect(this.player1).toHavePrompt('Action Window');
        });

        it('should work if only opponent has a bushi', function() {
            this.player1.moveCard(this.matsuBerserker, 'dynasty discard pile');
            expect(this.player1).toHavePrompt('Action Window');
            this.player1.clickCard(this.calledToWar);
            expect(this.player1).toHavePrompt('Choose a character');
            expect(this.player1).toBeAbleToSelect(this.shibaTsukune);
            this.player1.clickCard(this.shibaTsukune);
            this.player2.clickPrompt('Yes');
            expect(this.player2).toHavePrompt('Choose a character');
            expect(this.player2).toBeAbleToSelect(this.shibaTsukune);
            this.player2.clickCard(this.shibaTsukune);
            expect(this.getChatLogs(1)).toContain('player1 plays Called to War to place a fate on Shiba Tsukune.  player2 gives player1 1 honor to place a fate on Shiba Tsukune');
            expect(this.shibaTsukune.fate).toBe(2);
        });
    });
});
