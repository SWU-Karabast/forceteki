describe('Roadside Inn', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    honor: 10,
                    fate: 10,
                    inPlay: ['matsu-berserker', 'ikoma-prodigy'],
                    dynastyDiscard: ['roadside-inn']
                },
                player2: {
                    honor: 10,
                    fate: 10,
                    inPlay: ['solemn-scholar', 'doji-whisperer']
                }
            });

            this.matsuBerserker = this.player1.findCardByName('matsu-berserker');
            this.ikomaProdigy = this.player1.findCardByName('ikoma-prodigy');
            this.inn = this.player1.placeCardInProvince('roadside-inn', 'province 1');

            this.solemnScholar = this.player2.findCardByName('solemn-scholar');
            this.dojiWhisperer = this.player2.findCardByName('doji-whisperer');

            this.noMoreActions();
            this.player1.passConflict();
            this.noMoreActions();
            this.player2.passConflict();
            this.noMoreActions();
            this.player1.passConflict();
            this.noMoreActions();
            this.player2.passConflict();
        });

        it('should react when the fate phase starts, before characters are discarded', function() {
            this.noMoreActions();
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.inn);
        });

        it('should allow selecting a character and move a fate from the pool onto them', function() {
            this.noMoreActions();
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.inn);
            this.player1.clickCard(this.inn);
            expect(this.player1).toHavePrompt('Choose a character');
            expect(this.player1).toBeAbleToSelect(this.matsuBerserker);
            expect(this.player1).toBeAbleToSelect(this.ikomaProdigy);
            expect(this.player1).toBeAbleToSelect(this.dojiWhisperer);
            expect(this.player1).toBeAbleToSelect(this.solemnScholar);
            this.player1.clickCard(this.matsuBerserker);
            expect(this.player2).toHavePrompt('Give an honor to your opponent?');
            expect(this.player2).toHavePromptButton('Yes');
            expect(this.player2).toHavePromptButton('No');
            this.player2.clickPrompt('Yes');
            expect(this.getChatLogs(1)).toContain('player2 chooses to give player1 1 honor');
            expect(this.player2).toHavePrompt('Choose a character');
            expect(this.player2).toBeAbleToSelect(this.matsuBerserker);
            expect(this.player2).toBeAbleToSelect(this.ikomaProdigy);
            expect(this.player2).toBeAbleToSelect(this.dojiWhisperer);
            expect(this.player2).toBeAbleToSelect(this.solemnScholar);
            this.player2.clickCard(this.dojiWhisperer);
            expect(this.getChatLogs(1)).toContain('player1 uses Roadside Inn to place a fate from their pool on Matsu Berserker.  player2 gives player1 1 honor to place a fate from their pool on Doji Whisperer');

            expect(this.matsuBerserker.fate).toBe(1);
            expect(this.dojiWhisperer.fate).toBe(1);

            expect(this.player1.honor).toBe(11);
            expect(this.player2.honor).toBe(9);

            expect(this.player1.fate).toBe(9);
            expect(this.player2.fate).toBe(9);
        });

        it('should work with standard fate phase fate business', function() {
            this.noMoreActions();
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.inn);
            this.player1.clickCard(this.inn);
            expect(this.player1).toHavePrompt('Choose a character');
            expect(this.player1).toBeAbleToSelect(this.matsuBerserker);
            expect(this.player1).toBeAbleToSelect(this.ikomaProdigy);
            expect(this.player1).toBeAbleToSelect(this.dojiWhisperer);
            expect(this.player1).toBeAbleToSelect(this.solemnScholar);
            this.player1.clickCard(this.matsuBerserker);
            expect(this.player2).toHavePrompt('Give an honor to your opponent?');
            expect(this.player2).toHavePromptButton('Yes');
            expect(this.player2).toHavePromptButton('No');
            this.player2.clickPrompt('Yes');
            expect(this.player2).toHavePrompt('Choose a character');
            expect(this.player2).toBeAbleToSelect(this.matsuBerserker);
            expect(this.player2).toBeAbleToSelect(this.ikomaProdigy);
            expect(this.player2).toBeAbleToSelect(this.dojiWhisperer);
            expect(this.player2).toBeAbleToSelect(this.solemnScholar);
            this.player2.clickCard(this.dojiWhisperer);
            expect(this.getChatLogs(1)).toContain('player1 uses Roadside Inn to place a fate from their pool on Matsu Berserker.  player2 gives player1 1 honor to place a fate from their pool on Doji Whisperer');

            expect(this.matsuBerserker.fate).toBe(1);
            expect(this.dojiWhisperer.fate).toBe(1);

            expect(this.player1.honor).toBe(11);
            expect(this.player2.honor).toBe(9);

            expect(this.player1.fate).toBe(9);
            expect(this.player2.fate).toBe(9);

            this.player1.clickPrompt('Done');
            this.player2.clickPrompt('Done');

            expect(this.matsuBerserker.fate).toBe(0);
            expect(this.dojiWhisperer.fate).toBe(0);

            expect(this.matsuBerserker.location).toBe('play area');
            expect(this.ikomaProdigy.location).toBe('dynasty discard pile');
            expect(this.solemnScholar.location).toBe('dynasty discard pile');
            expect(this.dojiWhisperer.location).toBe('play area');
        });


        it('should not allow selecting a character if you have no fate', function() {
            this.player2.fate = 0;
            this.noMoreActions();
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.inn);
            this.player1.clickCard(this.inn);
            expect(this.player1).toHavePrompt('Choose a character');
            expect(this.player1).toBeAbleToSelect(this.matsuBerserker);
            expect(this.player1).toBeAbleToSelect(this.ikomaProdigy);
            expect(this.player1).toBeAbleToSelect(this.dojiWhisperer);
            expect(this.player1).toBeAbleToSelect(this.solemnScholar);
            this.player1.clickCard(this.matsuBerserker);
            expect(this.player2).not.toHavePrompt('Give an honor to your opponent?');
            expect(this.getChatLogs(1)).toContain('player1 uses Roadside Inn to place a fate from their pool on Matsu Berserker');

            expect(this.matsuBerserker.fate).toBe(1);

            expect(this.player1.honor).toBe(10);
            expect(this.player2.honor).toBe(10);

            expect(this.player1.fate).toBe(9);
            expect(this.player2.fate).toBe(0);
        });

        it('should allow opponent to choose not to select a character', function() {
            this.noMoreActions();
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.inn);
            this.player1.clickCard(this.inn);

            expect(this.player1).toHavePrompt('Choose a character');
            expect(this.player1).toBeAbleToSelect(this.matsuBerserker);
            this.player1.clickCard(this.matsuBerserker);

            expect(this.player2).toHavePrompt('Give an honor to your opponent?');
            expect(this.player2).toHavePromptButton('Yes');
            expect(this.player2).toHavePromptButton('No');
            this.player2.clickPrompt('No');
            expect(this.player2).not.toHavePrompt('Choose a character');
            expect(this.getChatLogs(1)).toContain('player1 uses Roadside Inn to place a fate from their pool on Matsu Berserker');

            expect(this.matsuBerserker.fate).toBe(1);
            expect(this.dojiWhisperer.fate).toBe(0);

            expect(this.player1.honor).toBe(10);
            expect(this.player2.honor).toBe(10);
        });

        it('should not work if no one has a character', function() {
            this.player1.moveCard(this.matsuBerserker, 'dynasty discard pile');
            this.player1.moveCard(this.ikomaProdigy, 'dynasty discard pile');
            this.player2.moveCard(this.solemnScholar, 'dynasty discard pile');
            this.player2.moveCard(this.dojiWhisperer, 'dynasty discard pile');
            this.noMoreActions();

            expect(this.player1).not.toHavePrompt('Triggered Abilities');
        });
    });
});
