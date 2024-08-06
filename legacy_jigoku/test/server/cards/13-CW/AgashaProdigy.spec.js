describe('Agasha Prodigy', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    honor: 10,
                    inPlay: ['agasha-prodigy', 'ikoma-prodigy'],
                    hand: ['fine-katana', 'tattooed-wanderer', 'tattered-missive']
                },
                player2: {
                    honor: 10,
                    inPlay: ['righteous-magistrate'],
                    hand: ['fine-katana', 'mirumoto-s-fury']
                }
            });

            this.agashaProdigy = this.player1.findCardByName('agasha-prodigy');
            this.ikomaProdigy = this.player1.findCardByName('ikoma-prodigy');
            this.katana = this.player1.findCardByName('fine-katana');
            this.wanderer = this.player1.findCardByName('tattooed-wanderer');
            this.missive = this.player1.findCardByName('tattered-missive');

            this.magistrate = this.player2.findCardByName('righteous-magistrate');
            this.katana2 = this.player2.findCardByName('fine-katana');
            this.fury = this.player2.findCardByName('mirumoto-s-fury');

            this.player1.reduceDeckToNumber('conflict deck', 0);
            this.player2.reduceDeckToNumber('conflict deck', 0);
        });

        it('should allow each player to choose a character', function () {
            this.player1.moveCard(this.katana, 'conflict deck');
            this.player2.moveCard(this.katana2, 'conflict deck');

            this.player1.clickCard(this.agashaProdigy);
            expect(this.player1).toHavePrompt('Choose a character');
            expect(this.player1).toBeAbleToSelect(this.agashaProdigy);
            expect(this.player1).toBeAbleToSelect(this.ikomaProdigy);
            expect(this.player1).toBeAbleToSelect(this.magistrate);
            this.player1.clickCard(this.agashaProdigy);
            expect(this.player2).toHavePrompt('Give an honor to your opponent?');
            expect(this.player2).toHavePromptButton('Yes');
            expect(this.player2).toHavePromptButton('No');
            this.player2.clickPrompt('Yes');
            expect(this.getChatLogs(1)).toContain('player2 chooses to give player1 1 honor');
            expect(this.player2).toHavePrompt('Choose a character');
            expect(this.player2).toBeAbleToSelect(this.agashaProdigy);
            expect(this.player2).toBeAbleToSelect(this.ikomaProdigy);
            expect(this.player2).toBeAbleToSelect(this.magistrate);
        });

        it('should allow opponent to choose not to select a character', function () {
            this.player1.moveCard(this.katana, 'conflict deck');
            this.player2.moveCard(this.katana2, 'conflict deck');

            this.player1.clickCard(this.agashaProdigy);
            this.player1.clickCard(this.agashaProdigy);

            expect(this.player2).toHavePrompt('Give an honor to your opponent?');
            expect(this.player2).toHavePromptButton('Yes');
            expect(this.player2).toHavePromptButton('No');
            this.player2.clickPrompt('No');
            expect(this.player2).toHavePrompt('Action Window');
        });

        it('should discard the top card of each deck then try to attach it', function () {
            this.player1.moveCard(this.katana, 'conflict deck');
            this.player2.moveCard(this.katana2, 'conflict deck');

            this.player1.clickCard(this.agashaProdigy);
            this.player1.clickCard(this.agashaProdigy);
            this.player2.clickPrompt('Yes');
            this.player2.clickCard(this.magistrate);

            expect(this.player1.honor).toBe(11);
            expect(this.player2.honor).toBe(9);

            expect(this.agashaProdigy.attachments).toContain(this.katana);
            expect(this.magistrate.attachments).toContain(this.katana2);

            expect(this.getChatLogs(10)).toContain(
                'player1 uses Agasha Prodigy to discard the top card of their deck and attempt to attach it to Agasha Prodigy.  player2 gives player1 1 honor to discard the top card of their deck and attempt to attach it to Righteous Magistrate'
            );
        });

        it('should not make the opponent pay the honor or discard the card if they choose not to select a character', function () {
            this.player1.moveCard(this.wanderer, 'conflict deck');
            this.player2.moveCard(this.katana2, 'conflict deck');

            this.player1.clickCard(this.agashaProdigy);
            this.player1.clickCard(this.agashaProdigy);
            this.player2.clickPrompt('No');

            expect(this.player1.honor).toBe(10);
            expect(this.player2.honor).toBe(10);

            expect(this.wanderer.location).toBe('conflict discard pile');
            expect(this.katana2.location).toBe('conflict deck');
            expect(this.getChatLogs(10)).toContain(
                'player1 uses Agasha Prodigy to discard the top card of their deck and attempt to attach it to Agasha Prodigy'
            );
        });

        it('should fail to attach if the top card cannot legally attach', function () {
            this.player1.moveCard(this.missive, 'conflict deck');
            this.player2.moveCard(this.fury, 'conflict deck');

            this.player1.clickCard(this.agashaProdigy);
            this.player1.clickCard(this.agashaProdigy);
            this.player2.clickPrompt('Yes');
            this.player2.clickCard(this.magistrate);

            expect(this.player1.honor).toBe(11);
            expect(this.player2.honor).toBe(9);

            expect(this.missive.location).toBe('conflict discard pile');
            expect(this.fury.location).toBe('conflict discard pile');

            expect(this.getChatLogs(10)).toContain(
                'player1 uses Agasha Prodigy to discard the top card of their deck and attempt to attach it to Agasha Prodigy.  player2 gives player1 1 honor to discard the top card of their deck and attempt to attach it to Righteous Magistrate'
            );
        });

        it('should not be able to be triggered if both decks are empty', function () {
            this.player1.clickCard(this.agashaProdigy);
            expect(this.player1).toHavePrompt('Action Window');
        });

        it('should not be able to be triggered if your deck is empty', function () {
            this.player2.moveCard(this.fury, 'conflict deck');
            this.player1.clickCard(this.agashaProdigy);
            expect(this.player1).toHavePrompt('Action Window');
        });

        it('should be able to be triggered if your opponent\'s deck is empty, but they shouldn\'t be allowed to choose to give you an honor', function () {
            this.player1.moveCard(this.katana, 'conflict deck');
            this.player1.clickCard(this.agashaProdigy);
            expect(this.player1).toHavePrompt('Choose a character');
            this.player1.clickCard(this.agashaProdigy);
            expect(this.player2).toHavePrompt('Action Window');
        });

        it('should not allow choosing a character if you cannot give the honor', function () {
            this.player1.moveCard(this.katana, 'conflict deck');
            this.player2.moveCard(this.katana2, 'conflict deck');
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.agashaProdigy],
                defenders: [this.magistrate],
                type: 'military'
            });

            this.player2.pass();
            this.player1.clickCard(this.agashaProdigy);
            expect(this.player1).toHavePrompt('Choose a character');
            this.player1.clickCard(this.agashaProdigy);
            expect(this.player2).toHavePrompt('Conflict Action Window');
            expect(this.getChatLogs(3)).toContain(
                'player1 uses Agasha Prodigy to discard the top card of their deck and attempt to attach it to Agasha Prodigy'
            );

            expect(this.agashaProdigy.attachments).toContain(this.katana);
            expect(this.katana2.location).toBe('conflict deck');
            expect(this.player1.honor).toBe(10);
            expect(this.player2.honor).toBe(10);
        });
    });
});
